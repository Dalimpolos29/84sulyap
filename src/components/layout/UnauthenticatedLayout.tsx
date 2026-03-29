'use client'

import Header from './Header'
import Footer from './Footer'

interface UnauthenticatedLayoutProps {
  children: React.ReactNode
}

export default function UnauthenticatedLayout({ children }: UnauthenticatedLayoutProps) {
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
      
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}