export default function PrivacyPolicy() {
  return (
    <main className="bg-gray-50 min-h-screen px-4 py-8 sm:py-12">
      <section className="max-w-4xl mx-auto bg-white  shadow-sm p-5 sm:p-8 md:p-10">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <article className="space-y-7 text-gray-700 leading-relaxed text-sm sm:text-base">
          {/* 1 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              1. Information We Collect
            </h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Name</li>
              <li>Phone number</li>
              <li>Photo</li>
              <li>Blood group</li>
              <li>Location (district/area)</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              2. Purpose Limitation
            </h2>
            <p className="mt-2">
              Personal information is collected strictly for humanitarian blood
              donation purposes and will never be used for marketing,
              advertising, or commercial activities.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              3. How We Use Your Information
            </h2>
            <p className="mt-2">
              Your information is used solely to connect blood donors with
              patients, respond to emergency requests, and improve platform
              reliability and safety.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              4. Consent to Data Use
            </h2>
            <p className="mt-2">
              By registering on BloodLink BD, users consent to the collection,
              processing, and use of their personal information as described in
              this Privacy Policy.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              5. Data Sharing
            </h2>
            <p className="mt-2">
              We only share limited donor information with patients for the
              purpose of blood donation. We do not sell, rent, or trade personal
              data.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              6. Emergency Data Visibility
            </h2>
            <p className="mt-2">
              During urgent blood requests, limited user information may be
              visible to increase response speed while maintaining reasonable
              privacy protections.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              7. Data Retention Policy
            </h2>
            <p className="mt-2">
              User data is retained only as long as necessary to provide
              services or until the user requests deletion of their information.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              8. Data Security
            </h2>
            <p className="mt-2">
              We implement reasonable technical and organizational measures to
              protect user data from unauthorized access, alteration, or misuse.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              9. Data Breach Notification
            </h2>
            <p className="mt-2">
              In the unlikely event of a data breach, BloodLink BD will take
              immediate steps to secure the system and notify affected users
              where required by law.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              10. Cookies
            </h2>
            <p className="mt-2">
              BloodLink BD may use cookies to enhance user experience and
              improve site functionality. Users can control cookies through
              browser settings.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              11. Third-Party Services
            </h2>
            <p className="mt-2">
              We may use trusted third-party services for hosting, messaging,
              analytics, or notifications. These providers are required to
              safeguard user data under applicable privacy laws.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              12. User Control & Opt-Out
            </h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Deactivate donor profile</li>
              <li>Remove phone number</li>
              <li>Opt out of being listed as available</li>
            </ul>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              13. User Rights
            </h2>
            <p className="mt-2">
              Users may request to update or permanently delete their personal
              information by contacting our support team.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              14. Children’s Privacy
            </h2>
            <p className="mt-2">
              BloodLink BD does not knowingly collect personal information from
              individuals under the age of 18.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              15. Policy Updates
            </h2>
            <p className="mt-2">
              This Privacy Policy may be updated periodically. Continued use of
              the platform indicates acceptance of the revised policy.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              16. Contact Information
            </h2>
            <p className="mt-2">
              For privacy-related concerns, please contact us:
              <br />
              <strong>Email:</strong> support@bloodlinkbd.com
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
