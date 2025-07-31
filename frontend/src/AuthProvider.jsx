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
        setUser(u)
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setRole(snap.data().role)
          if (!snap.data().email) await setDoc(ref, { email: u.email, displayName: u.displayName }, { merge: true })
        } else {
          await setDoc(ref, { role: 'Vendedor', email: u.email, displayName: u.displayName })
          setRole('Vendedor')
        }
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
