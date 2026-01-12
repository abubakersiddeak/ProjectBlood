import Link from "next/link";
import Image from "next/image";
import { FC } from "react";

// Using the FC (Functional Component) type from React
const NotFound: FC = () => {
  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-3">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left space-y-8">
            {/* 404 Number */}
            <div>
              <h1 className="text-9xl font-bold text-red-600 leading-none">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
                Page Not Found
              </h2>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              The page you are looking for does not exist or has been moved.
              <span className="block mt-2 font-semibold text-red-600">
                But you can still save lives!
              </span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/"
                className="bg-red-600 text-white px-8 py-3 text-lg hover:bg-red-700 transition-colors text-center"
              >
                Return Home
              </Link>
              <Link
                href="/search"
                className="border-2 border-red-600 text-red-600 px-8 py-3 text-lg hover:bg-red-50 transition-colors text-center"
              >
                Find Donors
              </Link>
            </div>

            {/* Info Box */}
            <div className="pt-8 border-t border-gray-200">
              <div className="bg-white p-6 border border-gray-100 shadow-lg">
                <div className="text-red-600 font-bold text-lg mb-2">
                  💉 Did You Know?
                </div>
                <div className="text-gray-700">
                  Every blood donation can save up to 3 lives. Join our mission
                  today!
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden md:block">
            <div className="relative">
              <Image
                src="/photo-1615461066159-fea0960485d5.jpeg"
                height={500}
                width={500}
                alt="Blood Donation"
                className="w-full h-125 object-cover border-8 border-white shadow-lg"
              />
              {/* Emergency Contact Box */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 border border-gray-100 shadow-lg">
                <div className="text-red-600 font-bold">Emergency Hotline</div>
                <div className="text-gray-700">+880 1790884776</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Mobile Visible */}
        <div className="grid grid-cols-3 gap-6 mt-16 md:hidden">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">1,000+</div>
            <div className="text-gray-600 text-sm">Donors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">500+</div>
            <div className="text-gray-600 text-sm">Lives Saved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">24/7</div>
            <div className="text-gray-600 text-sm">Support</div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
