import { collection, addDoc, onSnapshot, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const unsubClient = onSnapshot(doc(db, 'clients', id), snap => {
      setClient({ id: snap.id, ...snap.data() });
    });
    const unsubPay = onSnapshot(collection(db, 'clients', id, 'payments'), snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubClient(); unsubPay(); };
  }, [id]);

  const addPayment = async e => {
    e.preventDefault();
    if (!amount) return;
    const value = parseFloat(amount);
    await addDoc(collection(db, 'clients', id, 'payments'), {
      amount: value,
      date: Date.now()
    });
    setAmount('');
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
      <h3>Historial</h3>
      <ul className="list">
        {payments.map(p => (
          <li key={p.id}>{new Date(p.date).toLocaleDateString()} - ${p.amount}</li>
        ))}
      </ul>
    </div>
  );
}
