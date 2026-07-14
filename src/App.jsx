import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ExploreTours from './pages/ExploreTours.jsx'
import About from './pages/About.jsx'
import Ambassadors from './pages/Ambassadors.jsx'
import College from './pages/College.jsx'
import BookTour from './pages/BookTour.jsx'
import BookingSuccess from './pages/BookingSuccess.jsx'
import Profile from './pages/Profile.jsx'
import ContactSupport from './pages/ContactSupport.jsx'
import AllBookings from './pages/AllBookings.jsx'

function ProtectedRoute({ children }) {
  const { session, authReady } = useAuth()

  if (!authReady) {
    return (
      <div className="font-body flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-secondary">Loading…</p>
      </div>
    )
  }
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/contact" element={<ContactSupport />} />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <ExploreTours />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore-tours"
        element={
          <ProtectedRoute>
            <ExploreTours />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ambassadors"
        element={
          <ProtectedRoute>
            <Ambassadors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/college"
        element={
          <ProtectedRoute>
            <College />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-tour"
        element={
          <ProtectedRoute>
            <BookTour />
          </ProtectedRoute>
        }
      />
      <Route
        path="/success"
        element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <AllBookings />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
