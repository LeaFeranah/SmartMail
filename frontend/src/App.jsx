// import { useEffect } from 'react'
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import useAuthStore from './store/authStore'
// import LoginPage from './pages/LoginPage'
// import DashboardPage from './pages/DashboardPage'
// import EmailsPage from './pages/EmailsPage'
// import TasksPage from './pages/TasksPage'
// import Layout from './components/Layout'

// function PrivateRoute({ children }) {
//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
//   return isAuthenticated ? children : <Navigate to="/login" />
// }

// export default function App() {
//   const fetchProfile = useAuthStore((s) => s.fetchProfile)

//   useEffect(() => {
//     fetchProfile()
//   }, [])

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/" element={
//           <PrivateRoute>
//             <Layout />
//           </PrivateRoute>
//         }>
//           <Route index element={<DashboardPage />} />
//           <Route path="emails" element={<EmailsPage />} />
//           <Route path="tasks" element={<TasksPage />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   )
// }



import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmailsPage from './pages/EmailsPage'
import TasksPage from './pages/TasksPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import RegisterPage from './pages/RegisterPage'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="emails" element={<EmailsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}