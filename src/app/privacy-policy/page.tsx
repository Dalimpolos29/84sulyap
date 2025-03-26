"use client"

import Link from "next/link"
import Image from "next/image"

export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#E5DFD0",
        backgroundImage:
          "radial-gradient(#7D1A1D 0.5px, transparent 0.5px), radial-gradient(#C9A335 0.5px, #E5DFD0 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header - identical to login page header */}
      <header className="bg-[#7D1A1D] text-white py-4">
        <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border border-[#C9A335] shadow-md">
              <Image
                src="/images/logo.svg"
                alt="UPIS 84 Logo"
                width={48}
                height={48}
                className="rounded-full object-cover"
                priority
              />
            </div>
            <span className="font-serif font-bold text-xl">Sulyap84</span>
          </Link>
          <div className="text-white font-serif font-medium">UPIS Alumni Portal</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 md:px-8 font-serif">
        <div className="max-w-3xl mx-auto bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#7D1A1D] text-white py-6 px-6 text-center">
            <h1 className="text-2xl font-serif font-bold">Privacy Policy</h1>
            <p className="mt-1 font-serif text-xs sm:text-sm md:text-base leading-tight whitespace-nowrap">Reconnecting Our Past, Empowering Our Future</p>
          </div>

          {/* Card Body */}
          <div className="p-6 md:p-8">
            <div className="prose prose-sm sm:prose max-w-none text-gray-700">
              <p className="mb-4">
                Last Updated: March 26, 2025
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Overview</h2>
              <p className="mb-4">
                Welcome to Sulyap84, the official alumni website for UPIS Batch 1984. We are committed to protecting your privacy and ensuring a secure experience. This Privacy Policy outlines how we collect, use, and safeguard your personal information.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Information We Collect</h2>
              <p className="mb-2">We may collect the following types of information:</p>
              <ul className="list-disc pl-5 mb-4 text-gray-700">
                <li className="mb-2"><strong className="text-gray-800">Personal Information:</strong> Name, email address, phone number, birthday, and other information you provide during registration or profile updates.</li>
                <li className="mb-2"><strong className="text-gray-800">Profile Information:</strong> Educational background, professional details, and other information you choose to share in your alumni profile.</li>
                <li className="mb-2"><strong className="text-gray-800">Usage Data:</strong> Information about how you interact with our website, including login times, features used, and pages visited.</li>
                <li className="mb-2"><strong className="text-gray-800">Device Information:</strong> Information about the device and browser you use to access our site.</li>
                <li className="mb-2"><strong className="text-gray-800">Communication Data:</strong> Messages, comments, and other content you post on the platform.</li>
              </ul>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">How We Use Your Information</h2>
              <p className="mb-2">We use your information for the following purposes:</p>
              <ul className="list-disc pl-5 mb-4 text-gray-700">
                <li className="mb-2">To provide and maintain the alumni directory and platform services</li>
                <li className="mb-2">To notify you about events, updates, and important announcements</li>
                <li className="mb-2">To improve our website and user experience</li>
                <li className="mb-2">To enable community features such as messaging and discussion forums</li>
                <li className="mb-2">To facilitate the marketplace feature for alumni exchanges</li>
                <li className="mb-2">To secure your account and protect our services</li>
              </ul>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Data Storage and Security</h2>
              <p className="mb-4 text-gray-700">
                We use Supabase for authentication and data storage. Your personal information is stored securely with encryption and protected through industry-standard security measures. We implement appropriate technical and organizational measures to prevent unauthorized access, disclosure, modification, or unauthorized destruction of your data.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Data Sharing</h2>
              <p className="mb-4 text-gray-700">
                We do not sell your personal information to third parties. Your information may be visible to other alumni members as part of the directory feature, based on your privacy settings. We may share limited information with trusted service providers who assist us in operating the website, conducting our business, or servicing you.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Your Rights</h2>
              <p className="mb-2 text-gray-700">You have the right to:</p>
              <ul className="list-disc pl-5 mb-4 text-gray-700">
                <li className="mb-2">Access, update, or delete your personal information</li>
                <li className="mb-2">Adjust your privacy settings to control what information is visible to others</li>
                <li className="mb-2">Opt-out of communications</li>
                <li className="mb-2">Request a copy of your data</li>
              </ul>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Cookies and Tracking</h2>
              <p className="mb-4 text-gray-700">
                We use cookies and similar tracking technologies to enhance your experience on our site, analyze site usage, and assist in our marketing efforts. You can control cookies through your browser settings.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Changes to This Privacy Policy</h2>
              <p className="mb-4 text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes and post the updated policy on our website.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Contact Us</h2>
              <p className="mb-4 text-gray-700">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at <a href="mailto:admin@sulyap84.org" className="text-[#7D1A1D] underline">admin@sulyap84.org</a>.
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/login" className="inline-block bg-[#7D1A1D] text-white px-4 py-2 rounded-md hover:bg-[#6a1518] transition-colors font-medium">
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 