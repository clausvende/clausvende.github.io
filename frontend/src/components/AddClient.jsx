import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../firebase';

export default function AddClient({ go, onDone, client }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setPhone(client.phone || '');
      setNotes(client.notes || '');
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (client) {
      await updateDoc(doc(db, 'clients', client.id), {
        name,
        phone,
        notes,
      });
    } else {
      await addDoc(collection(db, 'clients'), {
        name,
        phone,
        notes,
        balance: 0,
      });
    }
    if (onDone) onDone();
    else go('list');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold text-center">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
      <input
        className="w-full border rounded px-3 py-2"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nombre"
        required
      />
      <input
        className="w-full border rounded px-3 py-2"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Teléfono"
        pattern="\(\d{3}\) \d{3} \d{4}"
      />
      <input
        className="w-full border rounded px-3 py-2"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Observaciones"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Guardar</button>
    </form>
  );
}
