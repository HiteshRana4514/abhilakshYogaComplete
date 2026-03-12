import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useContent } from '../hooks/useContent';

const WhatsAppButton = () => {
    const { content: globalContent } = useContent('global');

    // Find WhatsApp link from social links or use default
    const whatsappLink = globalContent.social?.links?.find(l => l.name.toLowerCase() === 'whatsapp')?.href
        || `https://wa.me/919876543210`;

    let finalLink = whatsappLink;
    if (whatsappLink === '#') {
        const phone = globalContent.contact?.phone?.[0];
        if (phone) {
            const cleanPhone = phone.replace(/\D/g, '');
            finalLink = `https://wa.me/${cleanPhone}`;
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
            {/* Pulse Effect Background */}
            <motion.div
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 0, 0.4],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 bg-green-500 rounded-full"
            />

            <motion.a
                href={finalLink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-4 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transition-colors duration-300 flex items-center justify-center group"
                title="Chat with us on WhatsApp"
            >
                <div className="relative">
                    <motion.div
                        animate={{
                            rotate: [0, -10, 10, -10, 10, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                    >
                        <MessageSquare className="h-6 w-6" />
                    </motion.div>
                </div>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-semibold whitespace-nowrap text-sm">
                    Chat on WhatsApp
                </span>
            </motion.a>
        </div>
    );
};

export default WhatsAppButton;
