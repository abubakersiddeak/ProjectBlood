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
} from "lucide-react";
import Image from "next/image";
import { FormEvent } from "react";

/** 1. Define Interfaces  data **/

interface FooterLink {
  href: string;
  label: string;
}

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

export default function Footer() {
  const currentYear: number = new Date().getFullYear();

  /** 2. Apply types to your constants **/

  const quickLinks: FooterLink[] = [
    { href: "#contact", label: "Contact" },
    { href: "/search", label: "Find Donors" },
  ];

  const supportLinks: FooterLink[] = [
    { href: "#faq", label: "FAQ" },
    { href: "#guidelines", label: "Donation Guidelines" },
  ];

  const socialLinks: SocialLink[] = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Add newsletter subscription logic here
    console.log("Newsletter subscription submitted");
  };

  return (
    <footer className="bg-white border-t-2 border-black/20">
      {/* Main Footer Content */}
      <div className="max-w-7xl px-4 md:px-6 lg:px-3 2xl:px-0 mx-auto py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-4 group cursor-pointer"
            >
              <div className="text-white group-hover:bg-black transition-colors">
                <Image
                  src="/bloodlinkLogo.webp"
                  alt="logo"
                  width={50}
                  height={50}
                />
              </div>
              <span className="text-xl md:text-2xl font-bold text-black uppercase tracking-tight">
                BloodLink BD
              </span>
            </Link>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
              Connecting blood donors with recipients, making blood donation
              easier and more accessible across Bangladesh.
            </p>

            {/* Social Links */}
            <div className="flex gap-2 md:gap-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="bg-gray-100 border border-gray-300 p-2 md:p-2.5 hover:bg-black hover:text-white hover:border-black transition-colors cursor-pointer"
                  >
                    <IconComponent size={16} className="md:w-4.5 md:h-4.5" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-sm md:text-base font-bold text-black uppercase tracking-wider mb-4 md:mb-6 border-b-2 border-red-600 pb-2 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-red-600 text-xs md:text-sm flex items-center gap-2 group transition-colors cursor-pointer"
                  >
                    <ArrowRight
                      size={14}
                      className="md:w-4 md:h-4 group-hover:translate-x-1 transition-transform"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm md:text-base font-bold text-black uppercase tracking-wider mb-4 md:mb-6 border-b-2 border-black pb-2 inline-block">
              Support
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-black text-xs md:text-sm flex items-center gap-2 group transition-colors cursor-pointer"
                  >
                    <ArrowRight
                      size={14}
                      className="md:w-4 md:h-4 group-hover:translate-x-1 transition-transform"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-sm md:text-base font-bold text-black uppercase tracking-wider mb-4 md:mb-6 border-b-2 border-red-600 pb-2 inline-block">
              Contact Us
            </h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <a
                  href="tel:+880179088476"
                  className="flex items-start gap-3 text-gray-600 hover:text-red-600 group transition-colors cursor-pointer"
                >
                  <div className="bg-red-600 text-white p-1.5 md:p-2 mt-0.5 group-hover:bg-black transition-colors shrink-0">
                    <Phone size={14} className="md:w-4 md:h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">
                      Emergency
                    </p>
                    <p className="text-xs md:text-sm font-medium">
                      +880 179088476
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:abubakersiddeak@gmail.com"
                  className="flex items-start gap-3 text-gray-600 hover:text-red-600 group transition-colors cursor-pointer"
                >
                  <div className="bg-black text-white p-1.5 md:p-2 mt-0.5 group-hover:bg-red-600 transition-colors shrink-0">
                    <Mail size={14} className="md:w-4 md:h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">
                      Email
                    </p>
                    <p className="text-xs md:text-sm font-medium break-all">
                      abubakersiddeak@gmail.com
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-600">
                  <div className="bg-red-600 text-white p-1.5 md:p-2 mt-0.5 shrink-0">
                    <MapPin size={14} className="md:w-4 md:h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">
                      Location
                    </p>
                    <p className="text-xs md:text-sm font-medium">
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 md:mt-12 border-2 border-gray-200 p-4 md:p-6 lg:p-8 bg-gray-50"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h4 className="text-base md:text-lg font-bold text-black uppercase mb-1 md:mb-2">
                Stay Updated
              </h4>
              <p className="text-gray-600 text-xs md:text-sm">
                Subscribe to get urgent blood request notifications
              </p>
            </div>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex w-full md:w-auto gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 md:w-64 h-11 md:h-12 px-3 md:px-4 bg-white border border-gray-300 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-none"
              />
              <button
                type="submit"
                className="bg-red-600 text-white px-4 md:px-6 h-11 md:h-12 font-bold uppercase text-xs md:text-sm hover:bg-black transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Subscribe</span>
                <ArrowRight size={16} className="md:w-5 md:h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-black bg-black text-white">
        <div className="max-w-7xl px-4 md:px-6 lg:px-3 2xl:px-0 mx-auto py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <p className="text-xs md:text-sm text-center md:text-left">
              © {currentYear} <span className="font-bold">BloodLink BD</span>.
              All rights reserved. Built with ❤️ for humanity.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm">
              <Link
                href="/privacy"
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                Privacy
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/terms"
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                Terms
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/cookies"
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
