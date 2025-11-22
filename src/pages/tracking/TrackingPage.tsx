// src/pages/tracking/TrackingPage.tsx
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import TrackingHeader from './components/TrackingHeader'
import TrackingTimeline from './components/TrackingTimeline'
import TrackingOrderInfo from './components/TrackingOrderInfo'
import TrackingHistory from './components/TrackingHistory'

interface OrderData {
  comanda_id: string
  estadoActual: string
  historialEstados?: Array<{
    estado: string
    comentario: string
    fechaCambio: any
    operarioNombre?: string
  }>
  incidencias?: {
    numeroOrden?: string
  }
  clienteNombre?: string
  fechaCreacion?: any
  fechaIngreso?: any
  horaIngreso?: string
  servicioExpress?: boolean
}

export default function TrackingPage() {
  const { code } = useParams<{ code: string }>()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!code) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Buscar en la colección seguimiento_3 por numeroOrden en incidencias
        const seguimientoRef = collection(db, 'seguimiento_3')

        // Intentar buscar por incidencias.numeroOrden (si incidencias es un objeto)
        let q = query(seguimientoRef, where('incidencias.numeroOrden', '==', code.toUpperCase()))
        let querySnapshot = await getDocs(q)

        // Si no se encuentra, intentar buscar en todos los documentos (fallback)
        if (querySnapshot.empty) {
          const allDocs = await getDocs(seguimientoRef)
          const matchingDoc = allDocs.docs.find(doc => {
            const data = doc.data()
            // Verificar si numeroOrden está en incidencias (objeto o array)
            if (data.incidencias?.numeroOrden === code.toUpperCase()) {
              return true
            }
            // También verificar si hay un campo numeroOrden directo
            if (data.numeroOrden === code.toUpperCase()) {
              return true
            }
            return false
          })

          if (matchingDoc) {
            const seguimientoData = matchingDoc.data() as OrderData

            // Buscar información adicional en comandas_2 usando comanda_id
            if (seguimientoData.comanda_id) {
              try {
                const comandaDocRef = doc(db, 'comandas_2', seguimientoData.comanda_id)
                const comandaDoc = await getDoc(comandaDocRef)

                if (comandaDoc.exists()) {
                  const comandaData = comandaDoc.data()
                  // Combinar datos de seguimiento con datos de comanda
                  seguimientoData.clienteNombre = comandaData.nombreCliente
                  seguimientoData.fechaIngreso = comandaData.fechaIngreso
                  seguimientoData.horaIngreso = comandaData.horaIngreso
                  seguimientoData.servicioExpress = comandaData.servicioExpress
                }
              } catch (err) {
                console.error('Error al obtener datos de comanda:', err)
              }
            }

            setOrderData(seguimientoData)
          } else {
            setError('No se encontró ningún pedido con ese número de orden.')
            setOrderData(null)
          }
        } else {
          // Tomar el primer documento encontrado
          const seguimientoDoc = querySnapshot.docs[0]
          const seguimientoData = seguimientoDoc.data() as OrderData

          // Buscar información adicional en comandas_2 usando comanda_id
          if (seguimientoData.comanda_id) {
            try {
              const comandaDocRef = doc(db, 'comandas_2', seguimientoData.comanda_id)
              const comandaDoc = await getDoc(comandaDocRef)

              if (comandaDoc.exists()) {
                const comandaData = comandaDoc.data()
                // Combinar datos de seguimiento con datos de comanda
                seguimientoData.clienteNombre = comandaData.nombreCliente
                seguimientoData.fechaIngreso = comandaData.fechaIngreso
                seguimientoData.horaIngreso = comandaData.horaIngreso
                seguimientoData.servicioExpress = comandaData.servicioExpress
              }
            } catch (err) {
              console.error('Error al obtener datos de comanda:', err)
            }
          }

          setOrderData(seguimientoData)
        }
      } catch (err) {
        console.error('Error al buscar el pedido:', err)
        setError('Error al buscar el pedido. Por favor, intenta nuevamente.')
        setOrderData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [code])

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return ''

    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate()
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
      }
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
      }
      return ''
    } catch (error) {
      return ''
    }
  }

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return ''

    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate()
        const hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.'
        const displayHours = hours % 12 || 12
        return `${displayHours}:${minutes} ${ampm}`
      }
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        const hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const ampm = hours >= 12 ? 'p. m.' : 'a. m.'
        const displayHours = hours % 12 || 12
        return `${displayHours}:${minutes} ${ampm}`
      }
      return ''
    } catch (error) {
      return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-white">
      <TrackingHeader trackingCode={code || 'N/A'} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">

        {loading && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-8 border-2 border-[#f0f0f5] text-center">
            <p className="text-[#6b6b7e]">Buscando pedido...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-6 sm:p-8 border-2 border-red-200">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {!loading && !error && orderData && (
          <>
            <TrackingOrderInfo
              orderNumber={code || 'N/A'}
              clientName={orderData.clienteNombre}
              entryDate={orderData.fechaIngreso ? formatDate(orderData.fechaIngreso) : (orderData.fechaCreacion ? formatDate(orderData.fechaCreacion) : undefined)}
              entryTime={orderData.horaIngreso || (orderData.fechaCreacion ? formatTime(orderData.fechaCreacion) : undefined)}
              isExpress={orderData.servicioExpress}
            />

            <div className="mb-6 sm:mb-8">
              <TrackingTimeline
                currentEstado={orderData.estadoActual}
                history={orderData.historialEstados?.map(h => ({
                  estado: h.estado,
                  fechaCambio: h.fechaCambio
                })) || []}
              />
            </div>

            <TrackingHistory
              history={orderData.historialEstados || []}
            />

            <div className="mt-6 sm:mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <p className="text-xs sm:text-sm md:text-base text-[#6b6b7e] text-center sm:text-right">
                  ¿Tienes alguna pregunta sobre tu pedido?
                </p>
                <button
                  onClick={() => window.location.href = '/#contacto'}
                  className="inline-block bg-gradient-to-r from-[#ff6b35] to-[#e85d2e] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg font-semibold text-sm sm:text-base whitespace-nowrap"
                >
                  Contáctanos
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
