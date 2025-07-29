import { collection, getDocs, doc, addDoc, updateDoc, increment } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { db } from '../firebase';

export default function AddSale({ go, onDone }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'clients'));
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!clientId || !amount || !desc) return;
    const value = parseFloat(amount);
    const ref = doc(db, 'clients', clientId);
    const date = Date.now();
    await addDoc(collection(ref, 'sales'), { amount: value, description: desc, date });
    await updateDoc(ref, { balance: increment(value), total: increment(value) });

    const client = clients.find(c => c.id === clientId);
    if (client) {
      const pdf = new jsPDF({ unit: 'mm', format: [58, 100] });
      pdf.setFontSize(12);
      pdf.text('Ticket de Venta', 5, 10);
      pdf.text(`Cliente: ${client.name}`, 5, 20);
      pdf.text(`Fecha: ${new Date(date).toLocaleString()}`, 5, 30);
      pdf.text(desc, 5, 40);
      pdf.text(`Monto: $${value.toFixed(2)}`, 5, 50);
      pdf.save('ticket.pdf');
    }
    if (onDone) onDone(clientId);
    else go('client', clientId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nueva Venta</h2>
      <select value={clientId} onChange={e => setClientId(e.target.value)} required>
        <option value="" disabled>Selecciona un cliente</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Descripci\u00f3n"
        required
      />
      <input
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Monto"
        type="number"
        step="0.01"
        required
      />
      <button type="submit">Registrar venta</button>
    </form>
  );
}
