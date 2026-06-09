import React, { useEffect } from 'react';
import LegalPage from '../components/LegalPage';

const LAST_UPDATED = 'April 16, 2026';

const Terms = () => {
  useEffect(() => {
    document.title = 'Terms of Service | SoloWay';
  }, []);

  return (
    <LegalPage title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p className="lead">
        These terms govern your use of SoloWay. By creating an account or using the service, you
        agree to them. If you don't, please don't use SoloWay.
      </p>

      <h2>1. The service</h2>
      <p>
        SoloWay is a travel planning companion for solo travelers. It helps you build
        itineraries, discover activities, connect with travel buddies, and stay safer on the
        road. We're an early-stage product — features may change, break, or disappear as we
        iterate.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be 16 or older to use SoloWay.</li>
        <li>You're responsible for keeping your credentials secure.</li>
        <li>Don't share accounts, impersonate others, or create accounts by automated means.</li>
        <li>We may suspend or terminate accounts that violate these terms.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>When you use SoloWay, you agree not to:</p>
      <ul>
        <li>Harass, threaten, or harm other users.</li>
        <li>Post illegal, infringing, deceptive, or harmful content.</li>
        <li>Attempt to break, probe, or overload the service.</li>
        <li>Scrape, reverse engineer, or resell the service without permission.</li>
        <li>Use SoloWay to plan or coordinate illegal activity.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You own the itineraries, notes, and other content you create on SoloWay. By posting
        content you grant us a limited license to store, display, and transmit it as needed to
        operate the service for you and, where you've made content public, for other users.
      </p>

      <h2>5. Buddy system</h2>
      <p>
        The SoloWay buddy system helps you meet other travelers. Meeting strangers — online or
        in person — always carries risk. Use your judgment. We verify phone numbers but do not
        perform background checks. You are solely responsible for your safety when meeting
        anyone through SoloWay.
      </p>

      <h2>6. Safety features</h2>
      <p>
        Safety features such as check-ins, safe-zone alerts, and SOS signals are provided on an
        "as is" best-effort basis. They are not a substitute for emergency services. In an
        emergency, call your local emergency number (911, 112, 999, etc.) first.
      </p>

      <h2>7. Bookings and payments</h2>
      <p>
        When you book an experience through SoloWay, your booking is with the third-party
        provider listed on the booking screen. SoloWay facilitates the transaction and may
        collect a commission. Cancellation and refund policies are set by the provider.
      </p>
      <p>
        During our pre-launch period, any payment flow marked "demo" is not a real charge and
        does not create an obligation. Real bookings will be clearly identified before you enter
        payment details.
      </p>

      <h2>8. Third parties</h2>
      <p>
        SoloWay may link to or integrate with third-party services (maps, suppliers, payment
        processors). Their terms and privacy practices are their own. We are not responsible for
        their content or conduct.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        SoloWay is provided "as is" and "as available". To the maximum extent permitted by law,
        we disclaim all warranties, express or implied, including merchantability, fitness for a
        particular purpose, and non-infringement. Travel involves risk; you assume that risk.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, SoloWay and its team will not be liable for any
        indirect, incidental, special, consequential, or punitive damages arising from your use
        of the service. Our total liability to you for any claim will not exceed the greater of
        (a) amounts you paid us in the prior 12 months, or (b) USD 100.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may stop using SoloWay at any time. We may suspend or end your access if you violate
        these terms or if we need to for legal, safety, or operational reasons.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms as the product evolves. When we make material changes we will
        post an in-app notice and update the "Last updated" date above. Continued use of
        SoloWay after changes means you accept them.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of the jurisdiction where SoloWay is incorporated,
        without regard to conflict-of-law rules. Specific jurisdiction will be set before public
        launch.
      </p>

      <h2>14. Contact</h2>
      <p>
        Reach us at <a href="mailto:hello@soloway.app">hello@soloway.app</a>.
      </p>

      <p className="disclaimer">
        <strong>Draft notice:</strong> these terms are a skeleton document for pre-launch. They
        are not legal advice and should be reviewed by counsel before SoloWay operates as a
        commercial service.
      </p>
    </LegalPage>
  );
};

export default Terms;
