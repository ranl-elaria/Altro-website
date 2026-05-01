import LegalLayout from './LegalLayout'

function Section({ title, children }) {
  return (
    <section className="legal-section">
      <h2 className="legal-section__title">{title}</h2>
      {children}
    </section>
  )
}

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 2026">

      <Section title="1. Who We Are">
        <p>
          altro ("we", "us", "our") is a custom software studio that builds internal tools,
          automations, and AI agents for growing businesses. We are operated from Israel
          and can be reached at{' '}
          <a href="mailto:hello@altro.build" className="legal-link">hello@altro.build</a>.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, and protect your personal
          information when you visit <strong>altro.build</strong> or submit an inquiry
          through our contact form. It is governed by the Israeli Protection of Privacy
          Law, 1981 (PPL) and its amendments.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect two categories of information:</p>
        <h3 className="legal-sub-title">a) Information you provide directly</h3>
        <p>
          When you submit our contact form, we collect your <strong>name</strong>,{' '}
          <strong>company name</strong>, <strong>email address</strong>, and{' '}
          <strong>message content</strong>. This information is submitted voluntarily
          and is used solely to respond to your inquiry.
        </p>
        <h3 className="legal-sub-title">b) Information collected automatically</h3>
        <p>
          We use third-party analytics services to understand how visitors interact with
          our website. This may include pages visited, time on site, referring pages,
          browser type, and general geographic region. Analytics data is aggregated and
          does not identify you individually.
        </p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="legal-list">
          <li>Respond to your inquiries and evaluate potential project engagements</li>
          <li>Send you a reply within the timeframe stated on our site</li>
          <li>Analyze and improve website performance and user experience</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>
          We do not sell, rent, or share your personal information with third parties
          for marketing purposes.
        </p>
      </Section>

      <Section title="4. Cookies and Tracking">
        <p>
          Our website uses cookies in the following contexts:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Essential cookies:</strong> Session management for our administrative
            area (Supabase auth). These are strictly necessary and do not require consent.
          </li>
          <li>
            <strong>Analytics cookies:</strong> Set by our analytics provider to measure
            website traffic. These are only placed with your consent, which you can
            provide or withdraw at any time via the cookie banner on this site.
          </li>
        </ul>
        <p>
          You can control cookies through your browser settings. Disabling analytics
          cookies will not affect your ability to use this site.
        </p>
      </Section>

      <Section title="5. Data Retention">
        <p>
          Contact form submissions are retained for up to <strong>24 months</strong>{' '}
          from the date of submission, after which they are deleted unless a business
          relationship has been established. Analytics data is retained in aggregated,
          anonymised form.
        </p>
      </Section>

      <Section title="6. Data Security">
        <p>
          We store contact form submissions in Supabase, a cloud database provider that
          uses industry-standard encryption in transit (TLS) and at rest. Our website is
          served via Vercel's global CDN with HTTPS enforced on all connections.
        </p>
        <p>
          No method of transmission over the internet is 100% secure. While we take
          commercially reasonable steps to protect your information, we cannot guarantee
          absolute security.
        </p>
      </Section>

      <Section title="7. International Data Transfers">
        <p>
          We use cloud services (Vercel, Supabase, Resend) whose servers may be located
          outside the State of Israel. By submitting your information through our site,
          you acknowledge that your data may be transferred to and processed in other
          countries. We ensure that any such transfers are subject to appropriate
          safeguards.
        </p>
      </Section>

      <Section title="8. Your Rights Under Israeli Law">
        <p>
          Under the Israeli Protection of Privacy Law, 1981, you have the right to:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Access:</strong> Request a copy of the personal information we hold
            about you
          </li>
          <li>
            <strong>Correction:</strong> Request that inaccurate personal information be
            corrected
          </li>
          <li>
            <strong>Deletion:</strong> Request that we delete your personal information,
            subject to any legal retention obligations
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:hello@altro.build" className="legal-link">hello@altro.build</a>.
          We will respond within 30 days.
        </p>
      </Section>

      <Section title="9. Third-Party Services">
        <p>Our website uses the following third-party services:</p>
        <ul className="legal-list">
          <li><strong>Vercel</strong> — website hosting and edge delivery</li>
          <li><strong>Supabase</strong> — contact form data storage and admin authentication</li>
          <li><strong>Resend</strong> — transactional email delivery for inquiry notifications</li>
          <li><strong>Google Fonts</strong> — typography (Space Grotesk, Inter)</li>
        </ul>
        <p>
          Each of these providers has its own privacy policy and data processing terms.
          We are not responsible for the privacy practices of third-party services.
        </p>
      </Section>

      <Section title="10. Children's Privacy">
        <p>
          Our website is not directed at children under the age of 13. We do not
          knowingly collect personal information from children. If you believe a child
          has provided us with personal information, please contact us and we will
          promptly delete it.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          noted by updating the "Last updated" date at the top of this page. Continued
          use of our website after changes constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section title="12. Contact Us">
        <p>
          For any questions or requests regarding this Privacy Policy or your personal
          data:
        </p>
        <address className="legal-address">
          <strong>altro</strong><br />
          <a href="mailto:hello@altro.build" className="legal-link">hello@altro.build</a>
        </address>
      </Section>

    </LegalLayout>
  )
}
