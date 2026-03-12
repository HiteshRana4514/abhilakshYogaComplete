import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const TermsAndConditions = () => {
    const lastUpdated = "March 12, 2026";

    const terms = [
        {
            title: "1. Enrollment & Membership",
            items: [
                "All students must complete a registration form and disclose any health issues before participating in classes.",
                "Memberships and class passes are non-transferable and non-refundable unless otherwise stated.",
                "The academy reserves the right to refuse service based on safety concerns."
            ]
        },
        {
            title: "2. Class Policies",
            items: [
                "Students are encouraged to arrive 10-15 minutes before the class starts.",
                "Silence must be maintained in the yoga hall to respect others' practice.",
                "Mobile phones must be switched off or put on silent mode during sessions."
            ]
        },
        {
            title: "3. Health & Safety",
            items: [
                "Participating in yoga involves physical activity. Students participate at their own risk.",
                "Students must consult a physician before starting any exercise program.",
                "Please inform the instructor of any injuries or discomfort during the practice."
            ]
        },
        {
            title: "4. Cancellation & Refunds",
            items: [
                "Cancellations must be made at least 12 hours in advance for individual sessions.",
                "No refunds will be provided for missed classes without prior notification.",
                "Course fees are subject to the specific refund policy mentioned at the time of enrollment."
            ]
        },
        {
            title: "5. Intellectual Property",
            items: [
                "All content on this website, including logos and images, is the property of Abhilaksh Yoga Academy.",
                "Unauthorized use of our materials is strictly prohibited."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <SEO
                title="Terms & Conditions"
                description="Terms and Conditions for Abhilaksh Yoga Academy. Rules and policies for our students and website visitors."
                keywords="Terms and Conditions, User Agreement, Yoga Academy Rules"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-orange to-primary-green bg-clip-text text-transparent mb-4 text-center">
                        Terms & Conditions
                    </h1>
                    <p className="text-gray-500 text-center mb-12 uppercase tracking-widest text-sm font-bold">
                        Last Updated: {lastUpdated}
                    </p>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 space-y-12">
                        <div className="prose prose-indigo max-w-none">
                            <p className="text-gray-600 leading-relaxed text-lg italic">
                                Welcome to Abhilaksh Yoga Academy. By accessing our website and participating in our classes, you agree to comply with and be bound by the following terms and conditions.
                            </p>
                        </div>

                        {terms.map((term, index) => (
                            <div key={index} className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary-orange pl-4 uppercase tracking-wide">
                                    {term.title}
                                </h2>
                                <ul className="space-y-3 pl-5">
                                    {term.items.map((item, i) => (
                                        <li key={i} className="flex items-start text-gray-600 leading-relaxed italic">
                                            <span className="text-primary-green mr-2 font-bold">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div className="p-8 bg-gray-900 rounded-3xl text-white">
                            <h2 className="text-xl font-bold mb-4 text-primary-green">Agreement</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                By using our services, you acknowledge that you have read, understood, and agreed to these terms. Abhilaksh Yoga Academy reserves the right to modify these terms at any time without prior notice.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
