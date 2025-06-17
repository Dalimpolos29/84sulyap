# 84Sulyap

A modern web platform designed to reconnect UPIS (University of the Philippines Integrated School) Class of 1984 alumni, fostering community engagement and maintaining lifelong connections.

🌐 **Live Application**: [https://sulyap84.vercel.app](https://sulyap84.vercel.app)

## ✨ Features

- 🔐 **Secure Authentication** - Email-based authentication system
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 👤 **Profile Management** - Comprehensive alumni profile creation and editing
- 📖 **Alumni Directory** - Searchable directory of class members
- 🔒 **Data Security** - Secure data storage with Supabase
- 🎨 **Modern UI** - Clean, intuitive interface built with Tailwind CSS
- ⚡ **Fast Performance** - Built with Next.js for optimal performance

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework for production
- **Database**: [Supabase](https://supabase.com/) - Open source Firebase alternative
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **UI Components**: 
  - [Headless UI](https://headlessui.com/) - Unstyled, accessible UI components
  - [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
  - [Lucide React](https://lucide.dev/) - Beautiful & consistent icon toolkit
- **Animation**: [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library
- **Charts**: [Chart.js](https://www.chartjs.org/) with React Chart.js 2
- **Deployment**: [Vercel](https://vercel.com/) - Automatic deployments

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (comes with Node.js)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dalimpolos29/84sulyap.git
cd 84sulyap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get your Supabase credentials:**
1. Go to [Supabase](https://supabase.com/) and create a new project
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
84sulyap/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── members/        # Members directory
│   │   ├── profile/        # Profile management
│   │   └── ...
│   ├── components/         # Reusable UI components
│   │   ├── features/       # Feature-specific components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Generic UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── styles/             # Global styles
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── ...
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Live Demo

The application is live and accessible at: **[https://sulyap84.vercel.app](https://sulyap84.vercel.app)**

## 🚀 Deployment

This project is configured for automatic deployment on Vercel:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add your environment variables in Vercel dashboard
3. **Auto Deploy**: Pushes to the main branch automatically trigger deployments

### Manual Deployment

```bash
npm run build
npm run start
```

### Environment Variables for Production

Make sure to set these environment variables in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

We welcome contributions from the UPIS 84 community! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure responsive design
- Write meaningful commit messages
- Test your changes thoroughly

## 📝 License

This project is private and intended for UPIS Class of 1984 alumni use only.

## 📞 Support

For questions, issues, or suggestions:

- **GitHub Issues**: [Create an issue](https://github.com/Dalimpolos29/84sulyap/issues)
- **Email**: Contact the development team

## 🎓 About UPIS 84

This platform is dedicated to the University of the Philippines Integrated School Class of 1984, helping maintain the bonds formed during our formative years and celebrating our shared journey.

---

**Built with ❤️ by the UPIS 84 Community** 