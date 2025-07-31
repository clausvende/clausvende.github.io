export function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Aplica abonos a las ventas en orden cronológico, actualizando
// los campos `abonado`, `pendiente` y `pagada` de cada venta.
export function applyPaymentsToSales(sales, payments) {
  const sortedSales = [...sales].sort((a, b) => a.date - b.date);
  const sortedPayments = [...payments].sort((a, b) => a.date - b.date);

  let payIndex = 0;
  let remaining = sortedPayments[payIndex]?.amount || 0;

  for (const sale of sortedSales) {
    let paid = 0;
    while (payIndex < sortedPayments.length && paid < sale.amount) {
      const toUse = Math.min(remaining, sale.amount - paid);
      paid += toUse;
      remaining -= toUse;
      if (remaining === 0) {
        payIndex += 1;
        remaining = sortedPayments[payIndex]?.amount || 0;
      }
    }
    sale.abonado = paid;
    sale.pendiente = Math.max(0, sale.amount - paid);
    sale.pagada = sale.pendiente === 0;
  }

  return sales;
}
