import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { isLoggedIn, authLoading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <img src="/FC-LOGO.png" alt="FC Tracker" className="w-24 mb-6" />
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">FC Tracker</h1>
      <p className="text-gray-600 text-center max-w-sm mb-8">
        Plan events, proposals, rundowns, budgets, and guest lists.
      </p>
      {!authLoading && (
        <div className="flex gap-4">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-amber-500 text-gray-900 font-medium rounded-lg hover:bg-amber-600"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-amber-500 text-gray-900 font-medium rounded-lg hover:bg-amber-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
      {authLoading && <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" aria-hidden />}
    </div>
  )
}
