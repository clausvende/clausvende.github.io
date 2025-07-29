import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import chat from '../assets/icons/chat.svg';
import { db } from '../firebase';

export default function Report() {
  const [summary, setSummary] = useState({ total: 0, outstanding: 0 });
  const [debtors, setDebtors] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'clients'));
      let total = 0;
      let outstanding = 0;
      const now = Date.now();
      const month = 30 * 24 * 60 * 60 * 1000;
      const overdue = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        total += data.total || 0;
        const balance = data.balance || 0;
        outstanding += balance;
        if (balance > 0) {
          const paySnap = await getDocs(collection(db, 'clients', docSnap.id, 'payments'));
          let last = 0;
          paySnap.forEach(p => {
            if (p.data().date > last) last = p.data().date;
          });
          if (!last || now - last >= month) {
            overdue.push({ id: docSnap.id, name: data.name, phone: data.phone, balance });
          }
        }
      }
      setSummary({ total, outstanding });
      setDebtors(overdue);
    };
    load();
  }, []);

  const exportDb = async () => {
    const data = {};
    const clientSnap = await getDocs(collection(db, 'clients'));
    const clients = [];
    for (const c of clientSnap.docs) {
      const salesSnap = await getDocs(collection(db, 'clients', c.id, 'sales'));
      const paymentsSnap = await getDocs(collection(db, 'clients', c.id, 'payments'));
      clients.push({
        id: c.id,
        ...c.data(),
        sales: salesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        payments: paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      });
    }
    data.clients = clients;
    const usuariosSnap = await getDocs(collection(db, 'usuarios'));
    data.usuarios = usuariosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const usersSnap = await getDocs(collection(db, 'users'));
    data.users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDb = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.clients) {
      for (const c of data.clients) {
        await setDoc(doc(db, 'clients', c.id), {
          name: c.name,
          phone: c.phone,
          notes: c.notes,
          balance: c.balance,
          total: c.total
        });
        if (c.sales) for (const s of c.sales) await setDoc(doc(db, 'clients', c.id, 'sales', s.id), { amount: s.amount, date: s.date });
        if (c.payments) for (const p of c.payments) await setDoc(doc(db, 'clients', c.id, 'payments', p.id), { amount: p.amount, date: p.date });
      }
    }
    if (data.usuarios) for (const u of data.usuarios) await setDoc(doc(db, 'usuarios', u.id), u);
    if (data.users) for (const u of data.users) await setDoc(doc(db, 'users', u.id), u);
    alert('Importación completada');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Finanzas</h2>
      <p>Total ventas: ${summary.total}</p>
      <p>Saldo pendiente: ${summary.outstanding}</p>
      <div className="flex gap-2">
        <button onClick={exportDb} className="bg-blue-600 text-white px-3 py-1 rounded">Exportar DB</button>
        <button onClick={() => fileRef.current.click()} className="bg-blue-600 text-white px-3 py-1 rounded">Importar DB</button>
      </div>
      <input type="file" accept="application/json" ref={fileRef} style={{ display: 'none' }} onChange={importDb} />
      {debtors.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Clientes Morosos</h3>
          <ul className="grid gap-3">
            {debtors.map(d => {
              const cleanPhone = (d.phone || '').replace(/\D/g, '');
              return (
                <li key={d.id} className="bg-white p-4 rounded shadow flex justify-between items-center border-l-4 border-red-600">
                  <span className="font-medium">{d.name} - ${d.balance}</span>
                  {cleanPhone && (
                    <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer">
                      <img src={chat} alt="mensaje" className="icon" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
