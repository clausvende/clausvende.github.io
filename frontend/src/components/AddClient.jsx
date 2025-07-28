import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

export default function AddClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'clients'), { name, email, phone, balance: 0 });
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo Cliente</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" />
      <button type="submit">Guardar</button>
    </form>
  );
}
