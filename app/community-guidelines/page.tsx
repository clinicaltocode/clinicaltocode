export const metadata = {
  title: 'Community Guidelines | Clinical to Code',
  description:
    'Read the community guidelines for Clinical to Code — a professional forum for clinicians and healthcare IT professionals.',
}

export default function CommunityGuidelinesPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Community Guidelines</h1>

      <p className="text-base leading-[1.6] text-muted-foreground mb-10">
        Clinical to Code is a professional community for clinicians and healthcare IT
        professionals to share frontline perspectives and have meaningful discussions.
        These guidelines exist to keep our conversations safe, constructive, and valuable
        for everyone who depends on good information in high-stakes environments.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">De-identification &amp; Patient Privacy</h2>
        <div className="text-base leading-[1.6] space-y-3">
          <p>
            Never share information that could identify a real patient — directly or
            indirectly. This includes names, dates of birth, geographic details smaller
            than a state, unique diagnoses or case combinations, and any other HIPAA
            protected health information (PHI).
          </p>
          <p>
            When discussing clinical cases or scenarios, change all identifying details.
            If you&apos;re unsure whether a detail is identifying, leave it out. The
            educational value of a case never outweighs a patient&apos;s right to privacy.
          </p>
          <p>
            Posts containing suspected PHI will be removed immediately without notice.
            Repeated violations will result in a permanent ban.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Professional Conduct</h2>
        <div className="text-base leading-[1.6] space-y-3">
          <p>
            Treat everyone with the respect you would extend to a colleague in a
            professional setting. Disagreement is welcome — personal attacks, harassment,
            and intimidation are not.
          </p>
          <p>
            Credential badges are self-reported and exist to add context to discussions,
            not to establish hierarchy. A question from a nursing student deserves the
            same respectful engagement as a comment from a CMIO.
          </p>
          <p>
            Do not misrepresent your credentials, experience, or affiliation. Impersonation
            of healthcare institutions or regulatory bodies is grounds for immediate removal.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Acceptable Content</h2>
        <div className="text-base leading-[1.6] space-y-3">
          <p><strong>Encouraged:</strong> Clinical workflow discussions, EHR implementation
          experiences, informatics challenges, healthcare IT career advice, de-identified
          case discussions for educational purposes, and questions from clinicians
          transitioning to health IT roles.</p>
          <p><strong>Not permitted:</strong> Spam or promotional content, misinformation
          or content that contradicts established clinical evidence without appropriate
          context, content that promotes harm, off-topic discussions unrelated to
          clinical practice or healthcare technology, and any content that violates
          patient privacy (see above).</p>
          <p>
            This is not a general medical advice forum. Nothing shared here constitutes
            medical advice, and no post should be acted upon without consulting appropriate
            clinical judgment and institutional protocols.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Enforcement</h2>
        <div className="text-base leading-[1.6] space-y-3">
          <p>
            We take a graduated approach to enforcement based on severity and pattern of
            behavior:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Content removal</strong> — individual posts or threads removed for
            rule violations without necessarily affecting the account.</li>
            <li><strong>Account warning</strong> — a direct message explaining the violation
            and what would constitute grounds for a ban.</li>
            <li><strong>Temporary ban</strong> — account access suspended for a defined
            period for repeated or serious violations.</li>
            <li><strong>Permanent ban</strong> — account permanently disabled for severe
            violations (PHI exposure, harassment, impersonation) or patterns of repeated
            violations.</li>
          </ul>
          <p>
            PHI exposure, harassment, and impersonation are grounds for immediate permanent
            banning without prior warning.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Contact &amp; Reporting</h2>
        <div className="text-base leading-[1.6] space-y-3">
          <p>
            If you see content that violates these guidelines, use the{' '}
            <strong>Report</strong> button on any post or thread. Reports are reviewed
            by the site administrator.
          </p>
          <p>
            For matters that require direct contact, reach out via the contact information
            in the site footer.
          </p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
      </footer>
    </main>
  )
}
