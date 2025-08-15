# Abhilaksh Yoga Website

A modern, mobile-first yoga institute website built with React.js, Tailwind CSS, and Supabase.

## 🧘‍♀️ Features

- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Modern Stack**: React.js, Vite, Tailwind CSS, Framer Motion
- **Backend Integration**: Supabase for database, authentication, and file storage
- **Admin Panel**: Secure admin dashboard for content management
- **Contact Forms**: Integrated contact and interest forms
- **SEO Optimized**: Meta tags and semantic HTML structure
- **Accessibility**: WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd abhilakshyoga
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   └── Footer.jsx      # Site footer
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── About.jsx       # About page
│   ├── Contact.jsx     # Contact page
│   ├── Login.jsx       # Admin login
│   └── ...             # Other pages
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── utils/              # Utility functions
│   └── supabase.js     # Supabase configuration
└── assets/             # Static assets
```

## 🎨 Design System

### Colors
- **Primary Orange**: `#FF6B35`
- **Primary Green**: `#4CAF50`
- **Gradient**: Orange to Green transition

### Typography
- **Headings**: Poppins (Bold, Semi-bold)
- **Body**: Inter (Regular, Medium)

### Components
- **Buttons**: Primary (gradient), Secondary (outline)
- **Cards**: White background with subtle shadows
- **Forms**: Clean, accessible form elements

## 📱 Pages & Features

### 1. Home Page
- Hero section with call-to-action
- Featured classes and courses
- Student testimonials
- Gallery preview
- Newsletter signup

### 2. About Page
- Studio story and philosophy
- Team member profiles
- Timeline of achievements
- Awards and recognition

### 3. Contact Page
- Contact form with validation
- Contact information
- Interactive map
- FAQ preview

### 4. Admin Panel
- Secure login system
- Content management (CRUD)
- User inquiry management
- Analytics dashboard

## 🗄️ Database Schema

### Tables
- `classes` - Yoga class information
- `courses` - Teacher training courses
- `gallery` - Media files
- `testimonials` - Student reviews
- `faq` - Frequently asked questions
- `contact_queries` - Contact form submissions
- `interest_forms` - Class/course interest forms
- `users` - Admin users

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Set up the database tables (see schema above)
3. Configure authentication
4. Set up storage buckets for media files
5. Add environment variables

### Tailwind CSS

The project uses Tailwind CSS with custom configuration:
- Custom color palette
- Custom component classes
- Responsive design utilities

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🔒 Security

- Environment variables for sensitive data
- Supabase Row Level Security (RLS)
- Input validation and sanitization
- HTTPS enforcement

## 📈 Performance

- Lazy loading for images
- Code splitting with React Router
- Optimized bundle size
- CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: info@abhilakshyoga.com
- Phone: +91 98765 43210

## 🙏 Acknowledgments

- Unsplash for beautiful yoga images
- Heroicons for icons
- Framer Motion for animations
- Supabase for backend services

---

**Built with ❤️ for Abhilaksh Yoga**
# abhilakshYogaComplete
