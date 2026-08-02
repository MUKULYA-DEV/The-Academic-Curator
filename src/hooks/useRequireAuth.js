import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export function useRequireAuth() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * requireAuth(callback)
   * 
   * Wraps an action that requires the user to be logged in.
   * If logged in, calls the callback.
   * If not logged in, captures the current full URL and redirects to /login.
   */
  const requireAuth = (callback) => {
    if (session) {
      if (typeof callback === 'function') {
        callback()
      }
    } else {
      // Capture full current URL
      const currentUrl = location.pathname + location.search + location.hash
      // Redirect to login using both Router state and URL query parameter
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`, {
        state: { from: currentUrl },
        replace: false
      })
    }
  }

  return { requireAuth, session }
}
