import { useAuth } from './AuthProvider'

export default function Login() {
  const { login } = useAuth()
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="bg-white p-6 rounded shadow text-center space-y-4">
        <h2 className="text-xl font-semibold">Ingresa</h2>
        <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded">Iniciar sesión con Google</button>
      </div>
    </div>
  )
}
