// src/utils/chileanValidators.ts

/**
 * Valida y formatea un RUT chileno
 * @param rut - RUT sin puntos ni guión (ej: "123456789")
 * @returns Objeto con isValid, formatted (ej: "12345678-9") y clean (sin puntos ni guión)
 */
export function validateAndFormatRUT(rut: string): {
  isValid: boolean
  formatted: string
  clean: string
  error?: string
} {
  // Limpiar el RUT: quitar puntos, guiones y espacios
  const clean = rut.replace(/[.\-\s]/g, '').toUpperCase()

  // Validar que solo contenga números y K
  if (!/^[0-9]+[0-9Kk]$/.test(clean)) {
    return {
      isValid: false,
      formatted: clean,
      clean,
      error: 'El RUT debe contener solo números y terminar en un dígito o K'
    }
  }

  // Validar longitud mínima (7 dígitos + 1 dígito verificador)
  if (clean.length < 8 || clean.length > 9) {
    return {
      isValid: false,
      formatted: clean,
      clean,
      error: 'El RUT debe tener entre 7 y 8 dígitos más el dígito verificador'
    }
  }

  // Separar el cuerpo del dígito verificador
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1).toUpperCase()

  // Calcular el dígito verificador correcto
  let sum = 0
  let multiplier = 2

  // Recorrer el cuerpo del RUT de derecha a izquierda
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const calculatedDV = remainder < 2 ? remainder.toString() : (11 - remainder).toString()
  const finalDV = calculatedDV === '10' ? 'K' : calculatedDV

  // Validar que el dígito verificador sea correcto
  const isValid = finalDV === dv

  // Formatear: agregar guión antes del dígito verificador
  const formatted = isValid ? `${body}-${finalDV}` : `${body}-${dv}`

  return {
    isValid,
    formatted,
    clean: `${body}${finalDV}`,
    error: isValid ? undefined : 'El dígito verificador del RUT no es válido'
  }
}

/**
 * Formatea un número de teléfono chileno
 * @param phone - Número de teléfono (ej: "912345678" o "9123456789")
 * @returns Teléfono formateado con código de país (+569)
 */
export function formatChileanPhone(phone: string): {
  formatted: string
  clean: string
  isValid: boolean
  error?: string
} {
  // Limpiar el teléfono: quitar espacios, guiones, paréntesis y el prefijo +56 o 56
  let clean = phone.replace(/[\s\-\(\)]/g, '')
  
  // Remover prefijos comunes
  if (clean.startsWith('+569')) {
    clean = clean.substring(4)
  } else if (clean.startsWith('569')) {
    clean = clean.substring(3)
  } else if (clean.startsWith('9')) {
    clean = clean.substring(1)
  }

  // Validar que solo contenga números
  if (!/^[0-9]+$/.test(clean)) {
    return {
      formatted: phone,
      clean,
      isValid: false,
      error: 'El teléfono debe contener solo números'
    }
  }

  // Validar longitud (8 dígitos para celulares chilenos)
  if (clean.length !== 8) {
    return {
      formatted: phone,
      clean,
      isValid: false,
      error: 'El teléfono debe tener 8 dígitos (sin el 9 inicial)'
    }
  }

  // Formatear con código de país
  const formatted = `+569${clean}`

  return {
    formatted,
    clean,
    isValid: true
  }
}

/**
 * Limpia un RUT para guardarlo en la base de datos (sin puntos ni guión)
 */
export function cleanRUT(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase()
}








