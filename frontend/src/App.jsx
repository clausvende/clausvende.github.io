import { useState } from 'react'
import ClientList from './components/ClientList'
import AddClient from './components/AddClient'
import ClientDetails from './components/ClientDetails'
import Report from './components/Report'
import AddSale from './components/AddSale'
import { AuthProvider, useAuth } from './AuthProvider'
import Login from './Login'
import './App.css'

function MainContent({ page, setPage }) {
  const { user, role, logout } = useAuth()
  if (!user) return <Login />

  const go = (name, clientId = null) => setPage({ name, clientId })

  let content
  switch (page.name) {
    case 'add':
      content = <AddClient go={go} />
      break
    case 'client':
      content = <ClientDetails id={page.clientId} go={go} />
      break
    case 'report':
      content = <Report />
      break
    case 'sale':
      content = <AddSale go={go} />
      break
    default:
      content = <ClientList go={go} />
  }

  return (
    <>
      <header className="header">
        <span>{user.displayName} - {role}</span>
        <button onClick={logout}>Cerrar sesión</button>
      </header>
      <nav>
        <button onClick={() => go('list')}>Clientes</button>
        <button onClick={() => go('add')}>Nuevo cliente</button>
        <button onClick={() => go('report')}>Reporte</button>
        <button onClick={() => go('sale')}>Nueva venta</button>
      </nav>
      <div className="container">
        {content}
      </div>
    </>
  )
}

export default function App() {
  const [page, setPage] = useState({ name: 'list' })
  return (
    <AuthProvider>
      <MainContent page={page} setPage={setPage} />
    </AuthProvider>
  )
}
