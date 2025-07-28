import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

export default function ClientList() {
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
            <Link to={`/client/${c.id}`}>{c.name}</Link> - deuda: ${c.balance || 0}
          </li>
        ))}
      </ul>
    </div>
  );
}
