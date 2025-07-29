import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import AddSale from './AddSale';
import Modal from './Modal';

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const load = async () => {
      const clientSnap = await getDocs(collection(db, 'clients'));
      const all = [];
      for (const c of clientSnap.docs) {
        const salesSnap = await getDocs(collection(db, 'clients', c.id, 'sales'));
        salesSnap.forEach(s => {
          all.push({
            id: s.id,
            clientId: c.id,
            clientName: c.data().name,
            ...s.data(),
          });
        });
      }
      setSales(all);
    };
    load();
  }, []);

  const filtered = sales.filter(s =>
    s.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <button onClick={() => setShow(true)}>Nueva venta</button>
      <input
        placeholder="Buscar por cliente"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul className="list">
        {filtered.map(s => (
          <li key={`${s.clientId}-${s.id}`}>
            {s.clientName} - {new Date(s.date).toLocaleDateString()} - ${s.amount}
          </li>
        ))}
      </ul>
      {show && (
        <Modal onClose={() => setShow(false)}>
          <AddSale onDone={() => setShow(false)} />
        </Modal>
      )}
    </div>
  );
}
