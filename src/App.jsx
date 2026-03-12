import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Classes from './pages/Classes';
import Courses from './pages/Courses';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AuthTest from './pages/AuthTest';
import ClassDetail from './pages/ClassDetail';
import CourseDetail from './pages/CourseDetail';
import { AuthProvider } from './contexts/AuthContext';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/admin-login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth-test" element={<AuthTest />} />
                <Route path="/class/:id" element={<ClassDetail />} />
                <Route path="/course/:id" element={<CourseDetail />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
            <Toaster position="top-right" />
          </div>
        </Router>
      </HelmetProvider>
    </AuthProvider>
  );
}

export default App;
