"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  LucideIcon,
  Heart,
  Code,
  ExternalLink,
  Github,
} from "lucide-react";
import Image from "next/image";
import { FormEvent } from "react";

/** Interfaces **/
interface FooterLink {
  href: string;
  label: string;
}

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
  color?: string;
}

export default function Footer() {
  const currentYear: number = new Date().getFullYear();

  const quickLinks: FooterLink[] = [
    { href: "/searchDonors", label: "Find Donors" },
    { href: "/allBloodRequest", label: "Blood Requests" },
    { href: "/blog", label: "Health Blog" },
    { href: "/about", label: "About Us" },
  ];

  const supportLinks: FooterLink[] = [
    { href: "/faq", label: "FAQ" },
    { href: "/guidelines", label: "Donation Guidelines" },
    { href: "/contact", label: "Contact Support" },
    { href: "/emergency", label: "Emergency Help" },
  ];

  const legalLinks: FooterLink[] = [
    { href: "/privacyPolicy", label: "Privacy Policy" },
    { href: "/termsAndConditions", label: "Terms of Service" },
    { href: "/cookie-policy", label: "Cookie Policy" },
  ];

  const socialLinks: SocialLink[] = [
    {
      icon: Facebook,
      href: "https://facebook.com/bloodlinkbd",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      icon: Twitter,
      href: "https://twitter.com/bloodlinkbd",
      label: "Twitter",
      color: "hover:bg-sky-500",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/bloodlinkbd",
      label: "Instagram",
      color: "hover:bg-pink-600",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/bloodlinkbd",
      label: "LinkedIn",
      color: "hover:bg-blue-700",
    },
  ];

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    console.log("Newsletter subscription:", email);
    // Add your newsletter API logic here
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section - 4 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-5 group cursor-pointer"
            >
              <div className="relative w-14 h-14 overflow-hidden border-2 border-red-600 group-hover:border-black transition-colors">
                <Image
                  src="/bloodlinkLogo.webp"
                  alt="BloodLink BD Logo"
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 uppercase tracking-tight block">
                  BloodLink
                </span>
                <span className="text-sm font-semibold text-red-600">
                  Bangladesh
                </span>
              </div>
            </Link>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm">
              Connecting blood donors with recipients across Bangladesh. Making
              blood donation easier, faster, and more accessible to save lives.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`bg-gray-900 text-white p-2.5 ${social.color} transition-all duration-300 cursor-pointer group`}
                  >
                    <IconComponent
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 pb-2 border-b-2 border-red-600 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-red-600 text-sm flex items-center gap-2 group transition-colors cursor-pointer"
                  >
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform text-red-600"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 pb-2 border-b-2 border-gray-900 inline-block">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2 group transition-colors cursor-pointer"
                  >
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform text-gray-900"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact - 4 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 pb-2 border-b-2 border-red-600 inline-block">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+880179088476"
                  className="flex items-start gap-3 text-gray-600 hover:text-red-600 group transition-colors cursor-pointer"
                >
                  <div className="bg-red-600 text-white p-2 group-hover:bg-gray-900 transition-colors shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">
                      24/7 Emergency
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      +880 179088476
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@bloodlinkbd.com"
                  className="flex items-start gap-3 text-gray-600 hover:text-red-600 group transition-colors cursor-pointer"
                >
                  <div className="bg-gray-900 text-white p-2 group-hover:bg-red-600 transition-colors shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">
                      Email Support
                    </p>
                    <p className="text-sm font-bold text-gray-900 break-all">
                      info@bloodlinkbd.com
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-600">
                  <div className="bg-red-600 text-white p-2 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">
                      Head Office
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-gray-900 bg-gray-900 text-white">
        <div className="max-w-7xl px-4 md:px-6 lg:px-8 mx-auto py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-300">
                © {currentYear}{" "}
                <span className="font-bold text-white">BloodLink BD</span>. All
                rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Built with{" "}
                <Heart className="inline w-3 h-3 text-red-500 fill-red-500" />{" "}
                for humanity
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {legalLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-700">|</span>
                  )}
                </div>
              ))}
            </div>

            {/* ✅ Creator Credit */}
            <div className="flex items-center gap-2 text-sm">
              <Code className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Crafted by</span>
              <a
                href="https://devzisan.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 group"
              >
                Abubakar Siddik Zisan
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>
            </div>
          </div>

          {/* ✅ Developer Signature (Alternative Style) */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <Github size={16} className="text-gray-600" />
                Open Source Project
              </span>
              <span className="hidden sm:inline text-gray-700">•</span>
              <a
                href="https://github.com/abubakersiddeak/ProjectBlood"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                View on GitHub
              </a>
              <span className="hidden sm:inline text-gray-700">•</span>
              <a
                href="https://devzisan.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                Developer Portfolio
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "BloodLink BD",
            url: process.env.NEXT_PUBLIC_APP_URL || "https://bloodlinkbd.com",
            logo: `${process.env.NEXT_PUBLIC_APP_URL}/bloodlinkLogo.webp`,
            description: "Bangladesh's leading blood donation platform",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+880179088476",
              contactType: "Emergency Support",
              availableLanguage: ["en", "bn"],
            },
            sameAs: [
              "https://facebook.com/bloodlinkbd",
              "https://twitter.com/bloodlinkbd",
              "https://instagram.com/bloodlinkbd",
              "https://linkedin.com/company/bloodlinkbd",
            ],
          }),
        }}
      />
    </footer>
  );
}
