"use client";

import { Phone, Mail, HelpCircle, HeartPulse } from "lucide-react";

export default function GetHelpPage() {
  return (
    <section className="min-h-screen bg-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-black">
            Get <span className="text-red-600">Help</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Need assistance with blood donation or requests? We are here to
            help.
          </p>
        </div>

        {/* Help Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="border p-6 rounded-lg hover:shadow">
            <HeartPulse className="text-red-600 mb-3" />
            <h3 className="font-semibold mb-2">Request Blood</h3>
            <p className="text-sm text-gray-500">
              Create a blood request and nearby donors will be notified.
            </p>
          </div>

          <div className="border p-6 rounded-lg hover:shadow">
            <HelpCircle className="text-red-600 mb-3" />
            <h3 className="font-semibold mb-2">Donation Guide</h3>
            <p className="text-sm text-gray-500">
              Learn how you can donate blood safely and save lives.
            </p>
          </div>

          <div className="border p-6 rounded-lg hover:shadow">
            <Phone className="text-red-600 mb-3" />
            <h3 className="font-semibold mb-2">Emergency Support</h3>
            <p className="text-sm text-gray-500">
              Contact us immediately if you need urgent blood assistance.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="border p-4 rounded">
              <p className="font-semibold">How do I request blood?</p>
              <p>
                Go to the request page, fill out the patient details and blood
                group, then submit your request.
              </p>
            </div>

            <div className="border p-4 rounded">
              <p className="font-semibold">How will donors contact me?</p>
              <p>
                Donors can call you directly using the phone number provided in
                your request.
              </p>
            </div>

            <div className="border p-4 rounded">
              <p className="font-semibold">Is blood donation safe?</p>
              <p>
                Yes, blood donation is completely safe and helps save lives.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border p-6 rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Contact Support</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="text-red-600 w-4 h-4" />
              support@bloodconnect.com
            </div>

            <div className="flex items-center gap-2">
              <Phone className="text-red-600 w-4 h-4" />
              +880 1234 567890
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
