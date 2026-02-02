import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import EventPage from './pages/event/EventPage'
import UploadParticipantPage from './pages/event/UploadParticipantPage'
import PrecentParticipantPage from './pages/event/PrecentParticipantPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/event/:id' element={<EventPage />} />
          <Route path='/event/guest-list/:id' element={<UploadParticipantPage />} />
          <Route path='/event/guest-precent/:id' element={<PrecentParticipantPage />} />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App
