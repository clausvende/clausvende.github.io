import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export default function Report() {
  const [summary, setSummary] = useState({ total: 0, outstanding: 0 });

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'clients'));
      let total = 0;
      let outstanding = 0;
      snap.forEach(doc => {
        const data = doc.data();
        total += data.total || 0;
        outstanding += data.balance || 0;
      });
      setSummary({ total, outstanding });
    };
    load();
  }, []);

  return (
    <div>
      <h2>Reporte Financiero</h2>
      <p>Total ventas: ${summary.total}</p>
      <p>Saldo pendiente: ${summary.outstanding}</p>
    </div>
  );
}
