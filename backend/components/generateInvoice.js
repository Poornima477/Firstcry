import PDFDocument from "pdfkit";

export function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", chunk => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // ── Header ──
    doc.fontSize(20).fillColor("#6a0dad").text("FIRSTCRY", { align: "center" });
    doc.fontSize(10).fillColor("#555").text("Online Baby & Kids Store", { align: "center" });
    doc.moveDown();

    doc.fontSize(16).fillColor("#000").text("GST INVOICE", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // ── Invoice Info ──
    doc.fontSize(10).fillColor("#333");
    doc.text(`Invoice No   : #${String(order._id).slice(-6).toUpperCase()}`);
    doc.text(`Order Date   : ${new Date(order.createdAt).toLocaleDateString("en-IN")}`);
    doc.text(`Payment      : ${order.payment}`);
    doc.text(`Order Status : ${order.orderStatus}`);
    doc.moveDown();

    // ── Customer Info ──
    doc.fontSize(12).fillColor("#6a0dad").text("Bill To:");
    doc.fontSize(10).fillColor("#333");
    doc.text(`Name    : ${order.fullName}`);
    doc.text(`Email   : ${order.email}`);
    doc.text(`Phone   : ${order.phone}`);
    doc.text(`Address : ${order.address}, ${order.city}, ${order.state} - ${order.pincode}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Items Table Header ──
    const tableTop = doc.y;
    doc.rect(50, tableTop, 500, 20).fill("#6a0dad");
    doc.fillColor("#fff").fontSize(10)
      .text("Item Name",  55, tableTop + 5, { width: 260 })
      .text("Qty",       320, tableTop + 5)
      .text("Price",     390, tableTop + 5)
      .text("Subtotal",  470, tableTop + 5);
    doc.moveDown(1.5);

    // ── Items Rows ──
    let y = doc.y;
    order.items.forEach((item, i) => {
      const subtotal = (item.price || 0) * (item.quantity || 1);
      if (i % 2 === 0) doc.rect(50, y, 500, 20).fill("#f5f0ff");
      doc.fillColor("#333").fontSize(10)
        .text(item.name,               55, y + 4, { width: 260 })
        .text(String(item.quantity || 1), 320, y + 4)
        .text(`Rs.${item.price || 0}`, 390, y + 4)
        .text(`Rs.${subtotal}`,        470, y + 4);
      y += 22;
    });

    doc.y = y + 10;
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // ── GST Breakdown ──
    const baseAmount = Math.round(order.total / 1.18);
    const gstAmount  = order.total - baseAmount;

    doc.fontSize(10).fillColor("#333")
      .text(`Base Amount (before GST) : Rs.${baseAmount}`, { align: "right" });
    doc.text(`GST @ 18%               : Rs.${gstAmount}`,  { align: "right" });
    doc.fontSize(12).fillColor("#6a0dad")
      .text(`Total Amount             : Rs.${order.total}`, { align: "right" });
    doc.moveDown();

    // ── Footer ──
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#888")
      .text("Thank you for shopping with FirstCry!", { align: "center" });
    doc.text("This is a computer-generated invoice. No signature required.", { align: "center" });

    doc.end();
  });
}