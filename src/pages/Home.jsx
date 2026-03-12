import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, ArrowRightIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';
import { supabase, TABLES } from '../utils/supabase';
import { formatSimpleText } from '../utils/textFormatter.jsx';
import { useContent } from '../hooks/useContent';
import SEO from '../components/SEO';

const Home = () => {
  const [featuredClasses, setFeaturedClasses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalCourses: 0,
    totalStudents: 0
  });

  const { content: pageContent, loading: contentLoading } = useContent('home');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent classes (limit to 3 most recent)
      const { data: classes, error: classesError } = await supabase
        .from(TABLES.CLASSES)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (classesError) throw classesError;

      // Fetch recent courses (limit to 2 most recent)
      const { data: courses, error: coursesError } = await supabase
        .from(TABLES.COURSES)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      if (coursesError) throw coursesError;

      // Fetch recent gallery images
      const { data: galleryData, error: galleryError } = await supabase
        .from(TABLES.GALLERY)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (galleryError) throw galleryError;

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (testimonialsError) throw testimonialsError;

      // Fetch stats
      const [classesCount, coursesCount] = await Promise.all([
        supabase.from(TABLES.CLASSES).select('*', { count: 'exact' }),
        supabase.from(TABLES.COURSES).select('*', { count: 'exact' })
      ]);

      setFeaturedClasses(classes || []);
      setFeaturedCourses(courses || []);
      setGalleryImages(galleryData || []);
      setTestimonials(testimonialsData || []);
      setStats({
        totalClasses: classesCount.count || 0,
        totalCourses: coursesCount.count || 0,
        totalStudents: Math.floor((classesCount.count || 0) * 15) // Estimate students per class
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Error component
  const ErrorMessage = () => (
    <div className="text-center py-12">
      <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
      <button
        onClick={fetchData}
        className="btn-primary"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <SEO
        title="Home"
        description="Abhilaksh Yoga Academy in Amritsar - Best Yoga classes for Hatha, Power, and Ashtanga Yoga. Transform your life with our expert guidance."
        keywords="Yoga Amritsar, Best Yoga Classes, Hatha Yoga Amritsar, Power Yoga, Wellness Academy"
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-orange via-orange-400 to-primary-green min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {pageContent.hero?.title || 'Discover Your Inner Peace'}
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {pageContent.hero?.subtitle || 'Join Abhilaksh Yoga and embark on a transformative journey to physical, mental, and spiritual well-being.'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {pageContent.hero?.stats ? (
                  pageContent.hero.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{stats.totalClasses}</div>
                      <div className="text-sm text-white/80">Classes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
                      <div className="text-sm text-white/80">Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{stats.totalStudents}+</div>
                      <div className="text-sm text-white/80">Students</div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/classes" className="btn-primary text-lg px-8 py-4 flex items-center justify-center">
                  Explore Classes
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/about" className="btn-secondary text-lg px-8 py-4">
                  Learn More
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="w-full h-96 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl border border-white/20">
                {pageContent.hero?.image ? (
                  <img
                    src={pageContent.hero.image}
                    alt="Yoga Hero"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl text-white/30 drop-shadow-lg">ॐ</span>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-orange/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-green/20 rounded-full blur-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Classes Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recent Classes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience our yoga classes designed for all levels,
              from beginners to advanced practitioners.
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorMessage />
          ) : featuredClasses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredClasses.map((yogaClass) => (
                  <motion.div
                    key={yogaClass.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative">
                      {yogaClass.image_url ? (
                        <img
                          src={yogaClass.image_url}
                          alt={yogaClass.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary-green/20 to-primary-orange/20 flex items-center justify-center">
                          <span className="text-6xl text-gray-400">🧘‍♀️</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="inline-block bg-primary-green/90 text-white text-xs px-3 py-1 rounded-full capitalize">
                          {yogaClass.level || 'All Levels'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {yogaClass.name}
                      </h3>
                      <div className="text-gray-600 mb-4 line-clamp-2">
                        {yogaClass.description ? formatSimpleText(yogaClass.description) : 'Join us for an enriching yoga experience.'}
                      </div>

                      <div className="space-y-2 mb-4">
                        {yogaClass.instructor && (
                          <div className="flex items-center text-sm text-gray-500">
                            <UserIcon className="h-4 w-4 mr-2" />
                            {yogaClass.instructor}
                          </div>
                        )}
                        {yogaClass.duration && (
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {yogaClass.duration}
                          </div>
                        )}
                        {yogaClass.schedule && (
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {yogaClass.schedule}
                          </div>
                        )}
                      </div>

                      {yogaClass.price && (
                        <div className="text-lg font-bold text-primary-green mb-4">
                          ₹{yogaClass.price}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Link
                          to={`/class/${yogaClass.id}`}
                          className="text-primary-green hover:text-primary-orange text-sm font-semibold flex items-center"
                        >
                          View Details
                          <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                        <Link
                          to="/contact"
                          className="text-primary-orange hover:text-primary-green text-sm font-semibold"
                        >
                          I'm Interested
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/classes" className="btn-primary">
                  View All Classes
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🧘‍♀️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Available Yet</h3>
              <p className="text-gray-600 mb-6">We're working on adding amazing yoga classes. Check back soon!</p>
              <Link to="/contact" className="btn-primary">
                Get Notified
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Teacher Training Courses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take your yoga journey to the next level with our comprehensive
              teacher training programs.
            </p>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="w-full h-64 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-6 w-3/4"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <ErrorMessage />
          ) : featuredCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative">
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.name}
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-primary-green/20 to-primary-orange/20 flex items-center justify-center">
                          <span className="text-6xl text-gray-400">📚</span>
                        </div>
                      )}
                      {course.certificate && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-block bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                            Certificate
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {course.name}
                      </h3>
                      <div className="text-gray-600 mb-4 line-clamp-3">
                        {course.description ? formatSimpleText(course.description) : 'Comprehensive training program for aspiring yoga teachers.'}
                      </div>

                      <div className="space-y-2 mb-6">
                        {course.instructor && (
                          <div className="flex items-center text-sm text-gray-500">
                            <UserIcon className="h-4 w-4 mr-2" />
                            {course.instructor}
                          </div>
                        )}
                        {course.duration && (
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {course.duration}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="inline-block bg-primary-green/10 text-primary-green text-xs px-2 py-1 rounded-full capitalize">
                            {course.level || 'All Levels'}
                          </span>
                        </div>
                      </div>

                      {course.price && (
                        <div className="text-2xl font-bold text-primary-green mb-6">
                          ₹{course.price}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Link
                          to={`/course/${course.id}`}
                          className="btn-primary flex-1 text-center"
                        >
                          View Details
                        </Link>
                        <Link
                          to="/contact"
                          className="btn-secondary flex-1"
                        >
                          I'm Interested
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/courses" className="btn-primary">
                  View All Courses
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available Yet</h3>
              <p className="text-gray-600 mb-6">We're developing comprehensive teacher training programs. Stay tuned!</p>
              <Link to="/contact" className="btn-primary">
                Get Notified
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from our community of yoga practitioners about their transformative experiences.
            </p>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <ErrorMessage />
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="card p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg text-gray-500">👤</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Testimonials Yet</h3>
              <p className="text-gray-600 mb-6">We're collecting feedback from our students. Check back soon!</p>
              <Link to="/contact" className="btn-primary">
                Share Your Experience
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Gallery
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take a glimpse into our yoga studio and community events.
            </p>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <ErrorMessage />
          ) : galleryImages.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.slice(0, 8).map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                  >
                    <img
                      src={image.url}
                      alt={image.title || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {image.title && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-3 text-white">
                          <p className="text-sm font-medium">{image.title}</p>
                          {image.description && (
                            <p className="text-xs opacity-80">{image.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/gallery" className="btn-primary">
                  View Full Gallery
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gallery Coming Soon</h3>
              <p className="text-gray-600 mb-6">We're building our gallery to showcase our beautiful studio and community.</p>
              <Link to="/contact" className="btn-primary">
                Get Notified
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary-green to-primary-orange">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {pageContent.cta?.title || 'Ready to Start Your Yoga Journey?'}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {pageContent.cta?.subtitle || 'Join our community and experience the transformative power of yoga. Whether you\'re a beginner or advanced practitioner, we have something for everyone.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/classes" className="btn-secondary text-lg px-8 py-4">
                Browse Classes
              </Link>
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">
                Get Started Today
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 