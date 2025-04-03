"use client"

import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/Header"
import Footer from '@/components/layout/Footer'

export default function TermsOfUse() {
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
      <Header />
      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 md:px-8 font-serif">
        <div className="max-w-3xl mx-auto bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#7D1A1D] text-white py-6 px-6 text-center">
            <h1 className="text-2xl font-serif font-bold">Terms of Use</h1>
            <p className="mt-1 font-serif text-xs sm:text-sm md:text-base leading-tight whitespace-nowrap">Reconnecting Our Past, Empowering Our Future</p>
          </div>

          {/* Card Body */}
          <div className="p-6 md:p-8">
            <div className="prose prose-sm sm:prose max-w-none text-gray-700">
              <p className="mb-4">
                Last Updated: March 26, 2025
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Acceptance of Terms</h2>
              <p className="mb-4 text-gray-700">
                Welcome to Sulyap84, the official alumni website for UPIS Batch 1984. By accessing or using our website, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this website.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Eligibility</h2>
              <p className="mb-4 text-gray-700">
                This website is primarily intended for UPIS Batch 1984 alumni. To create an account and access member-only features, you must be a verified alumnus of UPIS Batch 1984 or an approved associate member. The administrators reserve the right to verify your identity and alumni status before approving access.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">User Accounts</h2>
              <p className="mb-4 text-gray-700">
                When creating an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account or any other breach of security.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">User Conduct</h2>
              <p className="mb-2 text-gray-700">As a user of Sulyap84, you agree not to:</p>
              <ul className="list-disc pl-5 mb-4 text-gray-700">
                <li className="mb-2">Post content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                <li className="mb-2">Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
                <li className="mb-2">Upload or share any content that infringes upon any patent, trademark, trade secret, copyright, or other proprietary rights</li>
                <li className="mb-2">Upload or transmit any material that contains software viruses or other harmful computer code</li>
                <li className="mb-2">Interfere with or disrupt the website or servers or networks connected to the website</li>
                <li className="mb-2">Use the website for commercial purposes or unauthorized advertising without our explicit permission</li>
                <li className="mb-2">Collect or store personal data about other users without their consent</li>
              </ul>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Content and Submissions</h2>
              <p className="mb-4 text-gray-700">
                By posting content on our website, you grant Sulyap84 a non-exclusive, royalty-free license to use, reproduce, modify, and display such content in connection with the website and our alumni community activities. You represent and warrant that you own or have the necessary rights to the content you post and that it does not violate any third-party rights.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Intellectual Property</h2>
              <p className="mb-4 text-gray-700">
                The content on this website, including but not limited to text, graphics, logos, icons, images, audio clips, and software, is the property of Sulyap84 or its content suppliers and is protected by copyright and other intellectual property laws. The compilation of all content on this site is the exclusive property of Sulyap84.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Marketplace Guidelines</h2>
              <p className="mb-4 text-gray-700">
                Our marketplace feature is provided as a platform for alumni to buy, sell, or exchange items within our community. Sulyap84 is not responsible for the quality, safety, or legality of items listed, the accuracy of listings, or the ability of sellers to sell or buyers to buy. All transactions are conducted directly between users, and we do not act as an agent or intermediary.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Limitation of Liability</h2>
              <p className="mb-4 text-gray-700">
                In no event shall Sulyap84, its officers, directors, employees, or agents, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the website. This includes, but is not limited to, damages for loss of profits, data, use, or other intangible losses.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Indemnification</h2>
              <p className="mb-4 text-gray-700">
                You agree to indemnify, defend, and hold harmless Sulyap84, its officers, directors, employees, and agents, from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the website or your violation of these Terms of Use.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Termination</h2>
              <p className="mb-4 text-gray-700">
                We reserve the right to terminate or suspend your account and access to the website at our sole discretion, without notice, for conduct that we believe violates these Terms of Use or is harmful to other users, us, or third parties, or for any other reason.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Changes to Terms</h2>
              <p className="mb-4 text-gray-700">
                We may revise these Terms of Use at any time without notice. By continuing to use the website after any changes, you accept and agree to be bound by the revised terms.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Governing Law</h2>
              <p className="mb-4 text-gray-700">
                These Terms of Use are governed by and construed in accordance with the laws of the Philippines, without regard to its conflict of law principles.
              </p>
              
              <h2 className="text-xl font-bold text-[#7D1A1D] mt-6 mb-3">Contact Us</h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about these Terms of Use, please contact us at <a href="mailto:admin@sulyap84.org" className="text-[#7D1A1D] underline">admin@sulyap84.org</a>.
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
      <Footer />
    </div>
  )
} 