// src/pages/tracking/components/TrackingOrderInfo.tsx
import { FaBolt } from 'react-icons/fa'

interface TrackingOrderInfoProps {
  orderNumber: string
  clientName?: string
  entryDate?: string
  entryTime?: string
  isExpress?: boolean
}

export default function TrackingOrderInfo({
  orderNumber,
  clientName,
  entryDate,
  entryTime,
  isExpress = false
}: TrackingOrderInfoProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border-2 border-[#f0f0f5]">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-4 sm:mb-6">
        Pedido {orderNumber}
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          {clientName && (
            <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e] mb-2 sm:mb-3">
              Cliente: <span className="font-semibold">{clientName}</span>
            </p>
          )}
          {isExpress && (
            <div className="inline-flex items-center gap-2 bg-[#fff4f0] border-2 border-[#ff6b35] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mt-2 sm:mt-3">
              <FaBolt className="text-[#ff6b35] text-sm sm:text-base" />
              <span className="text-xs sm:text-sm md:text-base font-semibold text-[#ff6b35]">
                Servicio Express
              </span>
            </div>
          )}
        </div>

        {(entryDate || entryTime) && (
          <div className="text-right">
            <p className="text-xs sm:text-sm text-[#6b6b7e] mb-1">Ingreso</p>
            {entryDate && (
              <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1a1a2e]">
                {entryDate}
              </p>
            )}
            {entryTime && (
              <p className="text-xs sm:text-sm text-[#6b6b7e] mt-1">
                {entryTime}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

