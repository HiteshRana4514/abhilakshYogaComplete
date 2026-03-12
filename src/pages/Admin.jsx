import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, TABLES } from '../utils/supabase';
import { ClassForm, CourseForm, GalleryUploadForm, TestimonialForm, FaqForm, ContentEditForm, TeamMemberForm } from '../components/AdminForms';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  PhotoIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Admin = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalCourses: 0,
    totalInquiries: 0,
    totalUsers: 0,
    totalTestimonials: 0,
    totalBookings: 0,
    totalFaqs: 0,
    totalSiteContent: 0
  });
  const [data, setData] = useState({
    classes: [],
    courses: [],
    inquiries: [],
    gallery: [],
    testimonials: [],
    bookings: [],
    faqs: [],
    siteContent: []
  });

  // Form states
  const [showClassForm, setShowClassForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Inquiry modal state
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');

  // Booking search and filter states
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingDateFilter, setBookingDateFilter] = useState('all');

  // Inquiry search and filter states
  const [inquirySearchTerm, setInquirySearchTerm] = useState('');
  const [inquirySubjectFilter, setInquirySubjectFilter] = useState('all');

  // Sorting states
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Bulk selection states
  const [selectedItems, setSelectedItems] = useState([]);

  // CMS UI state
  const [selectedCmsPage, setSelectedCmsPage] = useState('home');

  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState(null);

  // Check if user is admin - check both email and user metadata
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Export functionality
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas, quotes, or newlines
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filename} exported successfully`);
  };

  const exportClasses = () => {
    const exportData = data.classes.map(cls => ({
      ID: cls.id,
      Name: cls.name,
      Description: cls.description,
      Duration: cls.duration,
      Instructor: cls.instructor,
      Price: cls.price,
      Schedule: cls.schedule,
      'Max Students': cls.max_students,
      Level: cls.level,
      'Image URL': cls.image_url || '',
      'Created At': new Date(cls.created_at).toLocaleString(),
      'Updated At': cls.updated_at ? new Date(cls.updated_at).toLocaleString() : ''
    }));
    exportToCSV(exportData, 'classes');
  };

  const exportCourses = () => {
    const exportData = data.courses.map(course => ({
      ID: course.id,
      Name: course.name,
      Description: course.description,
      Duration: course.duration,
      Price: course.price,
      Instructor: course.instructor,
      Level: course.level,
      Modules: course.modules || '',
      'Learning Objectives': course.learning_objectives ? course.learning_objectives.join('; ') : '',
      Certificate: course.certificate ? 'Yes' : 'No',
      'Image URL': course.image_url || '',
      'Created At': new Date(course.created_at).toLocaleString(),
      'Updated At': course.updated_at ? new Date(course.updated_at).toLocaleString() : ''
    }));
    exportToCSV(exportData, 'courses');
  };

  const exportInquiries = () => {
    const exportData = data.inquiries.map(inquiry => ({
      ID: inquiry.id,
      Name: inquiry.name,
      Email: inquiry.email,
      Phone: inquiry.phone || 'N/A',
      Subject: inquiry.subject || 'N/A',
      Message: inquiry.message,
      'Created At': new Date(inquiry.created_at).toLocaleString()
    }));
    exportToCSV(exportData, 'inquiries');
  };

  const exportGallery = () => {
    const exportData = data.gallery.map(image => ({
      ID: image.id,
      Title: image.title || 'Untitled',
      Description: image.description || '',
      Category: image.category || 'general',
      URL: image.url,
      Filename: image.filename || '',
      'Created At': new Date(image.created_at).toLocaleString()
    }));
    exportToCSV(exportData, 'gallery');
  };

  const exportAllData = () => {
    const allData = {
      classes: data.classes.length,
      courses: data.courses.length,
      inquiries: data.inquiries.length,
      gallery: data.gallery.length,
      testimonials: data.testimonials.length,
      bookings: data.bookings.length,
      faqs: data.faqs.length
    };

    const exportData = [{
      'Data Type': 'Summary',
      'Total Classes': allData.classes,
      'Total Courses': allData.courses,
      'Total Inquiries': allData.inquiries,
      'Total Gallery Items': allData.gallery,
      'Total Testimonials': allData.testimonials,
      'Total Bookings': allData.bookings,
      'Total FAQs': allData.faqs,
      'Export Date': new Date().toLocaleString()
    }];

    exportToCSV(exportData, 'admin_summary');
  };

  const exportFilteredClasses = () => {
    const filteredClasses = data.classes.filter(cls =>
      cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.level?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredClasses.length === 0) {
      toast.error('No filtered classes to export');
      return;
    }

    const exportData = filteredClasses.map(cls => ({
      ID: cls.id,
      Name: cls.name,
      Description: cls.description,
      Duration: cls.duration,
      Instructor: cls.instructor,
      Price: cls.price,
      Schedule: cls.schedule,
      'Max Students': cls.max_students,
      Level: cls.level,
      'Image URL': cls.image_url || '',
      'Created At': new Date(cls.created_at).toLocaleString(),
      'Updated At': cls.updated_at ? new Date(cls.updated_at).toLocaleString() : ''
    }));

    exportToCSV(exportData, `filtered_classes_${searchTerm || 'all'}`);
  };

  const exportTestimonials = () => {
    const exportData = data.testimonials.map(testimonial => ({
      ID: testimonial.id,
      Name: testimonial.name,
      Role: testimonial.role,
      Content: testimonial.content,
      Rating: testimonial.rating,
      'Image URL': testimonial.image_url || '',
      Featured: testimonial.featured ? 'Yes' : 'No',
      'Created At': new Date(testimonial.created_at).toLocaleString()
    }));
    exportToCSV(exportData, 'testimonials');
  };

  const exportBookings = () => {
    const exportData = data.bookings.map(booking => ({
      ID: booking.id,
      'Customer Name': booking.name,
      'Customer Email': booking.email,
      'Customer Phone': booking.phone || 'N/A',
      'Class Name': booking.classes?.name || 'Unknown Class',
      'Date': new Date(booking.date).toLocaleDateString(),
      'Time': booking.time,
      'Status': booking.status,
      'Special Requests': booking.special_requests || 'N/A',
      'Created At': new Date(booking.created_at).toLocaleString(),
      'Updated At': booking.updated_at ? new Date(booking.updated_at).toLocaleString() : 'N/A'
    }));
    exportToCSV(exportData, 'bookings');
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from(TABLES.BOOKINGS)
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking status updated to ${newStatus}`);
      fetchData(); // Refresh data to show updated status
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast.error('Error updating booking status');
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        // Debug: Log user object to understand structure
        console.log('User object:', user);
        console.log('User email:', user.email);
        console.log('User metadata:', user.user_metadata);
        console.log('App metadata:', user.app_metadata);

        // First check if user has admin role in metadata
        let adminCheck = user?.email === 'admin@abhilakshyoga.com' ||
          user?.user_metadata?.role === 'admin' ||
          user?.app_metadata?.role === 'admin';

        // If not admin by metadata, check database
        if (!adminCheck) {
          const { data: userData } = await supabase
            .from(TABLES.USERS)
            .select('role')
            .eq('email', user.email)
            .single();

          if (userData && userData.role === 'admin') {
            adminCheck = true;
          }
        }

        console.log('Final admin check:', adminCheck);
        setIsAdmin(adminCheck);
        setCheckingAdmin(false);

        if (adminCheck) {
          fetchStats();
          fetchData();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      fetchStats();
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [classesCount, coursesCount, inquiriesCount, usersCount, testimonialsCount, bookingsCount, faqsCount, siteContentCount] = await Promise.all([
        supabase.from(TABLES.CLASSES).select('*', { count: 'exact' }),
        supabase.from(TABLES.COURSES).select('*', { count: 'exact' }),
        supabase.from(TABLES.CONTACT_QUERIES).select('*', { count: 'exact' }),
        supabase.from(TABLES.USERS).select('*', { count: 'exact' }),
        supabase.from('testimonials').select('*', { count: 'exact' }),
        supabase.from(TABLES.BOOKINGS).select('*', { count: 'exact' }),
        supabase.from(TABLES.FAQ).select('*', { count: 'exact' }),
        supabase.from(TABLES.SITE_CONTENT).select('*', { count: 'exact' })
      ]);

      setStats({
        totalClasses: classesCount.count || 0,
        totalCourses: coursesCount.count || 0,
        totalInquiries: inquiriesCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalTestimonials: testimonialsCount.count || 0,
        totalBookings: bookingsCount.count || 0,
        totalFaqs: faqsCount.count || 0,
        totalSiteContent: siteContentCount.count || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [classes, courses, inquiries, gallery, testimonials, bookings, faqs, siteContent] = await Promise.all([
        supabase.from(TABLES.CLASSES).select('*').order('created_at', { ascending: false }),
        supabase.from(TABLES.COURSES).select('*').order('created_at', { ascending: false }),
        supabase.from(TABLES.CONTACT_QUERIES).select('*').order('created_at', { ascending: false }),
        supabase.from(TABLES.GALLERY).select('*').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from(TABLES.BOOKINGS).select('*, classes(name)').order('created_at', { ascending: false }),
        supabase.from(TABLES.FAQ).select('*').order('order_index', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from(TABLES.SITE_CONTENT).select('*').order('page', { ascending: true }).order('section', { ascending: true })
      ]);

      setData({
        classes: classes.data || [],
        courses: courses.data || [],
        inquiries: inquiries.data || [],
        gallery: gallery.data || [],
        testimonials: testimonials.data || [],
        bookings: bookings.data || [],
        faqs: faqs.data || [],
        siteContent: siteContent.data || []
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Error signing out');
    }
  };

  const handleFormSuccess = () => {
    fetchStats();
    fetchData();
  };

  const openClassForm = (item = null) => {
    setEditingItem(item);
    setShowClassForm(true);
  };

  const openCourseForm = (item = null) => {
    setEditingItem(item);
    setShowCourseForm(true);
  };

  const openGalleryForm = () => {
    setShowGalleryForm(true);
  };

  const openTestimonialForm = (item = null) => {
    setEditingItem(item);
    setShowTestimonialForm(true);
  };

  const openFaqForm = (item = null) => {
    setEditingItem(item);
    setShowFaqForm(true);
  };

  const openContentForm = (item = null) => {
    setEditingItem(item);
    if (item && item.page === 'about' && item.section === 'team' && item.key === 'members') {
      setShowTeamForm(true);
    } else {
      setShowContentForm(true);
    }
  };

  const closeForms = () => {
    setShowClassForm(false);
    setShowCourseForm(false);
    setShowGalleryForm(false);
    setShowTestimonialForm(false);
    setShowFaqForm(false);
    setShowContentForm(false);
    setShowTeamForm(false);
    setEditingItem(null);
  };

  const openInquiryModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryModal(true);
  };

  const closeInquiryModal = () => {
    setShowInquiryModal(false);
    setSelectedInquiry(null);
  };

  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  // Filter and search functions
  const getFilteredBookings = () => {
    let filtered = data.bookings;

    // Search filter
    if (bookingSearchTerm) {
      filtered = filtered.filter(booking =>
        booking.name?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.classes?.name?.toLowerCase().includes(bookingSearchTerm.toLowerCase())
      );
    }

    // Status filter
    if (bookingStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === bookingStatusFilter);
    }

    // Date filter
    if (bookingDateFilter !== 'all') {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      switch (bookingDateFilter) {
        case 'today':
          filtered = filtered.filter(booking =>
            new Date(booking.date).toDateString() === today.toDateString()
          );
          break;
        case 'yesterday':
          filtered = filtered.filter(booking =>
            new Date(booking.date).toDateString() === yesterday.toDateString()
          );
          break;
        case 'this_week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(booking =>
            new Date(booking.date) >= weekAgo
          );
          break;
        }
        case 'this_month':
          filtered = filtered.filter(booking =>
            new Date(booking.date).getMonth() === today.getMonth() &&
            new Date(booking.date).getFullYear() === today.getFullYear()
          );
          break;
        default:
          break;
      }
    }

    return filtered;
  };

  const getFilteredInquiries = () => {
    let filtered = data.inquiries;

    // Search filter
    if (inquirySearchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.name?.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
        inquiry.email?.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
        inquiry.subject?.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
        inquiry.message?.toLowerCase().includes(inquirySearchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (inquirySubjectFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.subject === inquirySubjectFilter);
    }

    return filtered;
  };

  // Delete functions
  const deleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        const { error } = await supabase
          .from(TABLES.CLASSES)
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Class deleted successfully');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Error deleting class');
      }
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const { error } = await supabase
          .from(TABLES.COURSES)
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Course deleted successfully');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Error deleting course');
      }
    }
  };

  const deleteGalleryItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const { error } = await supabase
          .from(TABLES.GALLERY)
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Image deleted successfully');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Error deleting image');
      }
    }
  };

  const deleteInquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        const { error } = await supabase
          .from(TABLES.CONTACT_QUERIES)
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Inquiry deleted successfully');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        toast.error('Error deleting inquiry');
      }
    }
  };

  const deleteTestimonial = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const { error } = await supabase
          .from('testimonials')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Testimonial deleted successfully');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error('Error deleting testimonial');
      }
    }
  };

  const deleteFaq = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const { error } = await supabase
          .from(TABLES.FAQ)
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('FAQ deleted successfully');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        toast.error('Error deleting FAQ');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Admin Access Required
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Please sign in with admin credentials to access the dashboard.
            </p>
            <div className="text-center">
              <a
                href="/admin-login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Go to Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Checking Access...
            </h1>
            <p className="text-gray-600">
              Verifying your admin permissions
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Access Denied
            </h1>
            <p className="text-gray-600 text-center mb-6">
              You don't have permission to access the admin dashboard.
            </p>
            <div className="text-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <QuestionMarkCircleIcon className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Testimonials</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTestimonials}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <QuestionMarkCircleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total FAQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFaqs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <CogIcon className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Site Content</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSiteContent}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Inquiries</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : data.inquiries.length > 0 ? (
              data.inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{inquiry.name}</p>
                    <p className="text-sm text-gray-600">{inquiry.subject || 'General Inquiry'}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No inquiries yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : data.bookings.length > 0 ? (
              data.bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.name}</p>
                    <p className="text-sm text-gray-600">{booking.classes?.name || 'Unknown Class'}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {booking.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(booking.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => openClassForm()}
              className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-indigo-700">Add New Class</span>
              <PlusIcon className="h-5 w-5 text-indigo-600" />
            </button>
            <button
              onClick={() => openCourseForm()}
              className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-green-700">Add New Course</span>
              <PlusIcon className="h-5 w-5 text-green-600" />
            </button>
            <button
              onClick={() => openGalleryForm()}
              className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-purple-700">Upload Gallery Image</span>
              <PlusIcon className="h-5 w-5 text-purple-600" />
            </button>
            <button
              onClick={() => openTestimonialForm()}
              className="w-full flex items-center justify-between p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-pink-700">Add Testimonial</span>
              <PlusIcon className="h-5 w-5 text-pink-600" />
            </button>
            <button
              onClick={() => openFaqForm()}
              className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-orange-700">Add New FAQ</span>
              <PlusIcon className="h-5 w-5 text-orange-600" />
            </button>
            <button
              onClick={exportAllData}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-700">Export All Data</span>
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div >
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Classes</h2>
          <p className="text-sm text-gray-600 mt-1">
            {data.classes.filter(cls =>
              cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cls.level?.toLowerCase().includes(searchTerm.toLowerCase())
            ).length} of {data.classes.length} classes
            {sortField && (
              <span className="ml-2 text-indigo-600">
                • Sorted by {sortField} ({sortDirection})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <MagnifyingGlassIcon className="h-5 w-4 text-gray-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (sortField === 'name') {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField('name');
                setSortDirection('asc');
              }
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronUpIcon className={`h-4 w-4 mr-1 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
            Sort
          </button>
          <button
            onClick={() => {
              const filteredClasses = data.classes.filter(cls =>
                cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cls.level?.toLowerCase().includes(searchTerm.toLowerCase())
              );
              if (selectedItems.length === filteredClasses.length) {
                setSelectedItems([]);
              } else {
                setSelectedItems(filteredClasses.map(cls => cls.id));
              }
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {selectedItems.length === data.classes.filter(cls =>
              cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cls.level?.toLowerCase().includes(searchTerm.toLowerCase())
            ).length && selectedItems.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={() => openClassForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Class
          </button>
          <button
            onClick={exportClasses}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Export Classes
          </button>
          {searchTerm && (
            <button
              onClick={exportFilteredClasses}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              title={`Export filtered classes (${data.classes.filter(cls =>
                cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cls.level?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length} results)`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
              Export Filtered
            </button>
          )}
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedItems.length} selected item${selectedItems.length > 1 ? 's' : ''}?`)) {
                    selectedItems.forEach(id => deleteClass(id));
                    setSelectedItems([]);
                  }
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.classes.length > 0 ? (
                data.classes
                  .filter(cls =>
                    cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cls.level?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .sort((a, b) => {
                    const aValue = a[sortField] || '';
                    const bValue = b[sortField] || '';
                    if (sortDirection === 'asc') {
                      return aValue.localeCompare(bValue);
                    } else {
                      return bValue.localeCompare(aValue);
                    }
                  })
                  .map((cls) => (
                    <tr key={cls.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.instructor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{cls.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cls.image_url ? (
                          <img
                            src={cls.image_url}
                            alt={cls.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openClassForm(cls)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Edit class"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteClass(cls.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete class"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                        Loading classes...
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm">No classes found</p>
                        <p className="text-xs text-gray-400 mt-1">Add your first class to get started</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => openCourseForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Course
          </button>
          <button
            onClick={exportCourses}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Export Courses
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learning Objectives</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{course.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.duration}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {course.learning_objectives && course.learning_objectives.length > 0 ? (
                      <div className="space-y-1">
                        {course.learning_objectives.slice(0, 3).map((objective, index) => (
                          <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {objective}
                          </div>
                        ))}
                        {course.learning_objectives.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{course.learning_objectives.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No objectives set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openCourseForm(course)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="Edit course"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete course"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInquiries = () => {
    const filteredInquiries = getFilteredInquiries();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Inquiries</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredInquiries.length} of {data.inquiries.length} inquiries
            </p>
          </div>
          <button
            onClick={exportInquiries}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Export Inquiries
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search inquiries..."
                value={inquirySearchTerm}
                onChange={(e) => setInquirySearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MagnifyingGlassIcon className="h-5 w-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Subject Filter */}
            <select
              value={inquirySubjectFilter}
              onChange={(e) => setInquirySubjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {Array.from(new Set(data.inquiries.map(inquiry => inquiry.subject).filter(Boolean))).map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setInquirySearchTerm('');
                setInquirySubjectFilter('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inquiry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inquiry.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inquiry.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inquiry.subject || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{inquiry.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openInquiryModal(inquiry)}
                        className="text-blue-600 hover:text-blue-900 transition-colors mr-2"
                        title="View full inquiry"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete inquiry"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderGallery = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => openGalleryForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload Image
          </button>
          <button
            onClick={exportGallery}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Export Gallery
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.gallery.map((image) => (
          <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={image.url}
                alt={image.title || 'Gallery image'}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">{image.title || 'Untitled'}</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(image.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => deleteGalleryItem(image.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete image"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Testimonials Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => openTestimonialForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Testimonial
          </button>
          <button
            onClick={exportTestimonials}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-4 mr-2" />
            Export Testimonials
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
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
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{testimonial.content}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openTestimonialForm(testimonial)}
                    className="text-green-600 hover:text-green-900 transition-colors"
                    title="Edit testimonial"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTestimonial(testimonial.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete testimonial"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {testimonial.featured && (
                <div className="mt-3">
                  <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => {
    const filteredBookings = getFilteredBookings();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredBookings.length} of {data.bookings.length} bookings
            </p>
          </div>
          <button
            onClick={exportBookings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-4 mr-2" />
            Export Bookings
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                value={bookingSearchTerm}
                onChange={(e) => setBookingSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MagnifyingGlassIcon className="h-5 w-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Status Filter */}
            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>

            {/* Date Filter */}
            <select
              value={bookingDateFilter}
              onChange={(e) => setBookingDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setBookingSearchTerm('');
                setBookingStatusFilter('all');
                setBookingDateFilter('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.classes?.name || 'Unknown Class'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openBookingModal(booking)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View full booking details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          disabled={booking.status === 'confirmed'}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          disabled={booking.status === 'cancelled'}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 cursor-not-allowed'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {data.bookings.length === 0 ? 'No bookings found' : 'No bookings match your filters'}
              </div>
              <p className="text-gray-400">
                {data.bookings.length === 0
                  ? 'Bookings will appear here once customers start booking classes.'
                  : 'Try adjusting your search terms or filters.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFaqs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage FAQs</h2>
        <button
          onClick={() => openFaqForm()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New FAQ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.faqs.length > 0 ? (
                data.faqs.map((faq) => (
                  <tr key={faq.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={faq.question}>
                        {faq.question}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {faq.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {faq.order_index || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${faq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {faq.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openFaqForm(faq)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Edit FAQ"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFaq(faq.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete FAQ"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                        Loading FAQs...
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm">No FAQs found</p>
                        <p className="text-xs text-gray-400 mt-1">Add your first FAQ to get started</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSiteContent = () => {
    const pages = ['home', 'about', 'contact', 'global'];

    // Filter content based on selected page
    const filteredContent = data.siteContent.filter(item => item.page === selectedCmsPage);

    // Group filtered content by section
    const groupedContent = filteredContent.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-4">
            Site Content Management
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => setSelectedCmsPage(page)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 capitalize ${selectedCmsPage === page
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(groupedContent).length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {Object.entries(groupedContent).map(([section, items]) => (
              <div key={section} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 capitalize flex items-center">
                    <CogIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    {section.replace(/_/g, ' ')} Section
                  </h3>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-700">{item.key}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${item.type === 'json' ? 'bg-purple-100 text-purple-700' :
                              item.type === 'image_url' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                              {item.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 italic">
                            {item.type === 'json' ? 'Structured Data Content' :
                              typeof item.value === 'string' ? item.value.replace(/"/g, '') : 'Item Value'}
                          </p>
                        </div>
                        <button
                          onClick={() => openContentForm(item)}
                          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors self-end md:self-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CogIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No content found</h3>
            <p className="text-gray-500 mt-2">There are no content items configured for the {selectedCmsPage} page yet.</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'classes':
        return renderClasses();
      case 'courses':
        return renderCourses();
      case 'bookings':
        return renderBookings();
      case 'inquiries':
        return renderInquiries();
      case 'gallery':
        return renderGallery();
      case 'testimonials':
        return renderTestimonials();
      case 'faqs':
        return renderFaqs();
      case 'content':
        return renderSiteContent();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                {lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={exportAllData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                Export All
              </button>
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mb-8 border-b border-gray-200">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
            { id: 'classes', name: 'Classes', icon: CalendarIcon },
            { id: 'courses', name: 'Courses', icon: BookOpenIcon },
            { id: 'bookings', name: 'Bookings', icon: ClipboardDocumentListIcon },
            { id: 'inquiries', name: 'Inquiries', icon: EnvelopeIcon },
            { id: 'gallery', name: 'Gallery', icon: PhotoIcon },
            { id: 'testimonials', name: 'Testimonials', icon: QuestionMarkCircleIcon },
            { id: 'faqs', name: 'FAQs', icon: QuestionMarkCircleIcon },
            { id: 'content', name: 'Site Content', icon: CogIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div key={activeTab}>
          {renderContent()}
        </div>
      </div>

      {/* Forms */}
      <ClassForm
        isOpen={showClassForm}
        onClose={closeForms}
        editData={editingItem}
        onSuccess={handleFormSuccess}
      />

      <ContentEditForm
        isOpen={showContentForm}
        onClose={closeForms}
        editData={editingItem}
        onSuccess={handleFormSuccess}
      />

      <TeamMemberForm
        isOpen={showTeamForm}
        onClose={closeForms}
        editData={editingItem}
        onSuccess={handleFormSuccess}
      />

      <CourseForm
        isOpen={showCourseForm}
        onClose={closeForms}
        editData={editingItem}
        onSuccess={handleFormSuccess}
      />

      <GalleryUploadForm
        isOpen={showGalleryForm}
        onClose={closeForms}
        onSuccess={handleFormSuccess}
      />

      <TestimonialForm
        isOpen={showTestimonialForm}
        onClose={closeForms}
        editData={editingItem}
        onSuccess={handleFormSuccess}
      />

      <FaqForm
        isOpen={showFaqForm}
        onClose={closeForms}
        editData={editingItem}
        onSuccess={handleFormSuccess}
      />

      {/* Inquiry Modal */}
      {showInquiryModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Inquiry Details</h3>
                <button
                  onClick={closeInquiryModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.subject || 'General Inquiry'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {new Date(selectedInquiry.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeInquiryModal}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this inquiry?')) {
                    deleteInquiry(selectedInquiry.id);
                    closeInquiryModal();
                  }
                }}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedBooking.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedBooking.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedBooking.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedBooking.classes?.name || 'Unknown Class'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {new Date(selectedBooking.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedBooking.time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {new Date(selectedBooking.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedBooking.special_requests}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeBookingModal}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking.id, 'confirmed');
                    closeBookingModal();
                  }}
                  disabled={selectedBooking.status === 'confirmed'}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedBooking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking.id, 'cancelled');
                    closeBookingModal();
                  }}
                  disabled={selectedBooking.status === 'cancelled'}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedBooking.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
