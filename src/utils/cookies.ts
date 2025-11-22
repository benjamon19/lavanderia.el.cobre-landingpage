// src/utils/cookies.ts
/**
 * Utilidades para manejar cookies de forma segura
 */

/**
 * Establece una cookie con el nombre, valor y opciones especificadas
 * @param name Nombre de la cookie
 * @param value Valor de la cookie
 * @param days Días de expiración (por defecto 30 días)
 */
export function setCookie(name: string, value: string, days: number = 30): void {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  
  // Configurar cookie con SameSite=Strict para seguridad
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`
}

/**
 * Obtiene el valor de una cookie por su nombre
 * @param name Nombre de la cookie
 * @returns Valor de la cookie o null si no existe
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length)
    }
  }
  return null
}

/**
 * Elimina una cookie estableciendo su fecha de expiración en el pasado
 * @param name Nombre de la cookie a eliminar
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`
}

/**
 * Verifica si existe una cookie
 * @param name Nombre de la cookie
 * @returns true si la cookie existe, false en caso contrario
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null
}









