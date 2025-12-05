// src/pages/intranet/modules/UsersModule.tsx
import { useState, useEffect } from 'react'
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, updateDoc } from 'firebase/firestore'
import { db, firebaseConfig } from '../../../config/firebase'
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaPhone, FaIdCard, FaEdit, FaTrash, FaEye, FaSearch, FaUserPlus, FaUsersCog, FaTimes, FaBan, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { validateAndFormatRUT, formatChileanPhone, formatRut } from '../../../utils/chileanValidators'
import NotificationModal from '../../../components/NotificationModal'

interface UserFormData {
  correo: string
  contraseña: string
  confirmarContraseña: string
  nombre: string
  rut: string
  telefono: string
  rol: 'administrador' | 'cliente' | 'operario' | 'recepcionista' | 'repartidor'
  activo: boolean
}

interface UserData extends UserFormData {
  uid: string
  fecha_creacion: any
  ultimo_acceso: any
}

const ITEMS_PER_PAGE = 10

export default function UsersModule() {
  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')

  // Estado para el formulario de creación
  const [formData, setFormData] = useState<UserFormData>({
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    nombre: '',
    rut: '',
    telefono: '',
    rol: 'cliente',
    activo: true
  })

  // Estados para gestión de usuarios
  const [users, setUsers] = useState<UserData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Estados de Modales
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Estado para edición
  const [editFormData, setEditFormData] = useState<Partial<UserFormData>>({})

  const [loading, setLoading] = useState(false)
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  })

  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [rutError, setRutError] = useState<string>('')
  const [telefonoError, setTelefonoError] = useState<string>('')
  const [rutFormatted, setRutFormatted] = useState<string>('')
  const [telefonoFormatted, setTelefonoFormatted] = useState<string>('')

  // Cargar usuarios cuando se cambia a la pestaña de gestión
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchUsers()
    }
  }, [activeTab])

  // Resetear página cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const q = query(collection(db, 'usuarios'), orderBy('fecha_creacion', 'desc'))
      const querySnapshot = await getDocs(q)
      const usersList: UserData[] = []
      querySnapshot.forEach((doc) => {
        usersList.push(doc.data() as UserData)
      })
      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los usuarios'
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  // Validar requisitos de contraseña
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Al menos un número')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Al menos un signo especial')
    }

    return errors
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormData({ ...formData, contraseña: newPassword })
    setPasswordErrors(validatePassword(newPassword))
  }

  const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const rutValue = e.target.value
    const formatted = formatRut(rutValue)
    const cleanValue = formatted.replace(/[.\-\s]/g, '').toUpperCase()

    if (isEdit) {
      setEditFormData({ ...editFormData, rut: formatted })
    } else {
      setFormData({ ...formData, rut: formatted })
    }

    if (cleanValue.length >= 8) {
      const validation = validateAndFormatRUT(cleanValue)
      if (validation.isValid) {
        setRutFormatted(validation.formatted)
        setRutError('')
      } else {
        setRutFormatted(validation.formatted)
        setRutError(validation.error || 'RUT inválido')
      }
    } else {
      setRutFormatted('')
      setRutError('')
    }
  }

  const handleTelefonoFocus = (isEdit = false) => {
    if (isEdit) {
      if (!editFormData.telefono) setEditFormData({ ...editFormData, telefono: '+569' })
    } else {
      if (!formData.telefono) setFormData({ ...formData, telefono: '+569' })
    }
  }

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const phoneValue = e.target.value

    if (phoneValue === '') {
      if (isEdit) {
        setEditFormData({ ...editFormData, telefono: '' })
      } else {
        setFormData({ ...formData, telefono: '' })
      }
      setTelefonoFormatted('')
      setTelefonoError('')
      return
    }

    let newValue = phoneValue
    if (!newValue.startsWith('+569')) {
      const numbers = newValue.replace(/[^0-9]/g, '')
      if (numbers.length > 0) {
        newValue = '+569' + numbers.replace(/^569/, '')
      }
    }

    if (!/^\+?[0-9]*$/.test(newValue)) return

    if (isEdit) {
      setEditFormData({ ...editFormData, telefono: newValue })
    } else {
      setFormData({ ...formData, telefono: newValue })
    }

    const cleanValue = newValue.replace(/\D/g, '')
    if (cleanValue.length === 11) {
      const validation = formatChileanPhone(cleanValue)
      if (validation.isValid) {
        setTelefonoFormatted(validation.formatted)
        setTelefonoError('')
      } else {
        setTelefonoFormatted(validation.formatted)
        setTelefonoError(validation.error || 'Teléfono inválido')
      }
    } else {
      setTelefonoFormatted('')
      setTelefonoError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.contraseña !== formData.confirmarContraseña) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Error de validación',
        message: 'Las contraseñas no coinciden'
      })
      return
    }

    const passwordValidation = validatePassword(formData.contraseña)
    if (passwordValidation.length > 0) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Contraseña débil',
        message: 'La contraseña no cumple con los requisitos mínimos'
      })
      return
    }

    if (!formData.rut || formData.rut.length < 8) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'RUT inválido',
        message: 'Por favor ingresa un RUT válido'
      })
      return
    }
    const rutValidation = validateAndFormatRUT(formData.rut.replace(/[.\-\s]/g, ''))
    if (!rutValidation.isValid) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'RUT inválido',
        message: rutValidation.error || 'El RUT ingresado no es válido'
      })
      return
    }

    if (!formData.telefono || formData.telefono.length < 8) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Teléfono inválido',
        message: 'Por favor ingresa un teléfono válido (8 dígitos)'
      })
      return
    }
    const telefonoValidation = formatChileanPhone(formData.telefono)
    if (!telefonoValidation.isValid) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Teléfono inválido',
        message: telefonoValidation.error || 'El teléfono ingresado no es válido'
      })
      return
    }

    setLoading(true)

    let secondaryApp: FirebaseApp | null = null;

    try {
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.correo,
        formData.contraseña
      )

      const uid = userCredential.user.uid

      await sendEmailVerification(userCredential.user)

      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        correo: formData.correo,
        nombre: formData.nombre,
        rut: rutValidation.clean,
        telefono: telefonoValidation.formatted,
        rol: formData.rol,
        activo: true,
        fecha_creacion: serverTimestamp(),
        ultimo_acceso: serverTimestamp()
      })

      await signOut(secondaryAuth);

      setNotificationModal({
        isOpen: true,
        type: 'success',
        title: 'Usuario Creado',
        message: `Usuario ${formData.nombre} creado exitosamente. Ya puede iniciar sesión con su correo y contraseña`
      })

      setFormData({
        correo: '',
        contraseña: '',
        confirmarContraseña: '',
        nombre: '',
        rut: '',
        telefono: '',
        rol: 'cliente',
        activo: true
      })
      setPasswordErrors([])
      setRutError('')
      setTelefonoError('')
      setRutFormatted('')
      setTelefonoFormatted('')

    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      let errorMessage = 'Error al crear usuario'
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este correo ya está registrado'
      else if (error.code === 'auth/invalid-email') errorMessage = 'Correo electrónico inválido'
      else if (error.code === 'auth/weak-password') errorMessage = 'La contraseña es demasiado débil'
      else if (error.code === 'auth/network-request-failed') errorMessage = 'Error de conexión. Verifica tu internet.'

      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp).catch(console.error);
      }
      setLoading(false)
    }
  }

  // Funciones de Gestión
  const handleViewUser = (user: UserData) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user)
    setEditFormData({
      nombre: user.nombre,
      correo: user.correo,
      rut: formatRut(user.rut),
      telefono: user.telefono,
      rol: user.rol,
      activo: user.activo
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteUserClick = (user: UserData) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setLoading(true)
    try {
      // Validar RUT y Teléfono si se cambiaron
      let rutToSave = selectedUser.rut
      if (editFormData.rut) {
        const rutValidation = validateAndFormatRUT(editFormData.rut.replace(/[.\-\s]/g, ''))
        if (!rutValidation.isValid) throw new Error('RUT inválido')
        rutToSave = rutValidation.clean
      }

      let phoneToSave = selectedUser.telefono
      if (editFormData.telefono) {
        const phoneValidation = formatChileanPhone(editFormData.telefono)
        if (!phoneValidation.isValid) throw new Error('Teléfono inválido')
        phoneToSave = phoneValidation.formatted
      }

      // Update Email if changed (using Cloud Function)
      if (editFormData.correo && editFormData.correo !== selectedUser.correo) {
        const functions = getFunctions()
        const updateUserEmail = httpsCallable(functions, 'updateUserEmail')
        await updateUserEmail({
          uid: selectedUser.uid,
          newEmail: editFormData.correo
        })
      }

      await updateDoc(doc(db, 'usuarios', selectedUser.uid), {
        ...editFormData,
        rut: rutToSave,
        telefono: phoneToSave
      })

      setNotificationModal({
        isOpen: true,
        type: 'success',
        title: 'Usuario Actualizado',
        message: 'Los datos del usuario han sido actualizados correctamente'
      })
      setIsEditModalOpen(false)
      fetchUsers() // Recargar lista
    } catch (error: any) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Error al actualizar usuario'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSoftDelete = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      await updateDoc(doc(db, 'usuarios', selectedUser.uid), {
        activo: false
      })
      setNotificationModal({
        isOpen: true,
        type: 'success',
        title: 'Usuario Desactivado',
        message: 'El usuario ha sido desactivado y no podrá iniciar sesión.'
      })
      setIsDeleteModalOpen(false)
      fetchUsers()
    } catch (error) {
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo desactivar el usuario'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrado y Paginación
  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div>
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal({ ...notificationModal, isOpen: false })}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">Gestión de Usuarios</h1>
        <p className="text-[#6b6b7e]">Crear y administrar usuarios del sistema</p>
      </div>

      {/* Pestañas */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'create'
            ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]'
            : 'text-gray-500 hover:text-[#ff6b35]'
            }`}
        >
          <FaUserPlus /> Crear Usuario
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'manage'
            ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]'
            : 'text-gray-500 hover:text-[#ff6b35]'
            }`}
        >
          <FaUsersCog /> Gestionar Usuarios
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#ff6b35] to-[#e85d2e] rounded-xl">
                <FaUser className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a2e]">Crear Nuevo Usuario</h2>
                <p className="text-sm text-[#6b6b7e]">Completa todos los campos del formulario</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Formulario de Creación */}
              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-2">Nombre Completo</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7e]" />
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none transition-colors"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-2">Correo Electrónico</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7e]" />
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none transition-colors"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-2">RUT</label>
                <div className="relative">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7e]" />
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={handleRUTChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition-all ${rutError ? 'border-red-300' : rutFormatted && !rutError ? 'border-green-300' : 'border-gray-200'}`}
                    placeholder="12.345.678-9"
                    required
                    maxLength={12}
                  />
                </div>
                {rutFormatted && !rutError && <p className="mt-1 text-xs text-green-600">RUT válido: {rutFormatted}</p>}
                {rutError && <p className="mt-1 text-xs text-red-600">{rutError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-2">Teléfono</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7e]" />
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={handleTelefonoChange}
                    onFocus={() => handleTelefonoFocus(false)}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition-all ${telefonoError ? 'border-red-300' : telefonoFormatted && !telefonoError ? 'border-green-300' : 'border-gray-200'}`}
                    placeholder="+569 12345678"
                    required
                    maxLength={12}
                  />
                </div>
                {telefonoFormatted && !telefonoError && <p className="mt-1 text-xs text-green-600">Teléfono válido: {telefonoFormatted}</p>}
                {telefonoError && <p className="mt-1 text-xs text-red-600">{telefonoError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-2">Contraseña</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7e]" />
                  <input
                    type="password"
                    value={formData.contraseña}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {passwordErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordErrors.map((error, index) => (
                      <p key={index} className="text-xs text-red-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-2">Confirmar Contraseña</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7e]" />
                  <input
                    type="password"
                    value={formData.confirmarContraseña}
                    onChange={(e) => setFormData({ ...formData, confirmarContraseña: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-2">Rol del Usuario</label>
                <div className="relative">
                  <FaUserTag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7e]" />
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none transition-colors appearance-none bg-white"
                    required
                  >
                    <option value="cliente">Cliente</option>
                    <option value="operario">Operario</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="administrador">Administrador</option>
                    {/* CAMBIO: Opción de Repartidor agregada */}
                    <option value="repartidor">Repartidor (uso exclusivo equipo 3)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || passwordErrors.length > 0 || !!rutError || !!telefonoError || !rutFormatted || !telefonoFormatted}
                className="w-full py-4 bg-gradient-to-r from-[#ff6b35] to-[#e85d2e] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando usuario...' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
          {/* Barra de búsqueda */}
          <div className="mb-6 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none transition-colors"
            />
          </div>

          {/* CAMBIO: Tabla Responsive */}

          {/* Vista Desktop (Tabla Tradicional) - Oculta en pantallas pequeñas */}
          <div className="hidden md:block overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-[#2c2c3e]">Nombre</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#2c2c3e]">Correo</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#2c2c3e]">Rol</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#2c2c3e]">Estado</th>
                  <th className="text-right py-4 px-4 font-semibold text-[#2c2c3e]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Cargando usuarios...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No se encontraron usuarios</td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-[#2c2c3e]">{user.nombre}</td>
                      <td className="py-4 px-4 text-gray-600">{user.correo}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-orange-100 text-[#ff6b35] rounded-full text-sm font-medium capitalize">
                          {user.rol}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          {user.activo && (
                            <button
                              onClick={() => handleDeleteUserClick(user)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desactivar"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Vista Mobile (Tarjetas) - Visible solo en pantallas pequeñas */}
          <div className="md:hidden space-y-4 mb-4">
            {loadingUsers ? (
              <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No se encontraron usuarios</div>
            ) : (
              currentUsers.map((user) => (
                <div key={user.uid} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-[#2c2c3e]">{user.nombre}</h3>
                      <p className="text-sm text-gray-500 break-all">{user.correo}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-[#ff6b35] rounded-full text-xs font-medium capitalize">
                      {user.rol}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 border-t pt-3 border-gray-100">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    {user.activo && (
                      <button
                        onClick={() => handleDeleteUserClick(user)}
                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="Desactivar"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paginación (Compartida para ambas vistas) */}
          {!loadingUsers && filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-4 gap-4">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuarios
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>

                {/* En mobile mostramos menos números de página para no romper el layout */}
                <div className="hidden sm:flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg font-medium transition-colors ${currentPage === page
                        ? 'bg-[#ff6b35] text-white'
                        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                {/* Indicador de página simple para mobile */}
                <div className="sm:hidden flex items-center px-2 text-sm font-medium text-gray-600">
                  Pág {currentPage} de {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Ver Usuario */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
              <FaUser className="text-[#ff6b35]" /> Detalles del Usuario
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Nombre</label>
                  <p className="font-medium text-[#2c2c3e]">{selectedUser.nombre}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">RUT</label>
                  <p className="font-medium text-[#2c2c3e]">{formatRut(selectedUser.rut)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Correo</label>
                  <p className="font-medium text-[#2c2c3e] break-all">{selectedUser.correo}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Teléfono</label>
                  <p className="font-medium text-[#2c2c3e]">{selectedUser.telefono}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Rol</label>
                  <p className="font-medium text-[#2c2c3e] capitalize">{selectedUser.rol}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Estado</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedUser.activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {selectedUser.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
              <FaEdit className="text-[#ff6b35]" /> Editar Usuario
            </h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-1">Nombre</label>
                <input
                  type="text"
                  value={editFormData.nombre || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-1">Correo</label>
                <input
                  type="email"
                  value={editFormData.correo || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, correo: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-1">RUT</label>
                <input
                  type="text"
                  value={editFormData.rut || ''}
                  onChange={(e) => handleRUTChange(e, true)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editFormData.telefono || ''}
                  onChange={(e) => handleTelefonoChange(e, true)}
                  onFocus={() => handleTelefonoFocus(true)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-1">Rol</label>
                <select
                  value={editFormData.rol}
                  onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value as any })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none bg-white"
                >
                  <option value="administrador">Administrador</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="operario">Operario</option>
                  <option value="cliente">Cliente</option>
                  {/* CAMBIO: También se añade aquí para poder editar si el usuario es repartidor */}
                  <option value="repartidor">Repartidor (uso exclusivo equipo 3)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2c2c3e] mb-1">Estado</label>
                <select
                  value={editFormData.activo ? 'true' : 'false'}
                  onChange={(e) => setEditFormData({ ...editFormData, activo: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#ff6b35] focus:outline-none bg-white"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ff6b35] text-white font-bold rounded-xl hover:bg-[#e85d2e] transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar (Desactivar) Usuario */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBan className="text-3xl text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">¿Desactivar Usuario?</h2>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que deseas desactivar a <strong>{selectedUser.nombre}</strong>?
                El usuario no podrá iniciar sesión, pero sus datos se mantendrán en el sistema.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSoftDelete}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                >
                  {loading ? 'Desactivando...' : 'Sí, Desactivar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}