import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { isLoggedIn, email, authLoading } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem('fc-token')
    window.location.reload()
  }

  if (authLoading) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-800">
          <img src="/FC-LOGO.png" alt="FC Logo" className="w-20" />
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-gray-700 text-sm">Welcome, {email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-amber-600 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-600 hover:text-amber-600 text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
