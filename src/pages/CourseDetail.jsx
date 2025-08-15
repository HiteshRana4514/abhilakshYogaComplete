import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, TABLES } from '../utils/supabase';
import { formatText } from '../utils/textFormatter.jsx';
import { 
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  StarIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: 'beginner',
    goals: '',
    questions: ''
  });

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(TABLES.COURSES)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setCourseData(data);
      checkFavoriteStatus();
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details. Please try again later.');
      toast.error('Error loading course details');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if course is in user's favorites
  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from(TABLES.FAVORITES)
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .eq('content_type', 'course')
        .single();

      setIsFavorite(!!data);
    } catch (err) {
      // Course not in favorites
      setIsFavorite(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to add favorites');
        return;
      }

      if (isFavorite) {
        await supabase
          .from(TABLES.FAVORITES)
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', id)
          .eq('content_type', 'course');
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from(TABLES.FAVORITES)
          .insert({ 
            user_id: user.id, 
            course_id: id, 
            content_type: 'course',
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

  // Share course
  const shareCourse = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: courseData.name,
          text: `Check out this amazing course: ${courseData.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle enrollment form submission
  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to enroll in courses');
        return;
      }

      // Here you would typically submit to an enrollments table
      // For now, we'll just show a success message
      toast.success('Enrollment request submitted successfully! We\'ll contact you soon.');
      setShowEnrollmentForm(false);
      setEnrollmentData({
        name: '',
        email: '',
        phone: '',
        experience: 'beginner',
        goals: '',
        questions: ''
      });
    } catch (err) {
      console.error('Error submitting enrollment:', err);
      toast.error('Error submitting enrollment. Please try again.');
    }
  };

  // Fetch course details on component mount
  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error Loading Course</div>
          <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Courses
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={shareCourse}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ShareIcon className="h-5 w-5 mr-2" />
                Share
              </button>
              <button
                onClick={toggleFavorite}
                className={`flex items-center px-3 py-2 transition-colors ${
                  isFavorite 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isFavorite ? (
                  <HeartIconSolid className="h-5 w-5 mr-2" />
                ) : (
                  <HeartIcon className="h-5 w-5 mr-2" />
                )}
                {isFavorite ? 'Favorited' : 'Favorite'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              {courseData.image_url ? (
                <img
                  src={courseData.image_url}
                  alt={courseData.name}
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                  <BookOpenIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </motion.div>

            {/* Course Title and Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {courseData.name}
              </h1>
              <div className="text-lg text-gray-600 leading-relaxed">
                {formatText(courseData.description)}
              </div>
            </motion.div>

            {/* Course Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <UserIcon className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Instructor</p>
                  <p className="font-semibold text-gray-900">{courseData.instructor}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <AcademicCapIcon className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-semibold text-gray-900">{courseData.level}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <ClockIcon className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-900">{courseData.duration}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <span className="text-2xl text-indigo-600 mr-3">₹</span>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold text-gray-900">₹{courseData.price}</p>
                </div>
              </div>
            </motion.div>

            {/* Course Modules */}
            {courseData.modules && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Modules</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-gray-600">
                    {formatText(courseData.modules)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Course Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              {courseData.learning_objectives && courseData.learning_objectives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseData.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">{objective}</p>
                    </div>
                  ))}
                  {courseData.certificate && (
                    <div className="flex items-start md:col-span-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">Professional certification upon completion</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">Comprehensive yoga teacher training</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">Hands-on practical experience</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">Anatomy and physiology knowledge</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">Teaching methodology and techniques</p>
                  </div>
                  {courseData.certificate && (
                    <div className="flex items-start md:col-span-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">Professional certification upon completion</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-8"
            >
              {/* Enrollment Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    ₹{courseData.price}
                  </div>
                  <p className="text-gray-600">One-time payment</p>
                </div>

                <button
                  onClick={() => setShowEnrollmentForm(true)}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mb-4"
                >
                  Enroll Now
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {courseData.certificate ? 'Includes certification' : 'Professional training program'}
                  </p>
                </div>
              </div>

              {/* Course Highlights */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>Flexible learning schedule</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>Expert instructor guidance</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpenIcon className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>Comprehensive study materials</span>
                  </div>
                  {courseData.certificate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <StarIcon className="h-4 w-4 mr-3 text-indigo-600" />
                      <span>Professional certification</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Enroll in Course</h3>
                <button
                  onClick={() => setShowEnrollmentForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEnrollmentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollmentData.name}
                    onChange={(e) => setEnrollmentData({...enrollmentData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={enrollmentData.email}
                    onChange={(e) => setEnrollmentData({...enrollmentData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={enrollmentData.phone}
                    onChange={(e) => setEnrollmentData({...enrollmentData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={enrollmentData.experience}
                    onChange={(e) => setEnrollmentData({...enrollmentData, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Goals</label>
                <textarea
                  value={enrollmentData.goals}
                  onChange={(e) => setEnrollmentData({...enrollmentData, goals: e.target.value})}
                  rows={3}
                  placeholder="What do you hope to achieve from this course?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Questions or Concerns</label>
                <textarea
                  value={enrollmentData.questions}
                  onChange={(e) => setEnrollmentData({...enrollmentData, questions: e.target.value})}
                  rows={3}
                  placeholder="Any specific questions about the course?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEnrollmentForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Submit Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail; 