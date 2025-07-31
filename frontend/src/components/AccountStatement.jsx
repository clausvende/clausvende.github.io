import { collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import { formatMoney, applyPaymentsToSales, mapPaymentsToSales } from '../utils';

export default function AccountStatement({ clientId }) {
  const [client, setClient] = useState(null);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const cSnap = await getDoc(doc(db, 'clients', clientId));
      if (!cSnap.exists()) return;
      setClient({ id: cSnap.id, ...cSnap.data() });
      const salesSnap = await getDocs(collection(db, 'clients', clientId, 'sales'));
      const salesData = salesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const paySnap = await getDocs(collection(db, 'clients', clientId, 'payments'));
      const payData = paySnap.docs.map(d => ({ id: d.id, ...d.data() }));
      applyPaymentsToSales(salesData, payData);
      const mappedPays = mapPaymentsToSales(salesData, payData);
      setSales(salesData);
      setPayments(mappedPays);
    };
    load();
  }, [clientId]);

  const exportPdf = () => {
    const pdf = new jsPDF({ format: 'a5' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let y = margin;

    pdf.setFontSize(16);
    pdf.text('Claudia Vende', pageWidth / 2, y, { align: 'center' });
    y += 7;
    pdf.setFontSize(12);
    pdf.text('Estado de Cuenta', pageWidth / 2, y, { align: 'center' });
    y += 3;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.text(String(`Nombre: ${client.name}`), margin, y);
    y += 4;
    pdf.text(String(`Teléfono: ${client.phone}`), margin, y);
    y += 4;
    pdf.text(String(`Fecha: ${new Date().toLocaleDateString()}`), margin, y);
    y += 6;

    pdf.setFontSize(12);
    pdf.text('Resumen', margin, y);
    y += 5;
    pdf.setFontSize(10);
    const resumen = [
      ['Total comprado', formatMoney(totalSales)],
      ['Total abonado', formatMoney(totalPayments)],
      ['Saldo pendiente', formatMoney(totalSales - totalPayments)],
    ];
    pdf.setFont(undefined, 'bold');
    resumen.forEach(r => {
      pdf.text(String(r[0]), margin, y);
      pdf.text(String(`$${r[1]}`), pageWidth - margin, y, { align: 'right' });
      y += 4;
    });
    pdf.setFont(undefined, 'normal');
    y += 4;

    pdf.setFontSize(12);
    pdf.text('Detalle de ventas', margin, y);
    y += 4;
    pdf.setFontSize(10);
    const col = [margin, margin + 30, pageWidth - 55, pageWidth - 35, pageWidth - margin];
    pdf.setFont(undefined, 'bold');
    pdf.text('Fecha', col[0], y);
    pdf.text('Producto', col[1], y);
    pdf.text('Monto', col[2], y, { align: 'right' });
    pdf.text('Abonado', col[3], y, { align: 'right' });
    pdf.text('Saldo', col[4], y, { align: 'right' });
    pdf.setFont(undefined, 'normal');
    y += 2;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 4;

    sales
      .sort((a, b) => a.date - b.date)
      .forEach(s => {
        pdf.text(String(new Date(s.date).toLocaleDateString()), col[0], y);
        pdf.text(String(s.description), col[1], y);
        pdf.text(String(formatMoney(s.amount)), col[2], y, { align: 'right' });
        pdf.text(String(formatMoney(s.abonado)), col[3], y, { align: 'right' });
        pdf.text(String(s.pagada ? '✔' : formatMoney(s.pendiente)), col[4], y, { align: 'right' });
        y += 4;
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      });

    y += 6;
    pdf.setFontSize(12);
    pdf.text('Detalle de abonos', margin, y);
    y += 4;
    pdf.setFontSize(10);
    const pcol = [margin, margin + 30, pageWidth - margin];
    pdf.setFont(undefined, 'bold');
    pdf.text('Fecha', pcol[0], y);
    pdf.text('Venta', pcol[1], y);
    pdf.text('Monto', pcol[2], y, { align: 'right' });
    pdf.setFont(undefined, 'normal');
    y += 2;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 4;

    payments
      .sort((a, b) => a.date - b.date)
      .forEach(p => {
        pdf.text(String(new Date(p.date).toLocaleDateString()), pcol[0], y);
        if (p.saleDescription) pdf.text(String(p.saleDescription), pcol[1], y);
        pdf.text(String(formatMoney(p.amount)), pcol[2], y, { align: 'right' });
        y += 4;
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      });

    pdf.setFontSize(9);
    pdf.text('¡Gracias por su preferencia!', pageWidth / 2, pageHeight - margin, { align: 'center' });

    pdf.save(`estado-${client.name}.pdf`);
  };

  if (!client) return <p>Cargando...</p>;

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Estado de cuenta</h2>
        <p><strong>Nombre:</strong> {client.name}</p>
        <p><strong>Teléfono:</strong> {client.phone}</p>
        {client.notes && <p><strong>Notas:</strong> {client.notes}</p>}
        <p><strong>Saldo actual:</strong> ${formatMoney(client.balance)}</p>
        <h3 className="font-semibold">Ventas</h3>
        <ul className="list-disc pl-5">
          {sales.map(s => (
            <li key={s.id}>
              {new Date(s.date).toLocaleDateString()} - {s.description} - ${formatMoney(s.amount)} | Abonado: ${formatMoney(s.abonado)} | Pendiente: ${formatMoney(s.pendiente)} | {s.pagada ? 'Pagada' : 'Pendiente'}
            </li>
          ))}
        </ul>
        <h3 className="font-semibold">Abonos</h3>
        <ul className="list-disc pl-5">
          {payments.map(p => (
            <li key={p.id}>{new Date(p.date).toLocaleDateString()} - ${formatMoney(p.amount)}</li>
          ))}
        </ul>
        <p><strong>Total compras:</strong> ${formatMoney(totalSales)}</p>
        <p><strong>Total abonos:</strong> ${formatMoney(totalPayments)}</p>
      </div>
      <button onClick={exportPdf} className="bg-blue-500 text-white px-3 py-2 rounded">Generar PDF</button>
    </div>
  );
}
