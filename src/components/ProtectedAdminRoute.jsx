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
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">gpp_bad</span>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">You do not have permission to view this page.</p>
          <div className="bg-slate-50 p-4 rounded-lg text-left overflow-auto border border-slate-200">
            <p className="text-xs font-mono text-slate-500 mb-1">Debug Reason:</p>
            <p className="text-sm font-mono text-red-600 font-bold">{debugInfo}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return children
}
