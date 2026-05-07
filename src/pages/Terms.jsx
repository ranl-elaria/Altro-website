import LegalLayout from './LegalLayout'

function Section({ title, children }) {
  return (
    <section className="legal-section">
      <h2 className="legal-section__title">{title}</h2>
      {children}
    </section>
  )
}

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 2026">

      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using the altro website at <strong>altro.build</strong> ("the
          Site"), you agree to be bound by these Terms of Service ("Terms"). If you do
          not agree to these Terms, please do not use the Site.
        </p>
        <p>
          These Terms apply to all visitors, users, and anyone who accesses or uses
          the Site.
        </p>
      </Section>

      <Section title="2. About altro">
        <p>
          altro is a custom software studio that designs and builds internal web
          applications, process automations, and AI agents for growing businesses.
          The Site is a marketing and inquiry platform — it does not itself provide
          software services directly. Any engagement for services is governed by a
          separate written agreement between altro and the client.
        </p>
      </Section>

      <Section title="3. Use of the Site">
        <p>You may use the Site for lawful purposes only. You agree not to:</p>
        <ul className="legal-list">
          <li>Use the Site in any way that violates applicable laws or regulations</li>
          <li>
            Attempt to gain unauthorised access to any part of the Site or its
            underlying infrastructure
          </li>
          <li>
            Transmit any unsolicited or unauthorised advertising or promotional material
          </li>
          <li>
            Submit false, misleading, or fraudulent information through our contact form
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the Site
          </li>
          <li>
            Use automated means (bots, scrapers) to access or collect data from the
            Site without our prior written consent
          </li>
        </ul>
      </Section>

      <Section title="4. Intellectual Property">
        <p>
          All content on the Site — including text, graphics, logos, icons, design
          elements, and code — is the property of altro or its licensors and is
          protected by applicable intellectual property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, create derivative works of,
          publicly display, or otherwise exploit any content from the Site without our
          express prior written permission, except for personal, non-commercial use
          (such as sharing a link).
        </p>
      </Section>

      <Section title="5. Contact Form Submissions">
        <p>
          By submitting a message through our contact form, you acknowledge that:
        </p>
        <ul className="legal-list">
          <li>
            The information you provide will be used to evaluate a potential business
            engagement
          </li>
          <li>
            Submission of the form does not create any contractual obligation on the
            part of altro to provide services
          </li>
          <li>
            We will handle your submission in accordance with our{' '}
            <a href="/privacy" className="legal-link">Privacy Policy</a>
          </li>
        </ul>
      </Section>

      <Section title="6. Disclaimer of Warranties">
        <p>
          The Site is provided on an <strong>"as is" and "as available"</strong> basis
          without any warranties of any kind, either express or implied, including but
          not limited to implied warranties of merchantability, fitness for a particular
          purpose, or non-infringement.
        </p>
        <p>
          We do not warrant that the Site will be uninterrupted, error-free, or free of
          viruses or other harmful components. We do not warrant the accuracy,
          completeness, or usefulness of any information provided on the Site.
        </p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, altro and its owners,
          employees, and contractors shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising out of or related to your
          use of, or inability to use, the Site.
        </p>
        <p>
          In no event shall altro's total liability to you for all claims arising out of
          or related to the Site exceed the amount of <strong>ILS 500</strong>.
        </p>
      </Section>

      <Section title="8. Third-Party Links">
        <p>
          The Site may contain links to third-party websites or resources. These links
          are provided for convenience only. We have no control over the content of
          those sites and accept no responsibility for them or for any loss or damage
          that may arise from your use of them.
        </p>
      </Section>

      <Section title="9. Privacy">
        <p>
          Your use of the Site is also governed by our{' '}
          <a href="/privacy" className="legal-link">Privacy Policy</a>, which is
          incorporated into these Terms by reference.
        </p>
      </Section>

      <Section title="10. Governing Law and Jurisdiction">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          the <strong>State of Israel</strong>, without regard to its conflict of law
          provisions. Any dispute arising under or in connection with these Terms shall
          be subject to the exclusive jurisdiction of the competent courts located in{' '}
          <strong>Tel Aviv, Israel</strong>.
        </p>
      </Section>

      <Section title="11. Changes to These Terms">
        <p>
          We reserve the right to modify these Terms at any time. Changes are effective
          immediately upon posting to the Site. We will indicate the revised date at the
          top of this page. Your continued use of the Site after changes are posted
          constitutes your acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Questions about these Terms? Contact us at:
        </p>
        <address className="legal-address">
          <strong>altro</strong><br />
          <a href="mailto:altroaiteam@gmail.com" className="legal-link">altroaiteam@gmail.com</a>
        </address>
      </Section>

    </LegalLayout>
  )
}
