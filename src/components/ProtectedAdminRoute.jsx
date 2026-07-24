import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdmin } from '../services/authService'

export default function ProtectedAdminRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    let mounted = true
    const checkAdmin = async () => {
      const result = await isAdmin()
      if (mounted) {
        setIsAuthorized(result.isAuthorized)
        setDebugInfo(result.reason)
      }
    }
    checkAdmin()
    return () => {
      mounted = false
    }
  }, [])

  if (isAuthorized === null) {
    return (
      <div className="font-body flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-secondary">Verifying admin access…</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="font-body flex min-h-screen flex-col items-center justify-center bg-surface text-on-surface p-8">
        <div className="max-w-md text-center">
          <h1 className="text-9xl font-black text-outline-variant/20 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-primary mb-2">Page Not Found</h2>
          <p className="text-secondary mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 transition-opacity"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return children
}
