# SoloWay Backups

What is worth backing up, how the automated backup works, and how to restore.

## What state exists, and where it lives

| Data | Where | Backup strategy |
|------|-------|-----------------|
| PostgreSQL database (users, itineraries, orders, buddy links, reviews, waitlist, ...) | Supabase | **Nightly `pg_dump` to AWS S3** (this doc) + Supabase Pro daily backups |
| Application code | GitHub (`MichaelSchaaf34/SoloWay`) | Git history + clones; nothing extra needed |
| Production secrets (env vars) | Render / Vercel / GitHub dashboards | **Manual encrypted copy** — see "Secrets backup" below |
| Redis (cache, refresh tokens, rate-limit counters) | Upstash | Intentionally not backed up: ephemeral. Losing it logs users out, nothing more |
| Media/uploads | None (images are external Unsplash URLs) | Nothing to back up today; revisit if user uploads ship |
| Stripe data (customers, payments) | Stripe | Stripe retains it; our `orders`/`payments` tables are the local mirror and are in the DB dump |

The database is the only irreplaceable asset. Everything below focuses on it.

## How the automated backup works

[.github/workflows/db-backup.yml](.github/workflows/db-backup.yml) runs nightly at 07:20 UTC (and on demand via **Actions → Nightly database backup → Run workflow**):

1. `pg_dump --format=custom --schema=public` against the production database.
2. `pg_restore --list` sanity-checks the archive is readable.
3. Upload to `s3://<bucket>/postgres/<YYYY>/<MM>/soloway-<timestamp>.dump`.

Why this exists even with Supabase Pro backups: the S3 copy is **off-platform**. A Supabase account problem, accidental project deletion, or a billing lapse cannot take your only backup with it. It is also the seed for any future migration off Supabase (see [MIGRATION.md](MIGRATION.md)).

## One-time AWS setup (~15 minutes)

Prerequisite: an AWS account and the AWS CLI logged in as an admin user (`aws configure`). Region examples use `us-east-1`; Supabase US-East projects make that the lowest-latency choice.

### 1. Create the bucket

```bash
aws s3api create-bucket --bucket soloway-db-backups --region us-east-1

aws s3api put-public-access-block --bucket soloway-db-backups \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-versioning --bucket soloway-db-backups \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption --bucket soloway-db-backups \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

(Bucket names are global; if `soloway-db-backups` is taken, append a suffix and use that name everywhere below.)

### 2. Lifecycle policy — keep costs at pennies

Save as `lifecycle.json`:

```json
{
  "Rules": [
    {
      "ID": "tier-and-expire-backups",
      "Status": "Enabled",
      "Filter": { "Prefix": "postgres/" },
      "Transitions": [{ "Days": 30, "StorageClass": "GLACIER" }],
      "Expiration": { "Days": 365 },
      "NoncurrentVersionExpiration": { "NoncurrentDays": 30 }
    }
  ]
}
```

```bash
aws s3api put-bucket-lifecycle-configuration --bucket soloway-db-backups \
  --lifecycle-configuration file://lifecycle.json
```

Result: 30 days of instantly-restorable nightlies, then cheap Glacier copies up to a year. At launch-scale DB sizes the total cost is well under $1/month.

### 3. IAM user that can only upload

Save as `backup-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UploadBackupsOnly",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::soloway-db-backups/postgres/*"
    }
  ]
}
```

```bash
aws iam create-user --user-name soloway-backup-writer
aws iam put-user-policy --user-name soloway-backup-writer \
  --policy-name upload-backups-only --policy-document file://backup-policy.json
aws iam create-access-key --user-name soloway-backup-writer
```

Put-only matters: if the GitHub secrets ever leak, the key cannot read, delete, or overwrite history (versioning keeps prior versions even on same-key uploads).

### 4. GitHub repository secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|--------|-------|
| `BACKUP_DATABASE_URL` | Supabase connection string — **direct or session pooler (port 5432)**, not the transaction pooler (6543); `pg_dump` needs session semantics. Supabase Dashboard → Connect → Session pooler |
| `AWS_ACCESS_KEY_ID` | From step 3 |
| `AWS_SECRET_ACCESS_KEY` | From step 3 |
| `AWS_REGION` | `us-east-1` (or your bucket's region) |
| `BACKUP_S3_BUCKET` | `soloway-db-backups` |

### 5. Verify

Run the workflow manually (**Actions → Nightly database backup → Run workflow**) and confirm a `.dump` object appears under `postgres/<year>/<month>/` in the bucket.

## Restore runbook

Restores go to a **fresh database first** — never straight over production while diagnosing.

```bash
# 1. Download the backup (any machine with AWS CLI + postgresql-client 17)
aws s3 cp s3://soloway-db-backups/postgres/2026/07/soloway-<timestamp>.dump .

# If the object is already in Glacier, request retrieval first (takes hours):
#   aws s3api restore-object --bucket soloway-db-backups \
#     --key postgres/2026/07/soloway-<timestamp>.dump \
#     --restore-request '{"Days":3,"GlacierJobParameters":{"Tier":"Standard"}}'

# 2. Create the target: a new Supabase project (or any Postgres with PostGIS).
#    Enable the required extensions once (Supabase has them preinstalled;
#    plain Postgres needs: CREATE EXTENSION postgis; CREATE EXTENSION "uuid-ossp";)

# 3. Restore the public schema
pg_restore --clean --if-exists --no-owner --no-privileges \
  -d "$TARGET_DATABASE_URL" soloway-<timestamp>.dump

# 4. Smoke-check
psql "$TARGET_DATABASE_URL" -c "SELECT count(*) FROM users;"
psql "$TARGET_DATABASE_URL" -c "SELECT count(*) FROM itineraries;"
psql "$TARGET_DATABASE_URL" -c "SELECT name FROM migrations ORDER BY id;"
```

To cut production over to the restored database: update `DATABASE_URL` (and the `SUPABASE_*` keys if it is a new Supabase project) in Render, redeploy, and verify `/health` reports `database: ok`.

**Test the restore quarterly.** A backup that has never been restored is a hope, not a backup. The whole runbook takes ~15 minutes against a scratch Supabase project.

## Secrets backup

Losing the production env vars is as disruptive as losing the database (Stripe keys, JWT secrets — rotating everything mid-outage is painful). After every change to production configuration:

1. Keep a copy of all production env values in a password manager entry (1Password/Bitwarden secure note) — **not** in a file in this repo.
2. The authoritative list of required keys lives in [backend/.env.example](backend/.env.example) and `validateConfig()` in [backend/src/config/index.js](backend/src/config/index.js); frontend keys in [.env.example](.env.example).

Note: rotating `JWT_SECRET`/`JWT_REFRESH_SECRET` invalidates all sessions; rotating Stripe/Twilio/Resend keys does not affect stored data.
