/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useEffect, useState } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider, db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        const allowSnap = await getDoc(doc(db, 'usuarios', u.email))
        if (!allowSnap.exists()) {
          await signOut(auth)
          setUser(null)
          setRole(null)
          return
        }
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        let data
        if (snap.exists()) {
          data = snap.data()
          setRole(data.role)
          if (!data.email) {
            await setDoc(ref, { email: u.email, displayName: u.displayName, photoURL: u.photoURL }, { merge: true })
            data.email = u.email
            data.displayName = data.displayName || u.displayName
            data.photoURL = u.photoURL
          }
        } else {
          data = { role: 'Vendedor', email: u.email, displayName: u.displayName, photoURL: u.photoURL }
          await setDoc(ref, data)
          setRole('Vendedor')
        }
        setUser({ ...u, ...data, id: u.uid })
      } else {
        setUser(null)
        setRole(null)
      }
    })
    return unsub
  }, [])

  const login = () => signInWithPopup(auth, googleProvider)
  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
