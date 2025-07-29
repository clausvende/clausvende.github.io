import { collection, addDoc, onSnapshot, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import AddClient from './AddClient';
import Modal from './Modal';
import editIcon from '../assets/icons/edit.svg';
import trash from '../assets/icons/trash.svg';

export default function ClientDetails({ id, go }) {
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [amount, setAmount] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editSaleAmount, setEditSaleAmount] = useState('');

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
    if (!window.confirm('¿Eliminar este abono?')) return;
    await deleteDoc(doc(db, 'clients', id, 'payments', p.id));
    await updateDoc(doc(db, 'clients', id), { balance: increment(p.amount) });
  };

  const startEditSale = s => {
    setEditingSaleId(s.id);
    setEditSaleAmount(s.amount);
  };

  const cancelEditSale = () => {
    setEditingSaleId(null);
    setEditSaleAmount('');
  };

  const saveEditSale = async s => {
    const newValue = parseFloat(editSaleAmount);
    if (isNaN(newValue)) return;
    await updateDoc(doc(db, 'clients', id, 'sales', s.id), { amount: newValue });
    const diff = newValue - s.amount;
    if (diff !== 0) {
      await updateDoc(doc(db, 'clients', id), {
        balance: increment(diff),
        total: increment(diff)
      });
    }
    cancelEditSale();
  };

  const removeSale = async s => {
    if (!window.confirm('¿Eliminar esta venta?')) return;
    await deleteDoc(doc(db, 'clients', id, 'sales', s.id));
    await updateDoc(doc(db, 'clients', id), {
      balance: increment(-s.amount),
      total: increment(-s.amount)
    });
  };

  const removeClient = async () => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    await deleteDoc(doc(db, 'clients', id));
    go('clients');
  };

  if (!client) return <p>Cargando...</p>;

  return (
    <div className="space-y-4">
      <button onClick={() => go('list')} className="text-blue-600">Regresar</button>
      <h2 className="text-lg font-semibold flex items-center gap-2">
        {client.name}
        <button onClick={() => setEditMode(true)}>
          <img src={editIcon} alt="editar" className="icon" />
        </button>
        <button onClick={removeClient}>
          <img src={trash} alt="eliminar" className="icon" />
        </button>
      </h2>
      <p>Teléfono: {client.phone}</p>
      {client.notes && <p>Observaciones: {client.notes}</p>}
      <p>Deuda actual: ${client.balance || 0}</p>
      <form onSubmit={addPayment} className="flex gap-2">
        <input className="border rounded px-3 py-2 flex-1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Monto del abono" type="number" step="0.01" />
        <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">Registrar abono</button>
      </form>
      <h3 className="font-semibold">Ventas</h3>
      <ul className="grid gap-2">
        {sales.map(s => (
          <li key={s.id} className="bg-white p-2 rounded shadow">
            {editingSaleId === s.id ? (
              <>
                <input
                  className="border rounded px-2 py-1 mr-2"
                  type="number"
                  step="0.01"
                  value={editSaleAmount}
                  onChange={e => setEditSaleAmount(e.target.value)}
                />
                <button onClick={() => saveEditSale(s)} className="bg-blue-600 text-white px-2 py-1 rounded mr-1">Guardar</button>
                <button onClick={cancelEditSale} className="px-2 py-1 rounded border">Cancelar</button>
              </>
            ) : (
              <>
                {new Date(s.date).toLocaleDateString()} - {s.description} - ${s.amount}
                <button onClick={() => startEditSale(s)}>
                  <img src={editIcon} alt="editar" className="icon" />
                </button>
                <button onClick={() => removeSale(s)}>
                  <img src={trash} alt="eliminar" className="icon" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <h3 className="font-semibold">Abonos</h3>
      <ul className="grid gap-2">
        {payments.map(p => (
          <li key={p.id} className="bg-white p-2 rounded shadow">
            {editingId === p.id ? (
              <>
                <input
                  className="border rounded px-2 py-1 mr-2"
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                />
                <button onClick={() => saveEdit(p)} className="bg-blue-600 text-white px-2 py-1 rounded mr-1">Guardar</button>
                <button onClick={cancelEdit} className="px-2 py-1 rounded border">Cancelar</button>
              </>
            ) : (
              <>
                {new Date(p.date).toLocaleDateString()} - ${p.amount}
                <button onClick={() => startEdit(p)}>
                  <img src={editIcon} alt="editar" className="icon" />
                </button>
                <button onClick={() => removePayment(p)}>
                  <img src={trash} alt="eliminar" className="icon" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {editMode && (
        <Modal onClose={() => setEditMode(false)}>
          <AddClient client={client} onDone={() => setEditMode(false)} />
        </Modal>
      )}
    </div>
  );
}
