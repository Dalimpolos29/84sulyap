'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Calendar, Users, Mail, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const [stats, setStats] = useState({
    memberCount: 0,
    yearsActive: 41 // Since 1984 to 2025
  })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch member count
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch upcoming events (titles only, max 3)
      const { data: events } = await supabase
        .from('events')
        .select('id, title')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3)

      setStats({
        memberCount: memberCount || 0,
        yearsActive: 41
      })
      setUpcomingEvents(events || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full screen with BATCH collage */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/landing/batch-collage.gif"
            alt="UPIS Batch 84"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-serif tracking-tight">
            SULYAP
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-4 font-serif italic">
            Then & Now
          </p>
          <p className="text-xl md:text-2xl text-white/80 mb-12">
            UP Integrated School • Batch '84
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#7D1A1D] hover:bg-[#661518] text-white px-12 py-5 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-2xl"
          >
            Enter Portal
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Story Section 1 - THEN */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/landing/hero-oblation.jpg"
                  alt="UP Oblation"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative Badge */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32">
                <Image
                  src="/images/landing/badge-1.gif"
                  alt="Badge"
                  width={128}
                  height={128}
                  className="w-full h-full drop-shadow-xl"
                />
              </div>
            </div>

            {/* Right - Story */}
            <div>
              <div className="inline-block bg-[#7D1A1D]/10 text-[#7D1A1D] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                1984
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-[#7D1A1D] mb-6 font-serif">
                THEN
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                We walked the halls of UP Integrated School, forging friendships that would last a lifetime. We were dreamers, achievers, and pioneers—united by our shared experiences and the Oblation's timeless call to serve.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From classroom discussions to campus traditions, we built memories that shaped who we are today. Batch '84 wasn't just a year—it was the beginning of a legacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Timeline */}
      <section className="py-16 bg-[#7D1A1D] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-6xl font-bold mb-3 font-serif">1984</div>
              <div className="text-xl text-white/80">Where It All Began</div>
            </div>
            <div>
              <div className="text-6xl font-bold mb-3 font-serif">
                {loading ? '...' : stats.memberCount}
              </div>
              <div className="text-xl text-white/80">Alumni Connected</div>
            </div>
            <div>
              <div className="text-6xl font-bold mb-3 font-serif">{stats.yearsActive}+</div>
              <div className="text-xl text-white/80">Years of Brotherhood</div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section 2 - NOW */}
      <section className="relative py-24 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Story */}
            <div className="order-2 md:order-1">
              <div className="inline-block bg-[#0B5A28]/10 text-[#0B5A28] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                2025
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-[#0B5A28] mb-6 font-serif">
                NOW
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                Decades later, we've grown into leaders, professionals, and changemakers across the globe. Yet the bonds we formed at UPIS remain as strong as ever.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                This portal is our digital reunion—a place to reconnect, reminisce, and reignite the spirit of Batch '84. Together, we continue to honor our shared history while building new memories.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[#0B5A28] hover:text-[#094821] font-semibold text-lg group"
              >
                Learn Our Story
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right - Badge */}
            <div className="order-1 md:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#7D1A1D] to-[#0B5A28] p-12 flex items-center justify-center">
                <Image
                  src="/images/landing/badge-2.gif"
                  alt="UPIS Batch 84 Badge"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#7D1A1D] mb-4 font-serif">
                Upcoming Gatherings
              </h2>
              <p className="text-xl text-gray-600">Mark your calendars</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 hover:border-[#7D1A1D] hover:shadow-lg transition-all"
                >
                  <Calendar className="w-8 h-8 text-[#C9A335] mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm">Login to view details</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#7D1A1D] hover:bg-[#661518] text-white px-10 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                View Event Details
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Join Us */}
      <section className="relative py-32 bg-gradient-to-br from-[#7D1A1D] to-[#0B5A28] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-serif">
            Continue the Journey
          </h2>
          <p className="text-2xl text-white/90 mb-12 leading-relaxed">
            Whether you're reconnecting with old friends or discovering new stories, your Batch '84 family is waiting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#7D1A1D] hover:bg-gray-100 px-12 py-5 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-2xl"
            >
              Member Login
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 px-12 py-5 rounded-full text-lg font-bold transition-all"
            >
              Get in Touch
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">UPIS Batch '84</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                A digital home for our alumni community to reconnect, share stories, and celebrate our shared legacy.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-[#C9A335] transition-colors text-sm">
                  About Us
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-[#C9A335] transition-colors text-sm">
                  Contact
                </Link>
                <Link href="/login" className="block text-gray-400 hover:text-[#C9A335] transition-colors text-sm">
                  Member Login
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy-policy" className="block text-gray-400 hover:text-[#C9A335] transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-use" className="block text-gray-400 hover:text-[#C9A335] transition-colors text-sm">
                  Terms of Use
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 UPIS Batch '84. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
