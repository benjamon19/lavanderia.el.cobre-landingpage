// src/pages/tracking/components/TrackingStatus.tsx
import { FaCheckCircle, FaClock } from 'react-icons/fa'

interface TrackingStatusProps {
    currentStage: number
    totalStages: number
}

export default function TrackingStatus({ currentStage, totalStages }: TrackingStatusProps) {
    const progress = (currentStage / totalStages) * 100
    const isComplete = currentStage === totalStages

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border-2 border-[#f0f0f5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-1 sm:mb-2">
                        {isComplete ? 'Pedido Completado' : 'En Proceso'}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-[#6b6b7e]">
                        {isComplete
                            ? 'Tu pedido está listo para ser retirado'
                            : `Etapa ${currentStage} de ${totalStages}`
                        }
                    </p>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-[#ff6b35]'
                    }`}>
                    {isComplete ?
                        <FaCheckCircle className="text-2xl sm:text-3xl" /> :
                        <FaClock className="text-2xl sm:text-3xl" />
                    }
                </div>
            </div>

            <div className="relative">
                <div className="w-full bg-[#f0f0f5] rounded-full h-3 sm:h-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-[#ff6b35] to-[#e85d2e] h-full rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-right text-xs sm:text-sm text-[#6b6b7e] mt-2 font-semibold">
                    {progress.toFixed(0)}% Completado
                </p>
            </div>
        </div>
    )
}
