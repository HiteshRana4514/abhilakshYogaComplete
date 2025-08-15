import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, TABLES } from '../utils/supabase';
import { formatSimpleText } from '../utils/textFormatter.jsx';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  ChevronUpIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  
  // Sorting states
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);

  // Fetch courses from Supabase
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(TABLES.COURSES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCourses(data || []);
      setFilteredCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
      toast.error('Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort courses
  const filterAndSortCourses = () => {
    let filtered = [...courses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.level?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(course => course.level === levelFilter);
    }

    // Apply instructor filter
    if (instructorFilter !== 'all') {
      filtered = filtered.filter(course => course.instructor === instructorFilter);
    }

    // Apply duration filter
    if (durationFilter !== 'all') {
      filtered = filtered.filter(course => course.duration === durationFilter);
    }

    // Apply price range filter
    if (priceRangeFilter !== 'all') {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      filtered = filtered.filter(course => {
        const price = parseFloat(course.price) || 0;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle numeric values
      if (sortField === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle date values
      if (sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string values
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setLevelFilter('all');
    setInstructorFilter('all');
    setDurationFilter('all');
    setPriceRangeFilter('all');
    setSortField('name');
    setSortDirection('asc');
  };

  // Get unique values for filter options
  const levels = [...new Set(courses.map(course => course.level).filter(Boolean))];
  const instructors = [...new Set(courses.map(course => course.instructor).filter(Boolean))];
  const durations = [...new Set(courses.map(course => course.duration).filter(Boolean))];

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    filterAndSortCourses();
  }, [searchTerm, levelFilter, instructorFilter, durationFilter, priceRangeFilter, sortField, sortDirection, courses]);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error message component
  const ErrorMessage = () => (
    <div className="text-center py-12">
      <div className="text-red-500 text-lg mb-4">Error Loading Courses</div>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={fetchCourses}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // No results component
  const NoResults = () => (
    <div className="text-center py-12">
      <div className="text-gray-500 text-lg mb-4">No courses found</div>
      <p className="text-gray-400 mb-4">
        {searchTerm || levelFilter !== 'all' || instructorFilter !== 'all' || durationFilter !== 'all' || priceRangeFilter !== 'all'
          ? 'Try adjusting your search terms or filters.'
          : 'No courses are available at the moment.'
        }
      </p>
      {(searchTerm || levelFilter !== 'all' || instructorFilter !== 'all' || durationFilter !== 'all' || priceRangeFilter !== 'all') && (
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Teacher Training Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take your yoga journey to the next level with our comprehensive teacher training programs.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                placeholder="Search courses..."
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

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            {/* Instructor Filter */}
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Instructors</option>
              {instructors.map(instructor => (
                <option key={instructor} value={instructor}>{instructor}</option>
              ))}
            </select>

            {/* Duration Filter */}
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Durations</option>
              {durations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={priceRangeFilter}
              onChange={(e) => setPriceRangeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                              <option value="all">All Prices (₹)</option>
                              <option value="0-100">₹0 - ₹100</option>
                <option value="100-500">₹100 - ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000-">₹1000+</option>
            </select>
          </div>

          {/* Sort and Reset */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button
                onClick={() => {
                  if (sortField === 'name') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('name');
                    setSortDirection('asc');
                  }
                }}
                className={`flex items-center px-3 py-1 rounded-lg text-sm transition-colors ${
                  sortField === 'name' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Name
                {sortField === 'name' && (
                  sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                )}
              </button>
              <button
                onClick={() => {
                  if (sortField === 'price') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('price');
                    setSortDirection('asc');
                  }
                }}
                className={`flex items-center px-3 py-1 rounded-lg text-sm transition-colors ${
                  sortField === 'price' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Price (₹)
                {sortField === 'price' && (
                  sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                )}
              </button>
              <button
                onClick={() => {
                  if (sortField === 'duration') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('duration');
                    setSortDirection('asc');
                  }
                }}
                className={`flex items-center px-3 py-1 rounded-lg text-sm transition-colors ${
                  sortField === 'duration' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Duration
                {sortField === 'duration' && (
                  sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                )}
              </button>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
              <p className="text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
            {sortField && (
              <span className="ml-2 text-indigo-600">
                • Sorted by {sortField} ({sortDirection})
              </span>
            )}
          </p>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorMessage />
        ) : currentCourses.length === 0 ? (
          <NoResults />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {/* Course Image */}
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h3>
                    <div className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {formatSimpleText(course.description)}
                    </div>

                    {/* Course Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <UserIcon className="h-4 w-4 mr-2" />
                        {course.instructor}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        {course.level}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {course.duration}
                      </div>
                    </div>

                    {/* Price and Certificate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-lg font-bold text-indigo-600">
                        <span className="mr-1">₹</span>
                        {course.price}
                      </div>
                      {course.certificate && (
                        <div className="flex items-center text-sm text-green-600">
                          <StarIcon className="h-4 w-4 mr-1" />
                          Certificate
                        </div>
                      )}
            </div>
          </div>
        </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses; 