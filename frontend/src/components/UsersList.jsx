import { collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import Modal from './Modal'
import AddUser from './AddUser'
import EditUser from './EditUser'
import { db } from '../firebase'
import editIcon from '../assets/icons/edit.svg'

export default function UsersList() {
  const [allowed, setAllowed] = useState([])
  const [users, setUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const load = async () => {
    const allowSnap = await getDocs(collection(db, 'usuarios'))
    setAllowed(allowSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    const usersSnap = await getDocs(collection(db, 'users'))
    setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { load() }, [])

  const removeAllow = async email => {
    await deleteDoc(doc(db, 'usuarios', email))
    load()
  }

  const changeRole = async (id, role) => {
    await updateDoc(doc(db, 'users', id), { role })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)} className="bg-blue-500 text-white px-3 py-2 rounded">Nuevo usuario</button>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Usuarios Registrados</h3>
        <ul className="grid gap-2">
          {users.map(u => (
            <li key={u.id} className="card">
              <span className="flex-1">{u.displayName || u.email || u.id}</span>
              <select
                value={u.role}
                onChange={e => changeRole(u.id, e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="Vendedor">Vendedor</option>
                <option value="Administrador">Administrador</option>
              </select>
              <button onClick={() => setEditUser(u)} title="Editar nombre">
                <img src={editIcon} alt="editar" className="icon" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Correos Permitidos</h3>
        <ul className="grid gap-2">
          {allowed.map(a => (
            <li key={a.id} className="card">
              <span className="flex-1">{a.id}</span>
              <button onClick={() => removeAllow(a.id)} className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
            </li>
          ))}
        </ul>
      </div>
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddUser onDone={() => { setShowAdd(false); load() }} />
        </Modal>
      )}
      {editUser && (
        <Modal onClose={() => setEditUser(null)}>
          <EditUser user={editUser} onDone={() => { setEditUser(null); load() }} />
        </Modal>
      )}
    </div>
  )
}
