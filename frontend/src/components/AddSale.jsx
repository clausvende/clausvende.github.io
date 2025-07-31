import { collection, getDocs, doc, addDoc, updateDoc, increment } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { db } from '../firebase';
import { formatMoney } from '../utils';

export default function AddSale({ go, onDone, sale }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(sale?.clientId || '');
  const [amount, setAmount] = useState(sale?.amount || '');
  const [desc, setDesc] = useState(sale?.description || '');
  const [date, setDate] = useState(() => {
    if (sale?.date) return new Date(sale.date).toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'clients'));
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  useEffect(() => {
    if (sale) {
      setClientId(sale.clientId);
      setAmount(sale.amount);
      setDesc(sale.description);
      setDate(new Date(sale.date).toISOString().split('T')[0]);
    }
  }, [sale]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!clientId || !amount || !desc || !date) return;
    const value = parseFloat(amount);
    const ref = doc(db, 'clients', clientId);
    if (sale) {
      const diff = value - sale.amount;
      await updateDoc(doc(ref, 'sales', sale.id), {
        amount: value,
        description: desc,
        date: new Date(date).getTime()
      });
      if (diff !== 0) {
        await updateDoc(ref, { balance: increment(diff), total: increment(diff) });
      }
    } else {
      const ts = new Date(date).getTime();
      await addDoc(collection(ref, 'sales'), { amount: value, description: desc, date: ts });
      await updateDoc(ref, { balance: increment(value), total: increment(value) });

      const client = clients.find(c => c.id === clientId);
      if (client) {
        const pdf = new jsPDF({ unit: 'mm', format: [58, 100] });
        pdf.setFontSize(12);
        pdf.text('Ticket de Venta', 5, 10);
        pdf.text(`Cliente: ${client.name}`, 5, 20);
        pdf.text(`Fecha: ${new Date(ts).toLocaleString()}`, 5, 30);
        pdf.text(desc, 5, 40);
        pdf.text(`Monto: $${formatMoney(value)}`, 5, 50);
        pdf.save('ticket.pdf');
      }
    }
    if (onDone) onDone(clientId);
    else go('client', clientId);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold text-center">{sale ? 'Editar Venta' : 'Nueva Venta'}</h2>
      {sale ? (
        <p className="font-medium">Cliente: {sale.clientName}</p>
      ) : (
        <select
          className="w-full border rounded px-3 py-2"
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          required
        >
          <option value="" disabled>Selecciona un cliente</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}
      <input
        className="w-full border rounded px-3 py-2"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Descripción"
        required
      />
      <input
        className="w-full border rounded px-3 py-2"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Monto"
        type="number"
        step="0.01"
        required
      />
      <input
        className="w-full border rounded px-3 py-2"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">{sale ? 'Guardar cambios' : 'Registrar venta'}</button>
    </form>
  );
}
