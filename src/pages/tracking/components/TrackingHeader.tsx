// src/pages/tracking/components/TrackingHeader.tsx
import { useState } from "react"
import { FaSearch, FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

interface TrackingHeaderProps {
  trackingCode: string
}

export default function TrackingHeader({ trackingCode }: TrackingHeaderProps) {
  const navigate = useNavigate()
  const [inputCode, setInputCode] = useState(trackingCode)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputCode.trim()) {
      navigate(`/tracking/${inputCode.trim()}`)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#ff6b35] to-[#e85d2e] rounded-b-[2.5rem] shadow-lg px-3 sm:px-4 py-8 sm:py-10 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGoBack}
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            aria-label="Volver"
          >
            <FaArrowLeft className="text-lg sm:text-xl" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Rastrea tu pedido</h1>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Ej: ORD-2011-7479"
            className="flex-1 px-4 py-3 border-2 border-white/30 bg-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all text-[#1a1a2e] placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="bg-white text-[#ff6b35] px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <FaSearch /> Buscar
          </button>
        </form>
      </div>
    </div>
  )
}
