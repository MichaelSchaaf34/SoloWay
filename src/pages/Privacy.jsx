import React, { useEffect } from 'react';
import LegalPage from '../components/LegalPage';

const LAST_UPDATED = 'April 16, 2026';

const Privacy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | SoloWay';
  }, []);

  return (
    <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p className="lead">
        SoloWay ("we", "our", "us") takes your privacy seriously. This policy explains what we
        collect, why we collect it, and the choices you have. This is a plain-English summary,
        not a contract — your legal rights are described throughout.
      </p>

      <h2>1. Information we collect</h2>
      <p>We collect three kinds of information:</p>
      <ul>
        <li>
          <strong>Information you give us.</strong> Account details (email, display name, password hash),
          itinerary content (destinations, dates, activities, notes), and optional phone number when
          you join a buddy event.
        </li>
        <li>
          <strong>Information we collect automatically.</strong> Basic device and session data
          (browser type, IP address, timestamps) and aggregate usage metrics so we can improve
          the product.
        </li>
        <li>
          <strong>Information from third parties.</strong> When you use SMS verification for the
          buddy system, we receive confirmation metadata from our SMS provider — but not your
          message history.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To provide and secure your account and the SoloWay service.</li>
        <li>To power itineraries, buddy invites, and safety features you opt into.</li>
        <li>To send transactional emails (account confirmations, security alerts, waitlist updates).</li>
        <li>To detect and prevent fraud, abuse, and spam.</li>
        <li>To improve product quality through anonymous, aggregate analytics.</li>
      </ul>
      <p>
        We <strong>do not</strong> sell your personal information. We <strong>do not</strong> use
        your itinerary content for advertising.
      </p>

      <h2>3. Sharing</h2>
      <p>We share information only when necessary:</p>
      <ul>
        <li>With infrastructure providers (hosting, database, SMS, email) strictly to operate the service.</li>
        <li>With buddies you explicitly invite, limited to the details you choose to share.</li>
        <li>When required by law, court order, or to protect the safety of users or the public.</li>
      </ul>

      <h2>4. Your rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>Access, correct, or delete your personal information.</li>
        <li>Export your data in a machine-readable format.</li>
        <li>Withdraw consent and close your account at any time.</li>
        <li>Object to or restrict certain uses of your data.</li>
      </ul>
      <p>
        To exercise any of these rights, email <a href="mailto:privacy@soloway.app">privacy@soloway.app</a>.
      </p>

      <h2>5. Security</h2>
      <p>
        Passwords are hashed with industry-standard algorithms. Sessions use signed, short-lived
        tokens. Transport is encrypted with TLS. No system is perfect — if we ever discover a
        breach affecting your data, we will notify you promptly.
      </p>

      <h2>6. Retention</h2>
      <p>
        We keep account data while your account is active and for a reasonable period afterward
        to comply with our legal obligations. You can request deletion at any time.
      </p>

      <h2>7. Children</h2>
      <p>
        SoloWay is not intended for anyone under 16. If you believe a child has provided us with
        personal information, please contact us and we will remove it.
      </p>

      <h2>8. Changes</h2>
      <p>
        When we make material changes to this policy we will post a notice in-app and update the
        "Last updated" date above.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions? Reach us at <a href="mailto:privacy@soloway.app">privacy@soloway.app</a>.
      </p>

      <p className="disclaimer">
        <strong>Draft notice:</strong> this policy is a skeleton document for pre-launch. It is
        not legal advice and should be reviewed by counsel before SoloWay handles production
        user data at scale.
      </p>
    </LegalPage>
  );
};

export default Privacy;
