import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import React, { useEffect, Suspense } from 'react'
import { useAuth } from './hooks/useAuth.js'

import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx'

// Lazy-loaded components for better performance
const ExploreTours = React.lazy(() => import('./pages/ExploreTours.jsx'))
const About = React.lazy(() => import('./pages/About.jsx'))
const Ambassadors = React.lazy(() => import('./pages/Ambassadors.jsx'))
const College = React.lazy(() => import('./pages/College.jsx'))
const BookTour = React.lazy(() => import('./pages/BookTour.jsx'))
const BookingSuccess = React.lazy(() => import('./pages/BookingSuccess.jsx'))
const Profile = React.lazy(() => import('./pages/Profile.jsx'))
const ContactSupport = React.lazy(() => import('./pages/ContactSupport.jsx'))
const AllBookings = React.lazy(() => import('./pages/AllBookings.jsx'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard.jsx'))

const Scorecard = React.lazy(() => import('./pages/Scorecard.jsx'))
const FindCollege = React.lazy(() => import('./pages/FindCollege.jsx'))

const NotFound = React.lazy(() => import('./pages/NotFound.jsx'))
const ComingSoon = React.lazy(() => import('./pages/ComingSoon.jsx'))
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy.jsx'))
const TermsOfService = React.lazy(() => import('./pages/TermsOfService.jsx'))
const Accessibility = React.lazy(() => import('./pages/Accessibility.jsx'))

function ProtectedRoute({ children }) {
  const { session, authReady } = useAuth()
  const location = useLocation()

  if (!authReady) {
    return (
      <div className="font-body flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-secondary">Loading…</p>
      </div>
    )
  }
  if (!session) {
    const returnUrl = location.pathname + location.search + location.hash
    return <Navigate to={`/login?redirect=${encodeURIComponent(returnUrl)}`} state={{ from: returnUrl }} replace />
  }
  return children
}

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

export default function App() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])

  return (
    <Routes>
      {/* Routes WITHOUT Global Layout */}
      <Route path="/login" element={<Login />} />
      <Route
        path="/book-tour"
        element={
          <ProtectedRoute>
            <SuspenseWrapper><BookTour /></SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>
          </ProtectedAdminRoute>
        }
      />

      {/* Routes WITH Global Layout */}
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<SuspenseWrapper><ContactSupport /></SuspenseWrapper>} />
        <Route path="/coming-soon" element={<SuspenseWrapper><ComingSoon /></SuspenseWrapper>} />
        <Route path="/privacy" element={<SuspenseWrapper><PrivacyPolicy /></SuspenseWrapper>} />
        <Route path="/terms" element={<SuspenseWrapper><TermsOfService /></SuspenseWrapper>} />
        <Route path="/accessibility" element={<SuspenseWrapper><Accessibility /></SuspenseWrapper>} />
        
        <Route
          path="/scorecard"
          element={<SuspenseWrapper><Scorecard /></SuspenseWrapper>}
        />
        <Route
          path="/find"
          element={<SuspenseWrapper><FindCollege /></SuspenseWrapper>}
        />
        <Route
          path="/explore"
          element={<SuspenseWrapper><ExploreTours /></SuspenseWrapper>}
        />
        <Route
          path="/explore-tours"
          element={<SuspenseWrapper><ExploreTours /></SuspenseWrapper>}
        />
        <Route
          path="/college"
          element={<SuspenseWrapper><College /></SuspenseWrapper>}
        />
        <Route
          path="/college/:slug"
          element={<SuspenseWrapper><College /></SuspenseWrapper>}
        />
        <Route
          path="/about"
          element={<SuspenseWrapper><About /></SuspenseWrapper>}
        />
        
        {/* Protected Routes */}

        <Route
          path="/ambassadors"
          element={<ProtectedRoute><SuspenseWrapper><Ambassadors /></SuspenseWrapper></ProtectedRoute>}
        />
        <Route
          path="/success"
          element={<ProtectedRoute><SuspenseWrapper><BookingSuccess /></SuspenseWrapper></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><SuspenseWrapper><Profile /></SuspenseWrapper></ProtectedRoute>}
        />
        <Route
          path="/bookings"
          element={<ProtectedRoute><SuspenseWrapper><AllBookings /></SuspenseWrapper></ProtectedRoute>}
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
      </Route>
    </Routes>
  )
}
