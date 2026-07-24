import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdmin } from '../services/authService'

export default function ProtectedAdminRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null)

  useEffect(() => {
    let mounted = true
    const checkAdmin = async () => {
      const authorized = await isAdmin()
      if (mounted) {
        setIsAuthorized(authorized)
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
    return <Navigate to="/" replace />
  }

  return children
}
