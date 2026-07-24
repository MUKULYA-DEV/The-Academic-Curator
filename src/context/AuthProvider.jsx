import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setAuthReady(true)
      
      // Clean up URL if it contains sensitive Supabase auth fragments
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      
      if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      
      if (event === 'SIGNED_OUT') {
        // Clear any residual URL hash and force redirect to home to completely reset app state
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        window.location.href = '/'
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({ session, authReady, signOut }),
    [session, authReady, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
