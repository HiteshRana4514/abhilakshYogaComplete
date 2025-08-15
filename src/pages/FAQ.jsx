import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, TABLES } from '../utils/supabase';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());
  
  // Fetch FAQs from Supabase
  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(TABLES.FAQ)
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setFaqs(data || []);
      setFilteredFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
      toast.error('Error loading FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter FAQs based on search and category
  const filterFAQs = () => {
    let filtered = [...faqs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(faq =>
        faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(faq => faq.category === categoryFilter);
    }

    setFilteredFaqs(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };

  // Get unique categories for filter options
  const categories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];

  // Toggle FAQ item expansion
  const toggleItem = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Expand all items
  const expandAll = () => {
    setExpandedItems(new Set(filteredFaqs.map(faq => faq.id)));
  };

  // Collapse all items
  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // Apply filters when dependencies change
  useEffect(() => {
    filterFAQs();
  }, [searchTerm, categoryFilter, faqs]);

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  // Error message component
  const ErrorMessage = () => (
    <div className="text-center py-12">
      <div className="text-red-500 text-lg mb-4">Error Loading FAQs</div>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={fetchFAQs}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // No results component
  const NoResults = () => (
    <div className="text-center py-12">
      <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <div className="text-gray-500 text-lg mb-4">No FAQs found</div>
      <p className="text-gray-400 mb-4">
        {searchTerm || categoryFilter !== 'all'
          ? 'Try adjusting your search terms or filters.'
          : 'No FAQs are available at the moment.'
        }
      </p>
      {(searchTerm || categoryFilter !== 'all') && (
        <button
          onClick={resetFilters}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our classes, courses, and services.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600">
            Showing {filteredFaqs.length} of {faqs.length} FAQs
          </p>
          
          {filteredFaqs.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* FAQ Accordion */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorMessage />
        ) : filteredFaqs.length === 0 ? (
          <NoResults />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {faq.category && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 mt-2">
                              {faq.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedItems.has(faq.id) ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Answer Content */}
                  <AnimatePresence>
                    {expandedItems.has(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 border-t border-gray-100">
                          <div className="pt-4">
                            <div className="flex items-start space-x-3">
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {faq.answer}
                                </p>
                                {faq.related_links && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Related Links:</h4>
                                    <div className="space-y-1">
                                      {faq.related_links.split('\n').map((link, linkIndex) => (
                                        <a
                                          key={linkIndex}
                                          href={link.trim()}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                          {link.trim()}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
            </div>
          </div>
        </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Contact Support Section */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/classes"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Browse Classes
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FAQ; 