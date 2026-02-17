"use client";

import { motion } from "framer-motion";
import {
    Heart,
    Activity,
    Users,
    AlertCircle,
    Check,
    Droplet,
    Shield,
    LucideIcon,
} from "lucide-react";

// --- Interfaces ---

interface Reason {
    icon: LucideIcon;
    title: string;
    description: string;
    stats: string;
}

interface BloodCompatibility {
    type: string;
    label: string;
    give: string;
    receive: string;
    highlight?: boolean;
}

interface StatStrip {
    val: string;
    label: string;
}

export default function WhyDonateBlood() {
    const reasons: Reason[] = [
        {
            icon: Activity,
            title: "Emergency Care",
            description: "Vital for surgeries & trauma patients.",
            stats: "24/7 Need",
        },
        {
            icon: Heart,
            title: "Cancer Treatment",
            description: "Daily support for chemotherapy patients.",
            stats: "Daily",
        },
        {
            icon: AlertCircle,
            title: "Accident Victims",
            description: "One victim can need 100+ units.",
            stats: "Critical",
        },
    ];

    const bloodCompatibility: BloodCompatibility[] = [
        {
            type: "O-",
            label: "Univ. Donor",
            give: "All",
            receive: "O-",
            highlight: true,
        },
        { type: "O+", label: "Common", give: "O+, A+, B+, AB+", receive: "O+, O-" },
        { type: "A+", label: "Common", give: "A+, AB+", receive: "A+, A-, O+, O-" },
        { type: "A-", label: "Rare", give: "A+, A-, AB+, AB-", receive: "A-, O-" },
        {
            type: "B+",
            label: "Moderate",
            give: "B+, AB+",
            receive: "B+, B-, O+, O-",
        },
        {
            type: "B-",
            label: "Very Rare",
            give: "B+, B-, AB+, AB-",
            receive: "B-, O-",
        },
        {
            type: "AB+",
            label: "Univ. Recv",
            give: "AB+",
            receive: "All",
            highlight: true,
        },
        {
            type: "AB-",
            label: "Rarest",
            give: "AB+, AB-",
            receive: "AB-, A-, B-, O-",
        },
    ];

    const impactFacts: string[] = [
        "Every 2s someone needs blood",
        "One donation saves 3 lives",
        "Blood cannot be manufactured",
        "Only 38% are eligible",
    ];

    const eligibilityReqs: string[] = [
        "Age: 17+ years",
        "Weight: 110+ lbs (50kg)",
        "Good general health",
        "Wait 56 days between",
    ];

    const statsStrip: StatStrip[] = [
        { val: "3", label: "Lives / Unit" },
        { val: "450", label: "ml / Donation" },
        { val: "15", label: "Min Process" },
        { val: "56", label: "Days Rest" },
    ];

    return (
        <section
            id="faq"
            className="py-12 bg-white font-sans text-gray-900 border-t border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-3 lg:px-3 2xl:px-0">
                {/* --- Header & 3 Pillars --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border border-gray-200 mb-8">
                    <div className="lg:col-span-1 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold tracking-tight text-black mb-3">
                            Why <span className="text-red-600">Donate?</span>
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            There is no substitute for human blood. Your donation is the only
                            way to save these lives.
                        </p>
                        <div className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                            <Droplet size={14} className="fill-current" /> Essential Care
                        </div>
                    </div>

                    {reasons.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <Icon
                                        size={24}
                                        className="text-gray-400 group-hover:text-red-600 transition-colors"
                                    />
                                    <span className="text-[10px] font-bold uppercase bg-black text-white px-1.5 py-0.5">
                                        {item.stats}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* --- Compatibility Chart --- */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            <Users size={18} className="text-red-600" /> Compatibility
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px bg-gray-200 border border-gray-200">
                        {bloodCompatibility.map((blood, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className={`p-4 flex flex-col justify-between h-32 hover:relative hover:z-10 hover:shadow-lg transition-all ${blood.highlight
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-900"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-2xl font-bold tracking-tighter">
                                        {blood.type}
                                    </span>
                                    {blood.highlight && (
                                        <Droplet size={12} className="text-red-500 fill-current" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase opacity-60">
                                        Gives: <b className="opacity-100">{blood.give}</b>
                                    </div>
                                    <div className="text-[10px] uppercase opacity-60">
                                        Recv: <b className="opacity-100">{blood.receive}</b>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- Facts & Eligibility --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200">
                    <div className="bg-red-600 p-8 text-white">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity className="fill-white" size={20} /> Impact Facts
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {impactFacts.map((fact, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="text-red-200 font-mono text-xs">
                                        0{i + 1}
                                    </span>
                                    <span className="text-sm font-medium leading-snug">
                                        {fact}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-white">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield size={20} /> Eligibility
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            {eligibilityReqs.map((req, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                    <Check className="text-green-600 w-4 h-4" />
                                    <span>{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Stats Strip --- */}
                <div className="grid grid-cols-4 gap-px bg-gray-200 border-x border-b border-gray-200 mt-0">
                    {statsStrip.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white p-4 text-center hover:bg-gray-50 transition-colors"
                        >
                            <div className="text-2xl font-light text-black">{stat.val}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
