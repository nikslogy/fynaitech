import Cookies from 'js-cookie'

const AUTH_COOKIE_KEY = 'fynai_auth'
const AUTH_VALUE = 'authenticated'

// Valid access codes (stored in lowercase for case-insensitive comparison)
const VALID_ACCESS_CODES = [
  'nikit@13*#',
  'om@13*',
  'drdinesh9',
  'fynaitech3'
]

export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const authCookie = Cookies.get(AUTH_COOKIE_KEY)
    return authCookie === AUTH_VALUE
  },

  // Validate access code
  validateAccessCode: (code: string): boolean => {
    const trimmedCode = code.trim().toLowerCase()
    const isValid = VALID_ACCESS_CODES.includes(trimmedCode)

    // Debug logging (remove in production)
    console.log('Validating code:', {
      original: code,
      trimmed: trimmedCode,
      validCodes: VALID_ACCESS_CODES,
      isValid: isValid
    })

    return isValid
  },

  // Set authentication cookie (2 hours expiry)
  setAuthenticated: (): void => {
    Cookies.set(AUTH_COOKIE_KEY, AUTH_VALUE, {
      expires: 2 / 24, // 2 hours in days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  },

  // Remove authentication cookie
  logout: (): void => {
    Cookies.remove(AUTH_COOKIE_KEY)
  },

  // Get remaining time in minutes until session expires
  getSessionTimeRemaining: (): number => {
    const cookie = Cookies.get(AUTH_COOKIE_KEY)
    if (!cookie) return 0

    // Since we can't get the exact expiry time from js-cookie,
    // we'll return a default value or check if cookie exists
    return cookie ? 120 : 0 // 120 minutes = 2 hours
  },

  // Get list of valid codes (for debugging/admin purposes)
  getValidCodes: (): string[] => {
    return VALID_ACCESS_CODES
  }
}
