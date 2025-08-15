import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, TABLES } from '../utils/supabase';
import { formatText } from '../utils/textFormatter.jsx';
import { 
  ArrowLeftIcon,
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  BookOpenIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    specialRequests: ''
  });

  useEffect(() => {
    if (id) {
      fetchClassDetails();
      checkFavoriteStatus();
    }
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(TABLES.CLASSES)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setClassData(data);
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError('Failed to load class details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: favorites } = await supabase
          .from(TABLES.FAVORITES)
          .select('*')
          .eq('user_id', user.id)
          .eq('class_id', id)
          .eq('content_type', 'class')
          .single();
        
        setIsFavorite(!!favorites);
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to add favorites');
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from(TABLES.FAVORITES)
          .delete()
          .eq('user_id', user.id)
          .eq('class_id', id)
          .eq('content_type', 'class');
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        await supabase
          .from(TABLES.FAVORITES)
          .insert({
            user_id: user.id,
            class_id: id,
            content_type: 'class',
            created_at: new Date().toISOString()
          });
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Error updating favorites');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to book a class');
        return;
      }

      // Submit booking
      const { error: bookingError } = await supabase
        .from(TABLES.BOOKINGS)
        .insert({
          user_id: user.id,
          class_id: id,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          date: bookingData.date,
          time: bookingData.time,
          special_requests: bookingData.specialRequests,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (bookingError) throw bookingError;

      toast.success('Booking submitted successfully! We\'ll contact you soon.');
      setShowBookingForm(false);
      setBookingData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        specialRequests: ''
      });
    } catch (err) {
      console.error('Error submitting booking:', err);
      toast.error('Error submitting booking. Please try again.');
    }
  };

  const shareClass = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: classData?.name,
          text: `Check out this amazing yoga class: ${classData?.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
            <div className="h-96 bg-gray-300 rounded-xl mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-300 rounded-xl"></div>
              <div className="h-64 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ {error || 'Class not found'}</div>
          <button 
            onClick={() => navigate('/classes')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => navigate('/classes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Classes
        </motion.button>

        {/* Class Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {classData.name}
          </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  classData.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  classData.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {classData.level}
                </span>
                <div className="flex items-center text-yellow-500">
                  <StarIcon className="h-5 w-5" />
                  <span className="ml-1 text-gray-600">4.8 (24 reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isFavorite ? <HeartIconSolid className="h-6 w-6" /> : <HeartIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={shareClass}
                className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ShareIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Class Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          {classData.image_url ? (
            <img
              src={classData.image_url}
              alt={classData.name}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-white text-6xl font-bold">{classData.name.charAt(0)}</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
                         {/* Description */}
             <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Class</h2>
               <div className="text-gray-600 leading-relaxed mb-6">
                 {formatText(classData.description)}
               </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <UserIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Instructor</p>
                    <p className="font-semibold text-gray-900">{classData.instructor}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">{classData.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Schedule</p>
                    <p className="font-semibold text-gray-900">{classData.schedule}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Max Students</p>
                    <p className="font-semibold text-gray-900">{classData.max_students}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Bring */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Bring</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Comfortable, stretchy clothing that allows for movement
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Yoga mat (we have some available if needed)
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Water bottle to stay hydrated
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Small towel for sweat
                </li>
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl">🧘</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mindfulness</h3>
                  <p className="text-sm text-gray-600">Develop mental clarity and focus</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl">💪</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Strength</h3>
                  <p className="text-sm text-gray-600">Build physical and mental resilience</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl">😌</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Relaxation</h3>
                  <p className="text-sm text-gray-600">Reduce stress and find inner peace</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl">🌟</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Flexibility</h3>
                  <p className="text-sm text-gray-600">Improve mobility and range of motion</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-1"
          >
            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  ₹{classData.price}
                </div>
                <div className="text-gray-500">per session</div>
              </div>
              
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
              >
                <BookOpenIcon className="h-5 w-5 inline mr-2" />
                Book This Class
              </button>
              
              <div className="text-center text-sm text-gray-500">
                Free cancellation up to 24 hours before
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Level</span>
                  <span className="font-semibold">{classData.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold">{classData.duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Max Students</span>
                  <span className="font-semibold">{classData.max_students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-blue-600">₹{classData.price}</span>
                </div>
            </div>
          </div>
        </motion.div>
        </div>

        {/* Booking Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Book This Class</h2>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingData.name}
                    onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingData.email}
                    onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special requirements or requests..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail; 