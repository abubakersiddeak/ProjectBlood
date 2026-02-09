export default function TermsAndConditions() {
  return (
    <main className="bg-gray-50 min-h-screen px-3 py-8 sm:px-4 md:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl md:max-w-4xl bg-white  shadow-sm p-4 sm:p-6 md:p-10">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <article className="space-y-5 sm:space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using <strong>BloodLink BD</strong>, you agree to
              comply with and be bound by these Terms & Conditions. If you do
              not agree, please discontinue using the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              2. Eligibility
            </h2>
            <ul className="list-disc ml-5 sm:ml-6 space-y-2">
              <li>Blood donors must be at least 18 years old.</li>
              <li>
                Donors are responsible for ensuring they are medically fit to
                donate blood.
              </li>
              <li>
                Patients and donors must provide accurate and truthful
                information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              3. User Responsibilities
            </h2>
            <p>
              Users agree not to misuse the platform, provide false information,
              or engage in harmful, illegal, or misleading activities.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              4. Emergency & Urgency Disclaimer
            </h2>
            <p>
              BloodLink BD does not guarantee the immediate availability of
              blood donors. In emergency situations, users should also contact
              hospitals, blood banks, or local emergency services directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              5. Donor Consent & Voluntary Participation
            </h2>
            <p>
              All blood donations arranged through BloodLink BD are strictly
              voluntary. Donors have the right to accept or decline any request
              and may withdraw consent at any time without obligation.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              6. Health & Screening Responsibility
            </h2>
            <p>
              BloodLink BD does not conduct medical screening. Donors and
              patients are solely responsible for ensuring that all required
              medical screenings and safety protocols are followed at authorized
              healthcare facilities.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              7. Medical Disclaimer
            </h2>
            <p>
              BloodLink BD is <strong>not a medical authority</strong>. We do
              not provide medical advice, diagnosis, or treatment. All blood
              donations and transfusions should be conducted under the guidance
              of qualified healthcare professionals.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              8. Accuracy of Information
            </h2>
            <p>
              Users are responsible for keeping their personal and
              medical-related information accurate and up to date. Providing
              false or misleading information may result in account suspension
              or termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              9. Prohibited Activities
            </h2>
            <ul className="list-disc ml-5 sm:ml-6 space-y-2">
              <li>Creating fake or misleading blood requests</li>
              <li>Harassment, abuse, or coercion of donors or patients</li>
              <li>Commercial use of the platform</li>
              <li>
                Scraping, collecting, or misusing user data or contact details
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              10. Third-Party Communication Disclaimer
            </h2>
            <p>
              BloodLink BD is not responsible for any communication or
              interactions conducted outside the platform, including phone
              calls, messages, meetings, or agreements between users.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              11. Limitation of Liability
            </h2>
            <p>
              BloodLink BD only facilitates connections between donors and
              patients. We are not responsible for medical outcomes, donor
              eligibility issues, personal disputes, or any damages resulting
              from blood donation or transfusion.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              12. Force Majeure
            </h2>
            <p>
              BloodLink BD shall not be held liable for service interruptions or
              failures caused by events beyond our reasonable control, including
              natural disasters, network outages, system maintenance, or
              technical failures.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              13. Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these Terms & Conditions or compromise the safety and integrity of
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              14. Changes to Terms
            </h2>
            <p>
              BloodLink BD may update these Terms & Conditions at any time.
              Continued use of the platform constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              15. Governing Law
            </h2>
            <p>
              These Terms & Conditions are governed by the laws of the People’s
              Republic of Bangladesh.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              16. Contact Information
            </h2>
            <p>
              For any questions regarding these Terms & Conditions, please
              contact us at:
              <br />
              <strong>Email:</strong> support@bloodlinkbd.com
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
