import { Link } from 'react-router-dom';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Facebook, Instagram, Youtube, MessageSquare } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import logo from '/footer_logo.png'

const Footer = () => {
  const { content: globalContent } = useContent('global');
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Classes', href: '/classes' },
    { name: 'Courses', href: '/courses' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ];

  const socialLinks = globalContent.social?.links || [
    { name: 'Facebook', href: '#', icon: 'Facebook' },
    { name: 'Instagram', href: '#', icon: 'Instagram' },
    { name: 'YouTube', href: '#', icon: 'Youtube' },
    { name: 'WhatsApp', href: '#', icon: 'MessageSquare' },
  ];

  const SocialIcon = ({ name, className }) => {
    switch (name.toLowerCase()) {
      case 'facebook': return <Facebook className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'youtube': return <Youtube className={className} />;
      case 'whatsapp': return <MessageSquare className={className} />;
      default: return <MessageSquare className={className} />;
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">

              <img
                src={logo}
                alt="Abhilaksh Yoga Logo"
                className="w-20 h-20 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold gradient-text">Abhilaksh Yoga</h3>
                <p className="text-sm text-gray-400">Path to Vitality</p>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Discover the transformative power of yoga with our expert instructors.
              Join us on your journey to physical, mental, and spiritual well-being.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-green">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-green transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-green">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-primary-orange" />
                <span className="text-gray-300 text-sm">
                  {globalContent.contact?.phone?.[0] || '+91 98765 43210'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary-orange" />
                <span className="text-gray-300 text-sm">
                  {globalContent.contact?.email?.[0] || 'info@abhilakshyoga.com'}
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary-orange mt-0.5" />
                <span className="text-gray-300 text-sm">
                  {globalContent.contact?.address?.join(', ') || '123 Yoga Street, Wellness City, State - 123456, India'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-green">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-green transition-colors duration-200"
                  title={social.name}
                >
                  <SocialIcon name={social.name} className="h-5 w-5 text-gray-300" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-2 text-gray-300">Newsletter</h5>
              <p className="text-gray-400 text-xs mb-3">
                Subscribe for yoga tips and updates
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary-green"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-primary-orange to-primary-green text-white rounded-r-lg text-sm font-semibold hover:shadow-lg transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Abhilaksh Yoga. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-primary-green text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-primary-green text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 