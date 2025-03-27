export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" 
      style={{
        backgroundColor: "#E5DFD0",
        backgroundImage:
          "radial-gradient(#7D1A1D 0.5px, transparent 0.5px), radial-gradient(#C9A335 0.5px, #E5DFD0 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7D1A1D]"></div>
        <p className="mt-4 text-[#7D1A1D] font-serif font-medium">Loading your profile...</p>
      </div>
    </div>
  )
} 