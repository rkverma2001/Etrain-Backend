const PDFDocument = require("pdfkit");
const axios = require("axios");

const LOGO_URL =
  "https://etrain.blr1.cdn.digitaloceanspaces.com/etrainlogo.png";

const generateInvoicePdf = async (bill, order, user) => {
  try {
    const logoResponse = await axios.get(LOGO_URL, {
      responseType: "arraybuffer",
    });

    const logoBuffer = Buffer.from(logoResponse.data);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));

      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      /*
       * HEADER
       */

      doc.image(logoBuffer, 40, 20, {
        width: 150,
      });

      doc.fillColor("#008641").fontSize(24).text("TAX INVOICE", 0, 40, {
        align: "right",
      });

      /*
       * COMPANY LEGAL DETAILS
       */

      doc
        .fillColor("#000")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Etrain Education Private Limited", 260, 75, {
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(10)
        .text("GSTIN – 07AADCE8980H1ZA", {
          align: "right",
        })
        .text("SAC Code – 998319", {
          align: "right",
        })
        .text("1211, 12th Floor Hemkunt Chambers 89,", {
          align: "right",
        })
        .text("Nehru Place, New Delhi – 110019 INDIA", {
          align: "right",
        });

      doc.moveDown(4);

      /*
       * INVOICE + CUSTOMER SECTION
       */

      const startY = doc.y;

      doc.fontSize(14).fillColor("#008641").text("Invoice Details", 40, startY);

      doc
        .fillColor("#000")
        .fontSize(10)

        .text(
          `Invoice Date:         ${
            bill?.createdAt
              ? new Date(bill.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
          }`,
        )

        .moveDown(0.5);

      doc
        .fillColor("#000")
        .fontSize(10)
        .text(`Invoice Number:    ${bill?._id || "N/A"}`)
        .text(`Order Number:      ${order?._id || "N/A"}`)
        .text(`Transaction ID:      ${bill?.transactionId || "N/A"}`)
        .text(`Payment Status:    ${bill?.paymentStatus || "Paid"}`)
        .text(`Payment Method:  ${bill?.paymentMethod || "Online"}`);

      doc
        .fillColor("#008641")
        .fontSize(14)
        .text("Customer Details", 320, startY);

      doc
        .fillColor("#000")
        .fontSize(10)
        .text(`Name: ${user?.name || order?.fullName || "Customer"}`, 320)
        .text(`Email: ${user?.email || order?.email || ""}`, 320)
        .text(`Mobile: ${order?.mobileNumber || user?.mobile || ""}`, 320)
        .text(`City: ${user?.city || user?.city || ""}`, 320)
        .text(`State: ${user?.state || user?.state || ""}`, 320);

      doc.moveDown(3);

      /*
       * ITEMS TABLE HEADER
       */

      const tableTop = doc.y + 20;

      doc.rect(40, tableTop, 520, 30).fill("#008641");

      doc.fillColor("#fff");

      doc.text("Item", 50, tableTop + 10);

      doc.text("Type", 320, tableTop + 10);

      doc.text("Qty", 390, tableTop + 10);

      doc.text("Price", 470, tableTop + 10);

      doc.fillColor("#000");

      let y = tableTop + 40;

      /*
       * ITEMS
       */

      (bill?.items || []).forEach((item) => {
        const courseName =
          item?.course?.courseName ||
          item?.course?.title ||
          item?.courseName ||
          "Course";

        const packageType = item?.packageType || "";

        const qty = item?.quantity || 1;

        const price = Number(item?.price || 0);

        doc.text(courseName, 50, y, {
          width: 240,
        });

        doc.text(packageType, 320, y);

        doc.text(String(qty), 390, y);

        doc.text(`Rs. ${price.toFixed(2)}`, 470, y);

        y += 28;

        doc.moveTo(40, y).lineTo(560, y).strokeColor("#e5e7eb").stroke();

        y += 10;
      });

      /*
       * TOTAL SECTION
       */

      y += 20;

      const priceBeforeDiscount = Number(bill?.subtotal || bill?.grandTotal || 0);

      const baseAmount = Number(
        (priceBeforeDiscount + (bill?.discount || 0)).toFixed(2),
      );

      const subtotal = Number((baseAmount / 1.18).toFixed(2));

      const discount = Number(bill?.discount || 0);

      const grandTotal = Number((priceBeforeDiscount - discount).toFixed(2));

      doc.roundedRect(300, y, 240, 150, 8).strokeColor("#d1d5db").stroke();

      doc.fontSize(11).fillColor("#000");

      doc.text("Subtotal", 320, y + 15);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, 470, y + 15);

      doc.text("GST (18%)", 320, y + 40);
      doc.text(
        `Rs. ${(priceBeforeDiscount - subtotal).toFixed(2)}`,
        470,
        y + 40,
      );

      doc.text("Price Before Discount", 320, y + 65);
      doc.text(`Rs. ${priceBeforeDiscount.toFixed(2)}`, 470, y + 65);

      doc.text("Discount", 320, y + 90);
      doc.text(`Rs. ${discount.toFixed(2)}`, 470, y + 90);

      doc.fontSize(11).font("Helvetica-Bold").fillColor("#008641");

      doc.text("Grand Total", 320, y + 120);
      doc.text(`Rs. ${grandTotal.toFixed(2)}`, 470, y + 120);

      /*
       * FOOTER
       */

      doc
        .fillColor("#6b7280")
        .fontSize(10)
        .text("Thank you for choosing etrainIndia.", 40, 730, {
          align: "center",
          width: 520,
        });

      doc.text(
        "This is a computer-generated invoice and does not require a signature.",
        40,
        745,
        {
          align: "center",
          width: 520,
        },
      );

      doc.text("support@etrainindia.com | www.etrainindia.com", 40, 760, {
        align: "center",
        width: 520,
      });

      doc.end();
    });
  } catch (error) {
    console.error("Invoice PDF Generation Error:", error);
    throw error;
  }
};

module.exports = generateInvoicePdf;
