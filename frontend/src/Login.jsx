import { useAuth } from './AuthProvider'

export default function Login() {
  const { login } = useAuth()
  return (
    <div className="container">
      <h2>Ingresa</h2>
      <button onClick={login}>Iniciar sesión con Google</button>
    </div>
  )
}
