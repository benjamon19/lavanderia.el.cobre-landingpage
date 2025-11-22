// src/pages/tracking/components/TrackingHistory.tsx
import { FaClipboardCheck } from 'react-icons/fa'

interface HistoryEvent {
  estado: string
  comentario: string
  fechaCambio: any // Timestamp de Firestore
  operarioNombre?: string
}

interface TrackingHistoryProps {
  history: HistoryEvent[]
}

export default function TrackingHistory({ history }: TrackingHistoryProps) {
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Fecha no disponible'
    
    try {
      // Si es un Timestamp de Firestore
      if (timestamp.toDate) {
        const date = timestamp.toDate()
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.'
        const displayHours = hours % 12 || 12
        return `${day}-${month}-${year} ${displayHours}:${minutes} ${ampm}`
      }
      
      // Si es un string o Date
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.'
        const displayHours = hours % 12 || 12
        return `${day}-${month}-${year} ${displayHours}:${minutes} ${ampm}`
      }
      
      return 'Fecha no disponible'
    } catch (error) {
      return 'Fecha no disponible'
    }
  }

  const getEstadoDisplayName = (estado: string): string => {
    const estadoMap: Record<string, string> = {
      'pendiente': 'Procesos Pendientes',
      'lavado': 'Lavado',
      'secado': 'Secado',
      'planchado': 'Planchado',
      'empaquetado': 'Empaquetado',
      'preparando_despacho': 'Preparando Despacho',
      'en_despacho': 'En Despacho',
      'entregado': 'Entregado'
    }
    return estadoMap[estado] || estado
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 border-2 border-[#f0f0f5]">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1a1a2e] mb-4 sm:mb-6">
          Historial del pedido
        </h2>
        <p className="text-sm sm:text-base text-[#6b6b7e]">
          No hay historial disponible para este pedido.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 border-2 border-[#f0f0f5]">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1a1a2e] mb-4 sm:mb-6">
        Historial del pedido
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {history.map((event, index) => (
          <div
            key={index}
            className="flex gap-3 sm:gap-4 items-start pb-4 sm:pb-6 last:pb-0 border-b-2 border-[#f0f0f5] last:border-0"
          >
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ff6b35] text-white flex items-center justify-center">
              <FaClipboardCheck className="text-base sm:text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-1">
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a2e] mb-1">
                    {getEstadoDisplayName(event.estado)}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6b6b7e]">
                    {event.comentario}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-[#6b6b7e] whitespace-nowrap">
                    {formatDate(event.fechaCambio)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

