import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import AddSale from './AddSale';
import Modal from './Modal';
import plus from '../assets/icons/plus.svg';

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={() => setShow(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded">
          <img src={plus} alt="" className="w-5 h-5" />Nueva venta
        </button>
        <input
          className="border rounded px-3 py-2"
          placeholder="Buscar por cliente"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <ul className="grid gap-3">
        {filtered.map(s => (
          <li key={`${s.clientId}-${s.id}`} className="bg-white p-4 rounded shadow">
            {s.clientName} - {new Date(s.date).toLocaleDateString()} - {s.description} - ${s.amount}
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
