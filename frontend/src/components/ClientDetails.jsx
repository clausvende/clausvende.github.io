import { collection, addDoc, onSnapshot, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    const unsubClient = onSnapshot(doc(db, 'clients', id), snap => {
      setClient({ id: snap.id, ...snap.data() });
    });
    const unsubPay = onSnapshot(collection(db, 'clients', id, 'payments'), snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSales = onSnapshot(collection(db, 'clients', id, 'sales'), snap => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubClient(); unsubPay(); unsubSales(); };
  }, [id]);

  const addPayment = async e => {
    e.preventDefault();
    if (!amount) return;
    const value = parseFloat(amount);
    await addDoc(collection(db, 'clients', id, 'payments'), {
      amount: value,
      date: Date.now()
    });
    await updateDoc(doc(db, 'clients', id), { balance: increment(-value) });
    setAmount('');
  };

  const startEdit = p => {
    setEditingId(p.id);
    setEditAmount(p.amount);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const saveEdit = async p => {
    const newValue = parseFloat(editAmount);
    if (isNaN(newValue)) return;
    await updateDoc(doc(db, 'clients', id, 'payments', p.id), { amount: newValue });
    const diff = newValue - p.amount;
    if (diff !== 0) {
      await updateDoc(doc(db, 'clients', id), { balance: increment(-diff) });
    }
    cancelEdit();
  };

  const removePayment = async p => {
    await deleteDoc(doc(db, 'clients', id, 'payments', p.id));
    await updateDoc(doc(db, 'clients', id), { balance: increment(p.amount) });
  };

  if (!client) return <p>Cargando...</p>;

  return (
    <div>
      <h2>{client.name}</h2>
      <p>Teléfono: {client.phone}</p>
      {client.notes && <p>Observaciones: {client.notes}</p>}
      <p>Deuda actual: ${client.balance || 0}</p>
      <form onSubmit={addPayment}>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Monto del abono" type="number" step="0.01" />
        <button type="submit">Registrar abono</button>
      </form>
      <h3>Ventas</h3>
      <ul className="list">
        {sales.map(s => (
          <li key={s.id}>{new Date(s.date).toLocaleDateString()} - ${s.amount}</li>
        ))}
      </ul>
      <h3>Abonos</h3>
      <ul className="list">
        {payments.map(p => (
          <li key={p.id}>
            {editingId === p.id ? (
              <>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                />
                <button onClick={() => saveEdit(p)}>Guardar</button>
                <button onClick={cancelEdit}>Cancelar</button>
              </>
            ) : (
              <>
                {new Date(p.date).toLocaleDateString()} - ${p.amount}
                <button onClick={() => startEdit(p)}>Editar</button>
                <button onClick={() => removePayment(p)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
