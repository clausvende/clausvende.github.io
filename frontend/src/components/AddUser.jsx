import { doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'
import { db } from '../firebase'

export default function AddUser({ onDone }) {
  const [email, setEmail] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email) return
    await setDoc(doc(db, 'usuarios', email), { createdAt: Date.now() })
    if (onDone) onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold text-center">Nuevo Usuario</h2>
      <input
        className="w-full border rounded px-3 py-2"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Correo"
        required
      />
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Guardar</button>
    </form>
  )
}
