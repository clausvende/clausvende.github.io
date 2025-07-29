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
  const [open, setOpen] = useState(false)
  if (!user) return <Login />

  const splitName = name => {
    const parts = name ? name.trim().split(/\s+/) : []
    if (parts.length <= 2) {
      return { nombres: parts[0] || '', apellidos: parts.slice(1).join(' ') }
    }
    return {
      nombres: parts.slice(0, parts.length - 2).join(' '),
      apellidos: parts.slice(parts.length - 2).join(' '),
    }
  }

  const { nombres, apellidos } = splitName(user.displayName)

  const go = (name, clientId = null) => {
    setPage({ name, clientId })
    setOpen(false)
  }

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
    <div className="flex min-h-screen bg-gray-100">
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-10"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`bg-slate-800 text-white w-60 p-4 space-y-2 fixed inset-y-0 left-0 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform md:relative md:translate-x-0 z-20`}>
        <button
          className="md:hidden absolute top-2 right-2 text-2xl"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <h1 className="text-lg font-semibold mb-4">Menú</h1>
        <nav className="flex flex-col gap-2">
          <button onClick={() => go('sales')} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-700 text-left">
            <img src={cart} alt="" className="w-5 h-5" />Ventas
          </button>
          <button onClick={() => go('clients')} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-700 text-left">
            <img src={users} alt="" className="w-5 h-5" />Clientes
          </button>
          <button onClick={() => go('finance')} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-700 text-left">
            <img src={dollar} alt="" className="w-5 h-5" />Finanzas
          </button>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col md:ml-60 md:mr-4">
        <header className="flex items-center justify-between bg-white shadow px-4 py-2 fixed top-0 left-0 right-0 md:left-60 md:right-4">
          <button
            className="md:hidden text-2xl mr-4"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
            <div className="leading-tight">
              <p className="font-semibold leading-tight md:hidden">{nombres}</p>
              <p className="font-semibold leading-tight md:hidden">{apellidos}</p>
              <p className="font-semibold leading-none hidden md:block">{user.displayName}</p>
              <p className="text-xs text-gray-700">{role}</p>
            </div>
          </div>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Cerrar sesión</button>
        </header>
        <main className="p-4 mt-20 md:mt-16 flex-1">{content}</main>
      </div>
    </div>
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
