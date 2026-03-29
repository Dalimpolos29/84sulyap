import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 font-serif text-[#7D1A1D]">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-0 relative z-10">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#C9A335]"></div>
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-lg z-10 m-auto">
              <Image
                src="/images/logo.svg"
                alt="UPIS 84 Logo"
                width={128}
                height={128}
                className="rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden mt-[-1rem]">
          <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-[#7D1A1D] mb-6">
            Our Story
          </h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              Welcome to the official alumni portal of the University of the Philippines Integrated School (UPIS) Batch 1984.
            </p>

            <p className="text-gray-700 mb-4">
              We are a community of alumni who graduated from UPIS in 1984, reconnecting and staying in touch through this digital platform.
            </p>

            <h3 className="text-2xl font-semibold text-[#0B5A28] mt-8 mb-4">
              Our Mission
            </h3>

            <p className="text-gray-700 mb-4">
              To foster lifelong connections among Batch '84 alumni, celebrate our shared heritage, and support each other's personal and professional growth.
            </p>

            <h3 className="text-2xl font-semibold text-[#0B5A28] mt-8 mb-4">
              What We Offer
            </h3>

            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Alumni Directory - Connect with batchmates</li>
              <li>Events & Reunions - Stay updated on gatherings</li>
              <li>Photo Gallery - Relive cherished memories</li>
              <li>Digital Yearbook - Browse our Sulyap</li>
              <li>Community Feed - Share updates and stories</li>
            </ul>

            <h3 className="text-2xl font-semibold text-[#0B5A28] mt-8 mb-4">
              Join Us
            </h3>

            <p className="text-gray-700 mb-6">
              If you're a member of UPIS Batch '84 and would like to join our community, please contact us through our contact page.
            </p>
          </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                href="/contact"
                className="bg-[#0B5A28] hover:bg-[#094821] text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Contact Us
              </Link>
              <Link
                href="/login"
                className="bg-[#7D1A1D] hover:bg-[#661518] text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Member Login
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; 2025 UPIS Batch '84. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
