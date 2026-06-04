import PDFDocument from 'pdfkit';

const BRAND = 'SmartMeter — UEAB Electric Utility';

function collectPdf(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

function header(doc, title) {
  doc.fontSize(18).fillColor('#1b5e4b').text(BRAND, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor('#1a2421').text(title, { align: 'center' });
  doc.moveDown(1);
  doc.strokeColor('#d8d2c4').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.8);
}

function money(amount, currency = 'KES') {
  return `${currency} ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

export async function buildInvoicePdf({ bill, consumer }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const done = collectPdf(doc);

  header(doc, 'TAX INVOICE');
  doc.fontSize(10).fillColor('#5a6562');
  doc.text(`Invoice No: ${bill.invoice_number || bill.id}`);
  doc.text(`Period: ${bill.period_label}`);
  doc.text(`Due date: ${bill.due_date}`);
  doc.text(`Status: ${String(bill.status).toUpperCase()}`);
  doc.moveDown(1);

  doc.fontSize(11).fillColor('#1a2421').text('Bill to', { underline: true });
  doc.fontSize(10).fillColor('#5a6562');
  doc.text(consumer?.full_name ?? 'Consumer');
  doc.text(`Account: ${consumer?.id ?? bill.consumer_id}`);
  if (consumer?.phone) doc.text(`Phone: ${consumer.phone}`);
  if (consumer?.email) doc.text(`Email: ${consumer.email}`);
  doc.moveDown(1);

  doc.fontSize(11).fillColor('#1a2421').text('Charges', { underline: true });
  doc.moveDown(0.4);
  const rows = [
    ['Consumption charges', money(bill.consumption_charges, bill.currency)],
    ['Taxes & fees', money(bill.taxes_fees, bill.currency)],
    ['Total due', money(bill.amount, bill.currency)],
  ];
  for (const [label, val] of rows) {
    doc.fontSize(10).fillColor('#1a2421').text(label, 50, doc.y, { continued: true, width: 350 });
    doc.text(val, { align: 'right' });
    doc.moveDown(0.35);
  }

  doc.moveDown(1.5);
  doc.fontSize(9).fillColor('#5a6562').text(
    'Pay via M-Pesa STK push in the consumer portal or at any authorized agent.',
    { align: 'center' },
  );
  doc.end();
  return done;
}

export async function buildReceiptPdf({ payment, bill, consumer }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const done = collectPdf(doc);

  header(doc, 'PAYMENT RECEIPT');
  doc.fontSize(10).fillColor('#5a6562');
  doc.text(`Receipt ref: ${payment.reference_code}`);
  if (payment.mpesa_receipt) doc.text(`M-Pesa receipt: ${payment.mpesa_receipt}`);
  doc.text(`Date: ${new Date(payment.paid_at || payment.updated_at).toLocaleString('en-KE')}`);
  doc.text(`Method: ${payment.method}`);
  doc.text(`Status: ${String(payment.status).toUpperCase()}`);
  doc.moveDown(1);

  doc.fontSize(11).fillColor('#1a2421').text('Paid by', { underline: true });
  doc.fontSize(10).fillColor('#5a6562');
  doc.text(consumer?.full_name ?? 'Consumer');
  if (payment.phone) doc.text(`Phone: ${payment.phone}`);
  doc.moveDown(1);

  doc.fontSize(11).fillColor('#1a2421').text('Payment details', { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(10).text(`Amount: ${money(payment.amount)}`);
  if (bill) {
    doc.text(`Invoice: ${bill.invoice_number || bill.id}`);
    doc.text(`Billing period: ${bill.period_label}`);
  }

  doc.moveDown(2);
  doc.fontSize(9).fillColor('#2d6a4f').text('Thank you — payment received.', { align: 'center' });
  doc.end();
  return done;
}
