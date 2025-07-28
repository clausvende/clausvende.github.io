import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export default function ClientList({ go }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const snapshot = await getDocs(collection(db, 'clients'));
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);

  return (
    <div>
      <h2>Clientes</h2>
      <ul className="list">
        {clients.map(c => (
          <li key={c.id}>
            <button onClick={() => go('client', c.id)}>{c.name}</button> - deuda: ${c.balance || 0}
          </li>
        ))}
      </ul>
    </div>
  );
}
