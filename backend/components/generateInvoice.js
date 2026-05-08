import PDFDocument from "pdfkit";
import sgMail from "@sendgrid/mail";

// ── Generate PDF Buffer ──────────────────────────────────────────────────────
export function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", chunk => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const purple = "#6a0dad";
    const light  = "#f5f0ff";

    // ── BRAND ──
    doc.fontSize(26).font("Helvetica-Bold").fillColor(purple)
       .text("FIRSTCRY", { align: "center" });
    doc.fontSize(10).font("Helvetica").fillColor("#555")
       .text("Online Baby & Kids Store", { align: "center" });
    doc.moveDown(0.5);

    // ── TITLE ──
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000")
       .text("GST TAX INVOICE", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor(purple).stroke();
    doc.moveDown(0.8);

    // ── Invoice Info (left) + Seller Info (right) ──
    const infoTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(purple)
       .text("Invoice Details", 50, infoTop);
    doc.font("Helvetica").fontSize(9).fillColor("#333")
       .text(`Invoice No   : #${String(order._id).slice(-6).toUpperCase()}`, 50, infoTop + 16)
       .text(`Order Date   : ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 50, infoTop + 30)
       .text(`Payment      : ${order.payment?.toUpperCase() || "N/A"}`, 50, infoTop + 44)
       .text(`Order Status : ${order.orderStatus || "Pending"}`, 50, infoTop + 58);

    doc.font("Helvetica-Bold").fontSize(10).fillColor(purple)
       .text("Seller Details", 310, infoTop);
    doc.font("Helvetica").fontSize(9).fillColor("#333")
       .text("FirstCry Store Pvt Ltd",       310, infoTop + 16)
       .text("MG Road, Mangaluru - 575001",  310, infoTop + 30)
       .text("Karnataka, India",             310, infoTop + 44)
       .text("GSTIN: 29XXXXX1234X1ZX",       310, infoTop + 58);

    doc.moveDown(5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).strokeColor("#ccc").stroke();
    doc.moveDown(0.8);

    // ── Bill To ──
    const billTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(purple)
       .text("Bill To:", 50, billTop);
    doc.font("Helvetica").fontSize(9).fillColor("#333")
       .text(`${order.fullName}`,                                    50, billTop + 16)
       .text(`${order.email}`,                                       50, billTop + 30)
       .text(`Phone: ${order.phone}`,                                50, billTop + 44)
       .text(`${order.address}, ${order.city}`,                      50, billTop + 58)
       .text(`${order.state} - ${order.pincode}`,                    50, billTop + 72);

    doc.moveDown(6);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).strokeColor("#ccc").stroke();
    doc.moveDown(0.8);

    // ── Table Header ──
    const tableHeaderY = doc.y;
    doc.rect(50, tableHeaderY, 495, 22).fill(purple);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff")
       .text("Item",        55,  tableHeaderY + 6, { width: 220 })
       .text("Qty",        275,  tableHeaderY + 6, { width: 50  })
       .text("Base Price", 325,  tableHeaderY + 6, { width: 70  })
       .text("CGST 9%",   395,  tableHeaderY + 6, { width: 55  })
       .text("SGST 9%",   450,  tableHeaderY + 6, { width: 55  })
       .text("Total",     490,  tableHeaderY + 6, { width: 55  });
    doc.moveDown(1.5);

    // ── Table Rows ──
    let y = doc.y;
    let taxableTotal = 0;
    let cgstTotal    = 0;
    let sgstTotal    = 0;
    let grandTotal   = 0;

    (order.items || []).forEach((item, i) => {
      const qty       = item.quantity || 1;
      const itemTotal = (item.price || 0) * qty;
      const base      = parseFloat((itemTotal / 1.18).toFixed(2));
      const cgst      = parseFloat(((itemTotal - base) / 2).toFixed(2));
      const sgst      = cgst;
      const total     = itemTotal;

      taxableTotal += base;
      cgstTotal    += cgst;
      sgstTotal    += sgst;
      grandTotal   += total;

      if (i % 2 === 0) doc.rect(50, y, 495, 22).fill(light);

      doc.font("Helvetica").fontSize(9).fillColor("#333")
         .text(item.name,          55,  y + 6, { width: 215 })
         .text(String(qty),       275,  y + 6)
         .text(`Rs.${base}`,      325,  y + 6)
         .text(`Rs.${cgst}`,      395,  y + 6)
         .text(`Rs.${sgst}`,      450,  y + 6)
         .text(`Rs.${total}`,     490,  y + 6);
      y += 24;
    });

    doc.y = y + 8;
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).strokeColor("#ccc").stroke();
    doc.moveDown(0.8);

    // ── GST Summary ──
    const sx = 310;
    doc.font("Helvetica").fontSize(9).fillColor("#333")
       .text("Taxable Amount (excl. GST):", sx, doc.y, { width: 170 })
       .text(`Rs.${taxableTotal.toFixed(2)}`, 490, doc.y - 12, { width: 80, align: "right" });
    doc.moveDown(0.5);
    doc.text("CGST @ 9% :", sx, doc.y, { width: 170 })
       .text(`Rs.${cgstTotal.toFixed(2)}`, 490, doc.y - 12, { width: 80, align: "right" });
    doc.moveDown(0.5);
    doc.text("SGST @ 9% :", sx, doc.y, { width: 170 })
       .text(`Rs.${sgstTotal.toFixed(2)}`, 490, doc.y - 12, { width: 80, align: "right" });
    doc.moveDown(0.5);

    doc.rect(sx - 5, doc.y, 260, 24).fill(purple);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#fff")
       .text("Grand Total:", sx, doc.y + 6, { width: 130 })
       .text(`Rs.${grandTotal.toFixed(2)}`, 490, doc.y - 18, { width: 80, align: "right" });

    doc.moveDown(3);

    // ── Footer ──
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).strokeColor(purple).stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(8).fillColor("#888")
       .text("Thank you for shopping with FirstCry!", { align: "center" })
       .text("This is a computer-generated invoice and does not require a signature.", { align: "center" });

    doc.end();
  });
}


// ── Send Invoice Email via SendGrid ──────────────────────────────────────────
export async function sendInvoiceEmail(order, pdfBuffer) {
  const invoiceNo = String(order._id).slice(-6).toUpperCase();

  await sgMail.send({
    from:    process.env.SENDGRID_EMAIL,
    to:      order.email,
    subject: `GST Invoice #${invoiceNo} - Your FirstCry Order`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;
                  padding:30px;border:1px solid #eee;border-radius:10px;">
        <h2 style="color:#6a0dad;">Thank you for your order, ${order.fullName}!</h2>
        <p>Your order has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:8px;background:#f5f0ff;"><strong>Invoice No</strong></td>
            <td style="padding:8px;">#${invoiceNo}</td>
          </tr>
          <tr>
            <td style="padding:8px;background:#f5f0ff;"><strong>Payment</strong></td>
            <td style="padding:8px;">${order.payment?.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding:8px;background:#f5f0ff;"><strong>Grand Total</strong></td>
            <td style="padding:8px;color:#6a0dad;"><strong>Rs.${order.total}</strong></td>
          </tr>
        </table>
        <p>Your <strong>GST Invoice</strong> is attached to this email.</p>
        <p style="color:#888;font-size:12px;">For any queries, contact us at support@firstcry.com</p>
        <p>Team FirstCry</p>
      </div>
    `,
    attachments: [{
      filename:    `Invoice_${invoiceNo}.pdf`,
      content:     pdfBuffer.toString("base64"),
      type:        "application/pdf",
      disposition: "attachment"
    }]
  });

  console.log("✅ Invoice email sent to:", order.email);
}