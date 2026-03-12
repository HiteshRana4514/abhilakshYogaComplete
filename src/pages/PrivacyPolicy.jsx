import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    const lastUpdated = "March 12, 2026";

    const sections = [
        {
            title: "1. Information We Collect",
            content: "We collect personal information that you provide to us when you register for classes, subscribe to our newsletter, or contact us. This includes your name, email address, phone number, and health information relevant to your yoga practice."
        },
        {
            title: "2. How We Use Your Information",
            content: "We use your information to manage your enrollments, provide personalized yoga instruction, send academy updates, and improve our services. We do not sell your personal data to third parties."
        },
        {
            title: "3. Data Security",
            content: "We implement robust security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
        },
        {
            title: "4. Your Rights",
            content: "You have the right to access, correct, or delete your personal information. Please contact us if you wish to exercise these rights."
        },
        {
            title: "5. Cookies",
            content: "Our website uses cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <SEO
                title="Privacy Policy"
                description="Privacy Policy for Abhilaksh Yoga Academy. Learn how we handle your personal data."
                keywords="Privacy Policy, Data Protection, Yoga Academy Privacy"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-orange to-primary-green bg-clip-text text-transparent mb-4 text-center">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 text-center mb-12 uppercase tracking-widest text-sm font-bold">
                        Last Updated: {lastUpdated}
                    </p>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 space-y-12">
                        <div className="prose prose-indigo max-w-none">
                            <p className="text-gray-600 leading-relaxed text-lg">
                                At Abhilaksh Yoga Academy, we are committed to protecting your privacy and ensuring a safe environment for our students. This Privacy Policy outlines how we collect, use, and safeguard your personal information.
                            </p>
                        </div>

                        {sections.map((section, index) => (
                            <div key={index} className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary-green pl-4">
                                    {section.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed pl-5">
                                    {section.content}
                                </p>
                            </div>
                        ))}

                        <div className="pt-8 border-t border-gray-100 mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p className="text-gray-600">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                Email: info@abhilakshyoga.com<br />
                                Address: 123 Yoga Street, Wellness City, India
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
