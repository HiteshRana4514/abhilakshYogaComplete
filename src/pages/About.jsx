import { motion } from 'framer-motion';
import { StarIcon, UserGroupIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useContent } from '../hooks/useContent';
import SEO from '../components/SEO';

const About = () => {
  const { content: pageContent, loading: contentLoading } = useContent('about');

  const team = pageContent.team?.members || [
    {
      name: 'Priya Sharma',
      role: 'Lead Instructor & Founder',
      bio: 'Certified yoga instructor with 15+ years of experience in Hatha and Vinyasa yoga.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      certifications: ['RYT-500', 'Hatha Yoga', 'Meditation']
    },
    {
      name: 'Rajesh Kumar',
      role: 'Senior Instructor',
      bio: 'Specializes in advanced asanas and therapeutic yoga practices.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      certifications: ['RYT-200', 'Therapeutic Yoga', 'Pranayama']
    },
    {
      name: 'Anita Patel',
      role: 'Meditation Specialist',
      bio: 'Expert in mindfulness meditation and stress management techniques.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      certifications: ['Meditation Teacher', 'Mindfulness', 'Stress Management']
    }
  ];

  const timeline = pageContent.timeline?.items || [
    {
      year: '2010',
      title: 'Foundation',
      description: 'Abhilaksh Yoga was founded with a vision to make authentic yoga accessible to everyone.'
    },
    {
      year: '2015',
      title: 'First Teacher Training',
      description: 'Launched our first 200-hour teacher training program, graduating 15 certified instructors.'
    },
    {
      year: '2018',
      title: 'Community Growth',
      description: 'Reached 1000+ students and expanded our studio space to accommodate growing demand.'
    },
    {
      year: '2020',
      title: 'Digital Transformation',
      description: 'Introduced online classes and virtual teacher training programs during the pandemic.'
    },
    {
      year: '2023',
      title: 'Excellence Award',
      description: 'Received the "Best Yoga Studio" award from the National Wellness Council.'
    }
  ];

  const awards = [
    {
      title: 'Best Yoga Studio 2023',
      organization: 'National Wellness Council',
      year: '2023'
    },
    {
      title: 'Excellence in Teaching',
      organization: 'Yoga Alliance India',
      year: '2022'
    },
    {
      title: 'Community Service Award',
      organization: 'Local Health Department',
      year: '2021'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Happy Students', icon: UserGroupIcon },
    { number: '15+', label: 'Years Experience', icon: StarIcon },
    // { number: '50+', label: 'Certified Teachers', icon: AwardIcon },
    { number: '100%', label: 'Satisfaction Rate', icon: HeartIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="About Us"
        description="Learn about the journey, philosophy, and expert team of certified instructors at Abhilaksh Yoga Academy in Amritsar."
        keywords="About Abhilaksh Yoga, Yoga Academy Story, Yoga Instructors Amritsar, Yoga Philosophy"
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-orange to-primary-green py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            {pageContent.hero?.title || 'About Abhilaksh Yoga'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/90 max-w-3xl mx-auto"
          >
            {pageContent.hero?.subtitle || 'Discover our journey, philosophy, and the dedicated team behind your transformative yoga experience.'}
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {pageContent.story?.title || 'Our Story'}
              </h2>
              {pageContent.story?.paragraphs ? (
                pageContent.story.paragraphs.map((p, i) => (
                  <p key={i} className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {p}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Abhilaksh Yoga was born from a deep passion for authentic yoga practice
                    and a desire to share its transformative benefits with the community.
                    Founded in 2010, we started as a small studio with a big vision.
                  </p>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Over the years, we've grown into a thriving community of yoga practitioners,
                    teachers, and wellness enthusiasts. Our commitment to traditional yoga
                    principles combined with modern teaching methods has made us a trusted
                    name in the wellness industry.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Today, we continue to inspire and guide thousands of students on their
                    journey to physical, mental, and spiritual well-being, maintaining the
                    same dedication to excellence that inspired our founding.
                  </p>
                </>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="w-full h-96 bg-gradient-to-br from-primary-orange to-primary-green rounded-2xl flex items-center justify-center">
                <span className="text-8xl text-white/30">ॐ</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Philosophy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe in the holistic approach to wellness, integrating body, mind, and spirit
              through authentic yoga practices passed down through generations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧘‍♀️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authentic Practice</h3>
              <p className="text-gray-600">
                We maintain the integrity of traditional yoga practices while making them
                accessible to modern practitioners of all levels.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-primary-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Compassionate Teaching</h3>
              <p className="text-gray-600">
                Our instructors approach each student with empathy, understanding, and
                personalized guidance to support their unique journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Continuous Growth</h3>
              <p className="text-gray-600">
                We believe in lifelong learning and encourage our community to embrace
                growth, both on and off the mat.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our experienced and certified instructors are dedicated to guiding you
              on your yoga journey with expertise, compassion, and authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center p-6"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-green font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {member.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-block bg-primary-green/10 text-primary-green text-xs px-2 py-1 rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to becoming a leading yoga institution,
              here's our story of growth and transformation.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-primary-orange to-primary-green"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'
                    }`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                    <div className="card p-6">
                      <div className="text-2xl font-bold text-primary-green mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-green rounded-full border-4 border-white shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Recognition & Awards
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence has been recognized by various organizations
              in the wellness and fitness industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center p-6"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  {/* <AwardIcon className="h-8 w-8 text-white" /> */}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{award.title}</h3>
                <p className="text-primary-green font-medium mb-2">{award.organization}</p>
                <p className="text-gray-600">{award.year}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 