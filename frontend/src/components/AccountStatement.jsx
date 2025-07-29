import { collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AccountStatement({ clientId }) {
  const [client, setClient] = useState(null);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const cSnap = await getDoc(doc(db, 'clients', clientId));
      if (!cSnap.exists()) return;
      setClient({ id: cSnap.id, ...cSnap.data() });
      const salesSnap = await getDocs(collection(db, 'clients', clientId, 'sales'));
      setSales(salesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const paySnap = await getDocs(collection(db, 'clients', clientId, 'payments'));
      setPayments(paySnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, [clientId]);

  const exportPdf = async () => {
    const canvas = await html2canvas(contentRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`estado-${client.name}.pdf`);
  };

  if (!client) return <p>Cargando...</p>;

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div ref={contentRef}>
        <h2>Estado de cuenta</h2>
        <p><strong>Nombre:</strong> {client.name}</p>
        <p><strong>Teléfono:</strong> {client.phone}</p>
        {client.notes && <p><strong>Notas:</strong> {client.notes}</p>}
        <p><strong>Saldo actual:</strong> ${client.balance || 0}</p>
        <h3>Ventas</h3>
        <ul>
          {sales.map(s => (
            <li key={s.id}>{new Date(s.date).toLocaleDateString()} - {s.description} - ${s.amount}</li>
          ))}
        </ul>
        <h3>Abonos</h3>
        <ul>
          {payments.map(p => (
            <li key={p.id}>{new Date(p.date).toLocaleDateString()} - ${p.amount}</li>
          ))}
        </ul>
        <p><strong>Total compras:</strong> ${totalSales}</p>
        <p><strong>Total abonos:</strong> ${totalPayments}</p>
      </div>
      <button onClick={exportPdf}>Generar PDF</button>
    </div>
  );
}
