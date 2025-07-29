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
    <form onSubmit={handleSubmit}>
      <h2>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nombre"
        required
      />
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Teléfono"
        pattern="\(\d{3}\) \d{3} \d{4}"
      />
      <input
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Observaciones"
      />
      <button type="submit">Guardar</button>
    </form>
  );
}
