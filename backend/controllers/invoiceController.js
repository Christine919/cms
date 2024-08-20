import PDFDocument from 'pdfkit';
import fs from 'fs';

// Generate invoice
export const generateInvoice = (req, res) => {
  const { invoiceData } = req.body;
  const doc = new pdf();
  const fileName = `invoice_${Date.now()}.pdf`;
  const filePath = `./invoices/${fileName}`;

  doc.pipe(fs.createWriteStream(filePath));
  doc.text(`Invoice Data: ${JSON.stringify(invoiceData)}`);
  doc.end();

  res.json({ message: 'Invoice generated', filePath });
};
