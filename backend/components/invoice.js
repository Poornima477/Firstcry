const PDFDocument = require("pdfkit");

function generateInvoice(order, res) {
  const doc = new PDFDocument({ margin: 50 });

  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${order._id}.pdf`
  );
  doc.pipe(res);

 
  doc.fontSize(20).font("Helvetica-Bold").text("TAX INVOICE", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica")
    .text("FirstCry Store", { align: "center" })
    .text("123, MG Road, Mangaluru, Karnataka - 575001", { align: "center" })
    .text("GSTIN: 29XXXXX1234X1ZX", { align: "center" })
    .text("Phone: +91 9876543210", { align: "center" });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

 
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN");
  doc.fontSize(10)
    .text(`Invoice No : INV-${order._id.toString().slice(-6).toUpperCase()}`, 50)
    .text(`Invoice Date : ${invoiceDate}`, 50)
    .moveDown();

 
  doc.font("Helvetica-Bold").text("Bill To:");
  doc.font("Helvetica")
    .text(`Name    : ${order.name}`)
    .text(`Email   : ${order.email}`)
    .text(`Address : ${order.address}`)
    .text(`Phone   : ${order.phone}`);

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("No.", 50, doc.y, { width: 30 });
  doc.text("Product", 85, doc.y - 12, { width: 180 });
  doc.text("Qty", 270, doc.y - 12, { width: 50 });
  doc.text("Unit Price", 320, doc.y - 12, { width: 80 });
  doc.text("GST 18%", 400, doc.y - 12, { width: 70 });
  doc.text("Total", 475, doc.y - 12, { width: 70 });

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(10);

  let subTotal = 0;
  let totalGST = 0;

  const items = order.items || [];

  items.forEach((item, index) => {
    const qty = item.quantity || 1;
    const unitPrice = parseFloat(item.price) || 0;
    const basePrice = (unitPrice / 1.18).toFixed(2);         // price before GST
    const gstAmount = (unitPrice - basePrice) * qty;
    const rowTotal = unitPrice * qty;

    subTotal += parseFloat(basePrice) * qty;
    totalGST += gstAmount;

    const y = doc.y;
    doc.text(`${index + 1}`, 50, y, { width: 30 });
    doc.text(item.name, 85, y, { width: 180 });
    doc.text(`${qty}`, 270, y, { width: 50 });
    doc.text(`₹${parseFloat(basePrice).toFixed(2)}`, 320, y, { width: 80 });
    doc.text(`₹${gstAmount.toFixed(2)}`, 400, y, { width: 70 });
    doc.text(`₹${rowTotal.toFixed(2)}`, 475, y, { width: 70 });
    doc.moveDown();
  });

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

 
  const cgst = (totalGST / 2).toFixed(2);
  const sgst = (totalGST / 2).toFixed(2);
  const grandTotal = (subTotal + totalGST).toFixed(2);

  doc.font("Helvetica").fontSize(10);
  doc.text(`Sub Total (excl. GST) :  ₹${subTotal.toFixed(2)}`, { align: "right" });
  doc.text(`CGST (9%)             :  ₹${cgst}`, { align: "right" });
  doc.text(`SGST (9%)             :  ₹${sgst}`, { align: "right" });
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(12)
    .text(`Grand Total           :  ₹${grandTotal}`, { align: "right" });

  doc.moveDown(2);

 
  doc.font("Helvetica").fontSize(9)
    .text("Thank you for shopping with FirstCry!", { align: "center" })
    .text("This is a computer-generated invoice and does not require a signature.", { align: "center" });

  doc.end();
}

module.exports = generateInvoice;