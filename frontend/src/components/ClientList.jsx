import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import AddClient from './AddClient';
import Modal from './Modal';
import AccountStatement from './AccountStatement';
import eye from '../assets/icons/eye.svg';
import docIcon from '../assets/icons/doc.svg';
import chat from '../assets/icons/chat.svg';
import editIcon from '../assets/icons/edit.svg';
import trash from '../assets/icons/trash.svg';
import plus from '../assets/icons/plus.svg';

export default function ClientList({ go }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [statementId, setStatementId] = useState(null);

  const fetchClients = async () => {
    const snapshot = await getDocs(collection(db, 'clients'));
    setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const removeClient = async c => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    await deleteDoc(doc(db, 'clients', c.id));
    fetchClients();
  };

  return (
    <div>
      <button onClick={() => setShow(true)}>
        <img src={plus} alt="" className="icon" />Nuevo cliente
      </button>
      <input
        placeholder="Buscar cliente"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul className="list">
        {filtered.map(c => {
          const cleanPhone = (c.phone || '').replace(/\D/g, '');
          return (
            <li key={c.id}>
              <span className="name">{c.name} - deuda: ${c.balance || 0}</span>
              <span className="actions">
                <button onClick={() => go('client', c.id)}>
                  <img src={eye} alt="ver" className="icon" />
                </button>
                <button onClick={() => setStatementId(c.id)}>
                  <img src={docIcon} alt="estado" className="icon" />
                </button>
                {cleanPhone && (
                  <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer">
                    <img src={chat} alt="mensaje" className="icon" />
                  </a>
                )}
                <button onClick={() => setEditClient(c)}>
                  <img src={editIcon} alt="editar" className="icon" />
                </button>
                <button onClick={() => removeClient(c)}>
                  <img src={trash} alt="eliminar" className="icon" />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      {show && (
        <Modal onClose={() => setShow(false)}>
          <AddClient onDone={() => { setShow(false); fetchClients(); }} />
        </Modal>
      )}
      {editClient && (
        <Modal onClose={() => setEditClient(null)}>
          <AddClient client={editClient} onDone={() => { setEditClient(null); fetchClients(); }} />
        </Modal>
      )}
      {statementId && (
        <Modal onClose={() => setStatementId(null)}>
          <AccountStatement clientId={statementId} />
        </Modal>
      )}
    </div>
  );
}
