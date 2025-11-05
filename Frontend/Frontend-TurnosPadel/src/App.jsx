import { AuthProvider } from './context/AuthContext'
import RutasApp from './components/rutas/RutasApp'
import NavBar from './components/navegacion/NavBar'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <main className="container mx-auto">
          <RutasApp />
        </main>
      </div>
    </AuthProvider>
  )
}

export default App

