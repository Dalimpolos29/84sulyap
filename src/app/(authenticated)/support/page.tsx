'use client'

import { 
  Heart, 
  Coffee, 
  Code, 
  Zap, 
  Github, 
  Mail, 
  ExternalLink,
  Star,
  Users,
  Sparkles
} from 'lucide-react'

export default function SupportPage() {
  return (
    <div 
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8"
      style={{
        color: "#333333"
      }}
    >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Support the Developer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Help keep the UPIS '84 Alumni Portal running and growing. Your support enables continuous 
            development and new features for our community.
          </p>
        </div>

        {/* Developer Story Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
              <Code className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">About the Developer</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dennis Alimpolos</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                I'm a solo developer who created this entire Alumni Portal using modern AI assistance 
                and my programming skills. This project represents countless hours of development, 
                design, and testing to create a platform that brings our UPIS '84 community together.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4 inline mr-1" />
                  AI-Assisted Development
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Users className="w-4 h-4 inline mr-1" />
                  Community Focused
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Solo Project
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3">Project Highlights</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-emerald-600 mr-2" />
                  Modern Next.js 15 with React
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-emerald-600 mr-2" />
                  Supabase backend integration
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-emerald-600 mr-2" />
                  Responsive design & animations
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-emerald-600 mr-2" />
                  Advanced member profiles
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-emerald-600 mr-2" />
                  Real-time features
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Coffee Support */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="bg-amber-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Coffee className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Buy Me a Coffee</h3>
            <p className="text-gray-600 mb-6">
              Support with a small donation to fuel late-night coding sessions and keep the development going.
            </p>
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              <Coffee className="w-5 h-5 inline mr-2" />
              ₱50 - ₱500
            </button>
          </div>

          {/* Monthly Support */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-emerald-200">
            <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Heart className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Support</h3>
            <p className="text-gray-600 mb-6">
              Become a regular supporter to help with hosting costs, domain renewal, and continuous development.
            </p>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              <Heart className="w-5 h-5 inline mr-2" />
              ₱100 - ₱1000/month
            </button>
            <div className="mt-3 text-sm text-emerald-600 font-medium">Most Popular</div>
          </div>

          {/* One-time Donation */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">One-time Donation</h3>
            <p className="text-gray-600 mb-6">
              Make a one-time contribution to show appreciation for the platform and support future features.
            </p>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              <Sparkles className="w-5 h-5 inline mr-2" />
              Any Amount
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Payment Methods</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GCash</h3>
              <div className="bg-blue-50 p-6 rounded-xl">
                <p className="text-2xl font-bold text-blue-600 mb-2">0917-XXX-XXXX</p>
                <p className="text-gray-600">Dennis Alimpolos</p>
                <p className="text-sm text-gray-500 mt-2">Send a screenshot of your payment for confirmation</p>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Transfer</h3>
              <div className="bg-emerald-50 p-6 rounded-xl">
                <p className="text-lg font-semibold text-emerald-600 mb-2">BPI/BDO</p>
                <p className="text-gray-600">Account details available upon request</p>
                <p className="text-sm text-gray-500 mt-2">Contact me for bank account information</p>
              </div>
            </div>
          </div>
        </div>

        {/* Other Ways to Help */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Other Ways to Help</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Github className="w-8 h-8 text-gray-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Share Feedback</h3>
              <p className="text-gray-600 text-sm">Report bugs, suggest features, or share your experience using the platform.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Spread the Word</h3>
              <p className="text-gray-600 text-sm">Tell other UPIS '84 alumni about the platform and encourage them to join.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Star className="w-8 h-8 text-gray-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Content Contribution</h3>
              <p className="text-gray-600 text-sm">Share photos, memories, or help with content moderation and community building.</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
            Have questions about supporting the project or want to discuss custom features for our community? 
            I'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:dennis.alimpolos@example.com" 
              className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Me
            </a>
            <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              View Project Details
            </button>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for considering supporting this project. Every contribution, no matter the size, 
            helps keep our UPIS '84 community connected and thriving in the digital space.
          </p>
          <p className="text-emerald-600 font-semibold mt-4">
            — Dennis Alimpolos, Developer & UPIS '84 Alumni
          </p>
        </div>
      </div>
    )
  }