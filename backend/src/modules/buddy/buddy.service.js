import crypto from 'node:crypto';
import { query, transaction } from '../../shared/database/index.js';
import { config } from '../../config/index.js';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildQrUrl(token) {
  const base = process.env.APP_BASE_URL || 'http://localhost:5173';
  return `${base}/join/${token}`;
}

// ─── HOST: Create Invite ────────────────────────────────────────────

export async function createInvite(hostUserId, itineraryItemId, options = {}) {
  const partySizeCap = options.party_size_cap || 5;
  const ttlMinutes = options.token_ttl_minutes || 15;

  const existingResult = await query(
    `SELECT id, token, token_expires_at, status
     FROM buddy_links
     WHERE host_user_id = $1 AND itinerary_item_id = $2 AND status = 'pending'
     ORDER BY created_at DESC LIMIT 1`,
    [hostUserId, itineraryItemId]
  );

  if (existingResult.rows.length > 0) {
    const existing = existingResult.rows[0];
    if (new Date(existing.token_expires_at) > new Date()) {
      return {
        token: existing.token,
        qr_url: buildQrUrl(existing.token),
        expires_at: existing.token_expires_at,
        status: existing.status,
        already_exists: true,
      };
    }
    await query(`UPDATE buddy_links SET status = 'expired' WHERE id = $1`, [existing.id]);
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const result = await query(
    `INSERT INTO buddy_links (token, itinerary_item_id, host_user_id, party_size_cap, token_expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, token, status, token_expires_at`,
    [token, itineraryItemId, hostUserId, partySizeCap, expiresAt]
  );

  const link = result.rows[0];

  await query(
    `INSERT INTO buddy_link_log (buddy_link_id, actor_user_id, action, metadata)
     VALUES ($1, $2, 'created', $3)`,
    [link.id, hostUserId, JSON.stringify({ party_size_cap: partySizeCap, ttl_minutes: ttlMinutes })]
  );

  return {
    token: link.token,
    qr_url: buildQrUrl(link.token),
    expires_at: link.token_expires_at,
    status: link.status,
    already_exists: false,
  };
}

// ─── SHARED: Get Invite by Token ────────────────────────────────────

export async function getInviteByToken(token) {
  const result = await query(
    `SELECT bl.*, u.display_name AS host_name,
            ii.title AS event_title, ii.description AS event_description,
            ii.location_name AS event_location_name,
            ii.scheduled_date AS event_start_time, ii.end_time AS event_end_time
     FROM buddy_links bl
     JOIN users u ON u.id = bl.host_user_id
     JOIN itinerary_items ii ON ii.id = bl.itinerary_item_id
     WHERE bl.token = $1`,
    [token]
  );

  if (result.rows.length === 0) {
    return { valid: false, reason: 'invite_not_found' };
  }

  const link = result.rows[0];

  if (link.status === 'cancelled') {
    return { valid: false, reason: 'invite_cancelled' };
  }
  if (link.status === 'expired' || new Date(link.token_expires_at) < new Date()) {
    if (link.status !== 'expired') {
      await query(`UPDATE buddy_links SET status = 'expired' WHERE id = $1`, [link.id]);
    }
    return { valid: false, reason: 'invite_expired' };
  }
  if (link.current_party_count >= link.party_size_cap) {
    return { valid: false, reason: 'party_full' };
  }

  return {
    valid: true,
    token: link.token,
    host_name: link.host_name,
    spots_remaining: link.party_size_cap - link.current_party_count,
    event: {
      title: link.event_title,
      description: link.event_description,
      location_name: link.event_location_name,
      start_time: link.event_start_time,
      end_time: link.event_end_time,
    },
  };
}

// ─── HOST: Cancel Invite ────────────────────────────────────────────

export async function cancelInvite(token, userId) {
  const result = await query(
    `UPDATE buddy_links SET status = 'cancelled'
     WHERE token = $1 AND host_user_id = $2 AND status = 'pending'
     RETURNING id`,
    [token, userId]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Invite not found or already processed'), { status: 404 });
  }

  await query(
    `INSERT INTO buddy_link_log (buddy_link_id, actor_user_id, action) VALUES ($1, $2, 'cancelled')`,
    [result.rows[0].id, userId]
  );

  return { success: true };
}

// ─── HOST: Close Link ───────────────────────────────────────────────

export async function closeLink(linkId, userId) {
  const result = await query(
    `UPDATE buddy_links SET status = 'expired'
     WHERE id = $1 AND host_user_id = $2 AND status = 'active'
     RETURNING id`,
    [linkId, userId]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Link not found or not active'), { status: 404 });
  }

  await query(
    `INSERT INTO buddy_link_log (buddy_link_id, actor_user_id, action) VALUES ($1, $2, 'closed')`,
    [result.rows[0].id, userId]
  );

  return { success: true };
}

// ─── HOST: User History ─────────────────────────────────────────────

export async function getUserHistory(userId, options = {}) {
  const page = parseInt(options.page, 10) || 1;
  const limit = Math.min(parseInt(options.limit, 10) || 20, 50);
  const offset = (page - 1) * limit;

  let whereClause = `WHERE bl.host_user_id = $1`;
  const params = [userId];
  let paramIndex = 2;

  if (options.status) {
    whereClause += ` AND bl.status = $${paramIndex}`;
    params.push(options.status);
    paramIndex++;
  }

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM buddy_links bl ${whereClause}`,
    params
  );
  const total = countResult.rows[0].total;

  const linksResult = await query(
    `SELECT bl.id, bl.token, bl.status, bl.party_size_cap, bl.current_party_count,
            bl.created_at, bl.token_expires_at,
            ii.title AS item_title, ii.location_name AS item_location,
            gu.display_name AS guest_display_name,
            gu.phone_number AS guest_phone
     FROM buddy_links bl
     JOIN itinerary_items ii ON ii.id = bl.itinerary_item_id
     LEFT JOIN guest_users gu ON gu.id = bl.guest_user_id
     ${whereClause}
     ORDER BY bl.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const links = linksResult.rows.map(row => ({
    id: row.id,
    token: row.token,
    status: row.status,
    role: 'host',
    party_size_cap: row.party_size_cap,
    current_party_count: row.current_party_count,
    created_at: row.created_at,
    itinerary_items: {
      title: row.item_title,
      location_name: row.item_location,
    },
    guest_users: row.guest_display_name ? {
      display_name: row.guest_display_name,
      phone_last_four: row.guest_phone?.slice(-4) || null,
    } : null,
  }));

  return {
    links,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

// ─── HOST: Link Detail ──────────────────────────────────────────────

export async function getLinkDetail(linkId, userId) {
  const linkResult = await query(
    `SELECT bl.*, ii.title AS item_title, ii.location_name AS item_location,
            gu.display_name AS guest_display_name
     FROM buddy_links bl
     JOIN itinerary_items ii ON ii.id = bl.itinerary_item_id
     LEFT JOIN guest_users gu ON gu.id = bl.guest_user_id
     WHERE bl.id = $1 AND bl.host_user_id = $2`,
    [linkId, userId]
  );

  if (linkResult.rows.length === 0) {
    throw Object.assign(new Error('Link not found'), { status: 404 });
  }

  const logResult = await query(
    `SELECT action, metadata, created_at FROM buddy_link_log
     WHERE buddy_link_id = $1 ORDER BY created_at ASC`,
    [linkId]
  );

  const link = linkResult.rows[0];

  return {
    ...link,
    itinerary_items: { title: link.item_title, location_name: link.item_location },
    guest_users: link.guest_display_name ? { display_name: link.guest_display_name } : null,
    log: logResult.rows,
  };
}

// ─── GUEST: Initiate Phone Verification ─────────────────────────────

export async function initiateGuestVerification(token, phoneNumber, displayName) {
  const invite = await getInviteByToken(token);
  if (!invite.valid) {
    throw Object.assign(new Error(invite.reason), { status: 400 });
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const existingGuest = await query(
    `SELECT id FROM guest_users WHERE phone_number = $1`,
    [phoneNumber]
  );

  let guestId;
  if (existingGuest.rows.length > 0) {
    guestId = existingGuest.rows[0].id;
    await query(
      `UPDATE guest_users
       SET verification_code = $1, verification_expires_at = $2,
           verification_attempts = 0, display_name = COALESCE($3, display_name)
       WHERE id = $4`,
      [code, expiresAt, displayName, guestId]
    );
  } else {
    const insertResult = await query(
      `INSERT INTO guest_users (phone_number, display_name, verification_code, verification_expires_at)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [phoneNumber, displayName, code, expiresAt]
    );
    guestId = insertResult.rows[0].id;
  }

  if (config.env === 'development') {
    console.log(`[DEV SMS] Verification code for ${phoneNumber}: ${code}`);
  }

  return { guest_id: guestId, message: 'Verification code sent' };
}

// ─── GUEST: Confirm Code & Activate ─────────────────────────────────

export async function confirmGuestAndActivate(token, phoneNumber, code) {
  return transaction(async (client) => {
    const guestResult = await client.query(
      `SELECT id, verification_code, verification_expires_at, verification_attempts
       FROM guest_users WHERE phone_number = $1`,
      [phoneNumber]
    );

    if (guestResult.rows.length === 0) {
      throw Object.assign(new Error('Guest not found'), { status: 404 });
    }

    const guest = guestResult.rows[0];

    if (guest.verification_attempts >= 3) {
      throw Object.assign(new Error('Too many attempts. Request a new code.'), { status: 429 });
    }

    await client.query(
      `UPDATE guest_users SET verification_attempts = verification_attempts + 1 WHERE id = $1`,
      [guest.id]
    );

    if (new Date(guest.verification_expires_at) < new Date()) {
      throw Object.assign(new Error('Verification code expired'), { status: 400 });
    }

    if (guest.verification_code !== code) {
      throw Object.assign(new Error('Invalid verification code'), { status: 400 });
    }

    await client.query(
      `UPDATE guest_users SET phone_verified = true, verification_code = NULL WHERE id = $1`,
      [guest.id]
    );

    const linkResult = await client.query(
      `SELECT bl.id, bl.status, bl.party_size_cap, bl.current_party_count,
              ii.title AS event_title, ii.location_name AS event_location,
              ii.scheduled_date AS event_start_time
       FROM buddy_links bl
       JOIN itinerary_items ii ON ii.id = bl.itinerary_item_id
       WHERE bl.token = $1 AND bl.status = 'pending'`,
      [token]
    );

    if (linkResult.rows.length === 0) {
      throw Object.assign(new Error('Invite no longer available'), { status: 400 });
    }

    const link = linkResult.rows[0];

    if (link.current_party_count >= link.party_size_cap) {
      throw Object.assign(new Error('Party is full'), { status: 400 });
    }

    await client.query(
      `UPDATE buddy_links
       SET guest_user_id = $1, status = 'active', current_party_count = current_party_count + 1
       WHERE id = $2`,
      [guest.id, link.id]
    );

    await client.query(
      `INSERT INTO buddy_link_log (buddy_link_id, actor_guest_id, action) VALUES ($1, $2, 'activated')`,
      [link.id, guest.id]
    );

    return {
      success: true,
      message: "You're in! Have a great time.",
      event: {
        title: link.event_title,
        location_name: link.event_location,
        start_time: link.event_start_time,
      },
    };
  });
}

// ─── POST-EVENT: Request Connection ─────────────────────────────────

export async function requestConnection(linkId, userId) {
  const linkResult = await query(
    `SELECT id, host_user_id, guest_user_id, guest_registered_user_id, status
     FROM buddy_links WHERE id = $1`,
    [linkId]
  );

  if (linkResult.rows.length === 0) {
    throw Object.assign(new Error('Link not found'), { status: 404 });
  }

  const link = linkResult.rows[0];

  if (link.status !== 'expired' && link.status !== 'active') {
    throw Object.assign(new Error('Connection requests are only available after the event'), { status: 400 });
  }

  if (link.host_user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }

  const existing = await query(
    `SELECT id FROM buddy_connections WHERE buddy_link_id = $1 AND user_id = $2`,
    [linkId, userId]
  );

  if (existing.rows.length > 0) {
    return { already_exists: true, connection_id: existing.rows[0].id };
  }

  const result = await query(
    `INSERT INTO buddy_connections (buddy_link_id, user_id, connected_to_guest_id)
     VALUES ($1, $2, $3) RETURNING id`,
    [linkId, userId, link.guest_user_id]
  );

  return { connection_id: result.rows[0].id, status: 'pending', already_exists: false };
}

// ─── POST-EVENT: Respond to Connection ──────────────────────────────

export async function respondToConnection(connectionId, userId, action) {
  const result = await query(
    `SELECT bc.*, bl.guest_user_id, bl.host_user_id
     FROM buddy_connections bc
     JOIN buddy_links bl ON bl.id = bc.buddy_link_id
     WHERE bc.id = $1`,
    [connectionId]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Connection not found'), { status: 404 });
  }

  await query(
    `UPDATE buddy_connections SET status = $1 WHERE id = $2`,
    [action, connectionId]
  );

  return { success: true, status: action };
}
