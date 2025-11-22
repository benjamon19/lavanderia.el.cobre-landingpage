// src/pages/tracking/components/TrackingTimeline.tsx
import {
    FaClipboardCheck,
    FaWind,
    FaCheckCircle,
    FaCheck,
    FaTruck,
    FaBox
} from 'react-icons/fa'
import { GiIronCross } from 'react-icons/gi'
import { FaDroplet } from 'react-icons/fa6'

interface HistoryEvent {
    estado: string
    fechaCambio: any
}

interface Stage {
    id: number
    estado: string
    name: string
    description: string
    icon: React.ReactNode
    timestamp: string
    status: 'completed' | 'in-progress' | 'pending'
}

interface TrackingTimelineProps {
    currentEstado?: string
    history?: HistoryEvent[]
}

export default function TrackingTimeline({ currentEstado, history = [] }: TrackingTimelineProps) {
    // Mapeo de estados a IDs de etapa
    const estadoToStageId: Record<string, number> = {
        'pendiente': 1,
        'lavado': 2,
        'secado': 3,
        'planchado': 4,
        'empaquetado': 5,
        'preparando_despacho': 6,
        'en_despacho': 7,
        'entregado': 8
    }

    const currentStageId = currentEstado ? (estadoToStageId[currentEstado] || 1) : 1

    const formatDate = (timestamp: any): string => {
        if (!timestamp) return 'Pendiente'

        try {
            if (timestamp.toDate) {
                const date = timestamp.toDate()
                const day = date.getDate().toString().padStart(2, '0')
                const month = (date.getMonth() + 1).toString().padStart(2, '0')
                const year = date.getFullYear()
                const hours = date.getHours()
                const minutes = date.getMinutes().toString().padStart(2, '0')
                const ampm = hours >= 12 ? 'p. m.' : 'a. m.'
                const displayHours = hours % 12 || 12
                return `${day}-${month}-${year}, ${displayHours}:${minutes} ${ampm}`
            }
            if (typeof timestamp === 'string') {
                const date = new Date(timestamp)
                const day = date.getDate().toString().padStart(2, '0')
                const month = (date.getMonth() + 1).toString().padStart(2, '0')
                const year = date.getFullYear()
                const hours = date.getHours()
                const minutes = date.getMinutes().toString().padStart(2, '0')
                const ampm = hours >= 12 ? 'p. m.' : 'a. m.'
                const displayHours = hours % 12 || 12
                return `${day}-${month}-${year}, ${displayHours}:${minutes} ${ampm}`
            }
            return 'Pendiente'
        } catch (error) {
            return 'Pendiente'
        }
    }

    const getTimestampForEstado = (estado: string): string => {
        const event = history.find(e => e.estado === estado)
        return event ? formatDate(event.fechaCambio) : 'Pendiente'
    }

    const stages: Stage[] = [
        {
            id: 1,
            estado: 'pendiente',
            name: 'Procesos Pendientes',
            description: 'Tu pedido ha sido recibido y registrado',
            icon: <FaClipboardCheck className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('pendiente'),
            status: currentStageId >= 1 ? (currentStageId > 1 ? 'completed' : 'in-progress') : 'pending'
        },
        {
            id: 2,
            estado: 'lavado',
            name: 'Lavado',
            description: 'Tu ropa está siendo lavada con cuidado',
            icon: <FaDroplet className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('lavado'),
            status: currentStageId > 2 ? 'completed' : currentStageId === 2 ? 'in-progress' : 'pending'
        },
        {
            id: 3,
            estado: 'secado',
            name: 'Secado',
            description: 'Proceso de secado en marcha',
            icon: <FaWind className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('secado'),
            status: currentStageId > 3 ? 'completed' : currentStageId === 3 ? 'in-progress' : 'pending'
        },
        {
            id: 4,
            estado: 'planchado',
            name: 'Planchado',
            description: 'Tu ropa está siendo planchada',
            icon: <GiIronCross className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('planchado'),
            status: currentStageId > 4 ? 'completed' : currentStageId === 4 ? 'in-progress' : 'pending'
        },
        {
            id: 5,
            estado: 'empaquetado',
            name: 'Empaquetado',
            description: 'Tu pedido está siendo empaquetado',
            icon: <FaBox className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('empaquetado'),
            status: currentStageId > 5 ? 'completed' : currentStageId === 5 ? 'in-progress' : 'pending'
        },
        {
            id: 6,
            estado: 'preparando_despacho',
            name: 'Preparando Despacho',
            description: 'Tu pedido está siendo preparado para el despacho',
            icon: <FaBox className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('preparando_despacho'),
            status: currentStageId > 6 ? 'completed' : currentStageId === 6 ? 'in-progress' : 'pending'
        },
        {
            id: 7,
            estado: 'en_despacho',
            name: 'En Despacho',
            description: 'Tu pedido está en camino',
            icon: <FaTruck className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('en_despacho'),
            status: currentStageId > 7 ? 'completed' : currentStageId === 7 ? 'in-progress' : 'pending'
        },
        {
            id: 8,
            estado: 'entregado',
            name: 'Entregado',
            description: 'Tu pedido ha sido entregado',
            icon: <FaCheckCircle className="text-base sm:text-xl md:text-2xl" />,
            timestamp: getTimestampForEstado('entregado'),
            status: currentStageId >= 8 ? 'completed' : 'pending'
        }
    ]

    const getStatusStyles = (status: Stage['status']) => {
        switch (status) {
            case 'completed':
                return {
                    container: 'bg-green-50 border-green-200',
                    icon: 'bg-green-500 text-white',
                    text: 'text-green-700',
                    line: 'bg-green-500'
                }
            case 'in-progress':
                return {
                    container: 'bg-orange-50 border-[#ff6b35]',
                    icon: 'bg-gradient-to-br from-[#ff6b35] to-[#e85d2e] text-white',
                    text: 'text-[#ff6b35]',
                    line: 'bg-[#cfcfd8]'
                }
            case 'pending':
                return {
                    container: 'bg-gray-50 border-gray-200',
                    icon: 'bg-gray-300 text-gray-500',
                    text: 'text-gray-500',
                    line: 'bg-[#cfcfd8]'
                }
        }
    }

    return (
        <div className="w-full py-4 sm:py-8 overflow-x-auto">
            <div className="min-w-[320px] px-2">
                <div className="flex justify-between items-start relative">
                    {stages.map((stage, index) => {
                        const isLast = index === stages.length - 1
                        const styles = getStatusStyles(stage.status)

                        return (
                            <div key={stage.id} className="relative flex flex-col items-center flex-1">
                                {/* Línea conectora horizontal */}
                                {!isLast && (
                                    <div
                                        className={`absolute top-6 sm:top-7 left-1/2 w-full h-0.5 sm:h-1 ${styles.line} -z-0`}
                                    />
                                )}

                                {/* Icono */}
                                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 ${styles.container} ${styles.icon} flex items-center justify-center shadow-md z-10`}>
                                    {stage.icon}
                                </div>

                                {/* Nombre de la etapa */}
                                <div className="mt-2 sm:mt-3 text-center w-full px-1">
                                    <h3 className={`text-[10px] sm:text-xs font-bold ${styles.text} leading-tight mb-1`}>
                                        {stage.name}
                                    </h3>
                                    {stage.status === 'in-progress' && (
                                        <div className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#ff6b35] text-[#ff6b35] font-semibold text-[9px] sm:text-xs">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-pulse"></div>
                                            Actual
                                        </div>
                                    )}
                                    {stage.status === 'completed' && (
                                        <div className="flex items-center justify-center text-green-600 text-[9px] sm:text-xs">
                                            <FaCheck className="text-[8px] sm:text-[10px]" />
                                        </div>
                                    )}
                                    <p className="text-[9px] text-gray-400 mt-1 hidden sm:block">{stage.timestamp}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
