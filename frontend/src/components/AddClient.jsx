import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

export default function AddClient() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'clients'), {
      name,
      phone,
      notes,
      balance: 0,
    });
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo Cliente</h2>
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
