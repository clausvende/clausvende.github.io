import { useState } from 'react'
import ClientList from './components/ClientList'
import ClientDetails from './components/ClientDetails'
import Report from './components/Report'
import SalesList from './components/SalesList'
import { AuthProvider, useAuth } from './AuthProvider'
import Login from './Login'
import cart from './assets/icons/cart.svg'
import users from './assets/icons/users.svg'
import dollar from './assets/icons/dollar.svg'
import './App.css'

function MainContent({ page, setPage }) {
  const { user, role, logout } = useAuth()
  if (!user) return <Login />

  const go = (name, clientId = null) => setPage({ name, clientId })

  let content
  switch (page.name) {
    case 'clients':
      content = <ClientList go={go} />
      break
    case 'sales':
      content = <SalesList />
      break
    case 'finance':
      content = <Report />
      break
    case 'client':
      content = <ClientDetails id={page.clientId} go={go} />
      break
    default:
      content = <ClientList go={go} />
  }

  return (
    <>
      <header className="header">
        <div className="user-info">
          <img src={user.photoURL} alt="avatar" />
          <div>
            <strong>{user.displayName}</strong>
            <div className="role">{role}</div>
          </div>
        </div>
        <button onClick={logout}>Cerrar sesión</button>
      </header>
      <nav>
        <button onClick={() => go('sales')}>
          <img src={cart} alt="" className="icon" />Ventas
        </button>
        <span className="sep">|</span>
        <button onClick={() => go('clients')}>
          <img src={users} alt="" className="icon" />Clientes
        </button>
        <span className="sep">|</span>
        <button onClick={() => go('finance')}>
          <img src={dollar} alt="" className="icon" />Finanzas
        </button>
      </nav>
      <div className="container">
        {content}
      </div>
    </>
  )
}

export default function App() {
  const [page, setPage] = useState({ name: 'clients' })
  return (
    <AuthProvider>
      <MainContent page={page} setPage={setPage} />
    </AuthProvider>
  )
}
