import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Facebook, Instagram, Youtube, MessageSquare } from 'lucide-react';
import { supabase, TABLES } from '../utils/supabase';
import { useContent } from '../hooks/useContent';
import SEO from '../components/SEO';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const { content: globalContent } = useContent('global');
  const { content: pageContent } = useContent('contact');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch FAQs from database
  const fetchFaqs = async () => {
    try {
      const { data: faqData, error } = await supabase
        .from(TABLES.FAQ)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setFaqs(faqData || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setFaqs([]); // Set empty array on error to hide the section
    } finally {
      setIsLoadingFaqs(false);
    }
  };

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from(TABLES.CONTACT_QUERIES)
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message
          }
        ]);

      if (error) throw error;

      toast.success('Thank you for your message! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: globalContent.contact?.phone || ['+91 98765 43210', '+91 98765 43211'],
      action: `tel:${(globalContent.contact?.phone?.[0] || '+919876543210').replace(/\s/g, '')}`
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: globalContent.contact?.email || ['info@abhilakshyoga.com', 'support@abhilakshyoga.com'],
      action: `mailto:${globalContent.contact?.email?.[0] || 'info@abhilakshyoga.com'}`
    },
    {
      icon: MapPinIcon,
      title: 'Address',
      details: globalContent.contact?.address || [
        '123 Yoga Street, Wellness City',
        'State - 123456, India'
      ],
      action: 'https://maps.google.com'
    },
    {
      icon: ClockIcon,
      title: 'Hours',
      details: globalContent.contact?.hours || [
        'Monday - Friday: 6:00 AM - 9:00 PM',
        'Saturday - Sunday: 7:00 AM - 8:00 PM'
      ]
    }
  ];

  const SocialIcon = ({ name, className }) => {
    switch (name?.toLowerCase()) {
      case 'facebook': return <Facebook className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'youtube': return <Youtube className={className} />;
      case 'whatsapp': return <MessageSquare className={className} />;
      default: return <MessageSquare className={className} />;
    }
  };

  const socialLinks = globalContent.social?.links || [
    { name: 'WhatsApp', href: 'https://wa.me/919876543210', icon: 'MessageSquare' },
    { name: 'Facebook', href: '#', icon: 'Facebook' },
    { name: 'Instagram', href: '#', icon: 'Instagram' },
    { name: 'YouTube', href: '#', icon: 'Youtube' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Contact Us"
        description="Have questions? Contact Abhilaksh Yoga Academy in Amritsar for class schedules, course details, and enrollment information."
        keywords="Contact Yoga Academy, Yoga Amritsar Location, Yoga Classes Inquiry, Amritsar Yoga Studio"
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-orange to-primary-green overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30 z-10"></div>

        {/* Dynamic Hero Image Background */}
        {pageContent.hero?.image && (
          <div className="absolute inset-0 z-0">
            <img
              src={pageContent.hero.image}
              alt="Contact Hero"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center z-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
          >
            {pageContent.hero?.title || 'Get in Touch'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
          >
            {pageContent.hero?.subtitle || "Have questions about our classes, courses, or want to start your yoga journey? We'd love to hear from you!"}
          </motion.p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="card p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {pageContent.form?.title || 'Send us a Message'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      {...register('subject', { required: 'Subject is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      {...register('message', { required: 'Message is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {pageContent.info?.title || 'Contact Information'}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {pageContent.info?.subtitle || "Reach out to us through any of these channels. We're here to help you on your yoga journey."}
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-orange to-primary-green rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 mb-1">{detail}</p>
                      ))}
                      {info.action && (
                        <a
                          href={info.action}
                          className="text-primary-green hover:text-primary-orange font-medium transition-colors"
                        >
                          Contact via {info.title}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-green transition-colors duration-200"
                      title={social.name}
                    >
                      <SocialIcon name={social.name} className="h-6 w-6 text-white" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{pageContent.map?.title || 'Find Us'}</h2>
            <p className="text-lg text-gray-600">
              {pageContent.map?.subtitle || 'Visit our studio and experience the peaceful atmosphere for yourself.'}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3396.175597180622!2d74.8716342!3d31.6564153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39196393114c6725%3A0xaca1d188b7a11d81!2sAbhilaksh%20yoga%20academy%2FBest%20Yoga%20Classes%20in%20Amritsar%2FHatha%20yoga%2FAshtanga%20Yoga%20classes%2FPower%20Yoga!5e0!3m2!1sen!2sin!4v1773296563758!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Abhilaksh Yoga Academy Location"
            ></iframe>
          </motion.div>
        </div>
      </section>

      {/* FAQ Preview - Only show if FAQs exist */}
      {faqs.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {pageContent.faq?.title || 'Frequently Asked Questions'}
              </h2>
              {pageContent.faq?.subtitle || 'Find quick answers to common questions about our classes and services.'}
            </div>

            {isLoadingFaqs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="card p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <a href="/faq" className="btn-primary">
                View All FAQs
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Contact; 