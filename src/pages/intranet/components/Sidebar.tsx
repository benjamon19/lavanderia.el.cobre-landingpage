// src/pages/intranet/components/Sidebar.tsx
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  FaClipboardList,
  FaFileInvoice,
  FaBox,
  FaShoppingBag,
  FaTimes,
  FaUsers,
  FaChevronDown,
  FaChevronRight,
  FaExternalLinkAlt
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

interface SidebarProps {
  activeModule: string
  isOpen: boolean
  onClose: () => void
}

interface SubMenuItem {
  label: string
  url: string
}

interface MenuItem {
  id: string
  label: string
  icon: ReactNode
  roles: Array<'Administrador' | 'Trabajador' | 'Cliente' | 'Recepcionista'>
  subItems?: SubMenuItem[]
}

export default function Sidebar({ activeModule, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  // Esta función inyecta el ?auth_token=UID automáticamente
  const getSecureUrl = (baseUrl: string) => {
    if (!user?.uid) return baseUrl
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}auth_token=${user.uid}`
  }

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaClipboardList />,
      roles: ['Administrador', 'Trabajador', 'Recepcionista']
    },
    {
      id: 'seguimiento',
      label: 'Seguimiento',
      icon: <FaClipboardList />,
      roles: ['Administrador', 'Trabajador', 'Recepcionista'],
      subItems: [
        { label: 'Equipo 1', url: 'https://deploy-equipo-1.vercel.app' },
        { label: 'Equipo 3', url: 'https://lavanderia-el-cobre-spa.vercel.app/' }
      ]
    },
    {
      id: 'orders',
      label: 'Comandas', // <--- AQUÍ ESTÁ EL EQUIPO 2
      icon: <FaFileInvoice />,
      roles: ['Administrador', 'Trabajador', 'Recepcionista'],
      subItems: [
        { label: 'Equipo 2', url: 'https://lavanderia-el-cobre-sigma.vercel.app' },
        { label: 'Equipo 5', url: 'https://deploy-equipo-5.vercel.app' }
      ]
    },
    {
      id: 'management',
      label: 'Gestión Interna',
      icon: <FaBox />,
      roles: ['Administrador', 'Trabajador'],
      subItems: [
        { label: 'Equipo 4', url: 'https://lavanderia-cobre-spa.vercel.app' }, 
        { label: 'Equipo 7', url: 'https://lavanderia-el-cobre-iota.vercel.app/' }
      ]
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: <FaUsers />,
      roles: ['Administrador']
    },
    {
      id: 'my-orders',
      label: 'Mis Pedidos',
      icon: <FaShoppingBag />,
      roles: ['Cliente']
    }
  ]

  const filteredItems = menuItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  )

  return (
    <>
      {/* Overlay para móvil */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      <aside className={`
        fixed left-0 w-64 sm:w-72 bg-white border-r-2 border-[#f0f0f5]
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        top-0 h-full z-50 shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30 lg:shadow-none
      `}>

        {/* Header del sidebar (Solo móvil) */}
        <div className="h-16 bg-white border-b-2 border-[#f0f0f5] flex items-center justify-between px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain sm:hidden" />
            <p className="text-xs text-[#6b6b7e]">Sistema Intranet</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#fff4f0] text-[#6b6b7e]">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4">
          <p className="text-xs font-semibold text-[#6b6b7e] uppercase mb-4 px-4 tracking-wide">Menú Principal</p>
          <ul className="space-y-2">
            {filteredItems.map(item => {
              const isExpanded = expandedMenus.includes(item.id)
              const isActive = activeModule === item.id

              return (
                <li key={item.id}>
                  <button
                    onClick={() => item.subItems ? toggleMenu(item.id) : (navigate(`/intranet/${item.id}`), onClose())}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all
                      ${isActive && !item.subItems ? 'bg-gradient-to-r from-[#ff6b35] to-[#e85d2e] text-white shadow-lg' : 'text-[#2c2c3e] hover:bg-[#fff4f0] hover:text-[#ff6b35]'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.subItems && (
                      <span className="text-xs opacity-60">{isExpanded ? <FaChevronDown /> : <FaChevronRight />}</span>
                    )}
                  </button>

                  {item.subItems && isExpanded && (
                    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-[#f0f0f5] pl-2 animate-fadeIn">
                      {item.subItems.map((sub, idx) => (
                        <li key={idx}>
                          <a
                            // GRACIAS A ESTA LÍNEA, EL EQUIPO 2 RECIBIRÁ EL TOKEN AUTOMÁTICAMENTE
                            href={getSecureUrl(sub.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#6b6b7e] hover:text-[#ff6b35] hover:bg-[#fff4f0] rounded-lg transition-colors"
                          >
                            <span>{sub.label}</span>
                            <FaExternalLinkAlt className="text-[10px]" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
