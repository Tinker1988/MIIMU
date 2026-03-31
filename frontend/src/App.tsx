import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLogin from './pages/admin-login'
import Signup from './pages/Signup'
import CreateRecipe from './pages/create-recipe'
import RecipePage from './pages/recipe-page'
import AdminDashboard from './pages/admin-dashboard'
import UserDashboard from './pages/user-dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/user-login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/applications/new" element={<CreateRecipe />} />
      <Route path="/applications/:id" element={<RecipePage />} />
    </Routes>
  )
}

export default App
