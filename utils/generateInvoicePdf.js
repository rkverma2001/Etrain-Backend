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

      doc.on("error", reject);

      // =========================================================
      // HEADER
      // =========================================================

      doc.image(logoBuffer, 40, 20, {
        width: 150,
      });

      doc
        .fillColor("#008641")
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("TAX INVOICE", 40, 40, {
          width: 520,
          align: "right",
        });

      // =========================================================
      // COMPANY LEGAL DETAILS
      // =========================================================

      doc
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Etrain Education Private Limited", 300, 75, {
          width: 260,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(10)
        .text("GSTIN – 07AADCE8980H1ZA", 300, 91, {
          width: 260,
          align: "right",
        })
        .text("SAC Code – 998319", 300, 106, {
          width: 260,
          align: "right",
        })
        .text("1211, 12th Floor Hemkunt Chambers 89,", 300, 121, {
          width: 260,
          align: "right",
        })
        .text("Nehru Place, New Delhi – 110019 INDIA", 300, 136, {
          width: 260,
          align: "right",
        });

      // =========================================================
      // INVOICE + CUSTOMER DETAILS
      // =========================================================

      const sectionTop = 180;

      // ---------------- INVOICE DETAILS ----------------

      doc
        .fillColor("#008641")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Invoice Details", 40, sectionTop);

      const invoiceDate = bill?.createdAt
        ? new Date(bill.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

      const invoiceRows = [
        ["Invoice Date", invoiceDate],
        ["Invoice Number", bill?.invoiceNumber || "N/A"],
        ["Order Number", bill?.orderNumber || "N/A"],
        ["Transaction ID", bill?.transactionId || "N/A"],
        ["Payment Status", bill?.paymentStatus || "Paid"],
        ["Payment Method", bill?.paymentMethod || "Online"],
      ];

      let invoiceY = sectionTop + 25;

      invoiceRows.forEach(([label, value]) => {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#000000")
          .text(`${label}:`, 40, invoiceY, {
            width: 105,
          });

        doc.text(String(value), 145, invoiceY, {
          width: 150,
        });

        invoiceY += 16;
      });

      // ---------------- CUSTOMER DETAILS ----------------

      doc
        .fillColor("#008641")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Customer Details", 320, sectionTop);

      const customerRows = [
        ["Name", user?.name || order?.fullName || "Customer"],
        ["Email", user?.email || order?.email || ""],
        ["Mobile", order?.mobileNumber || user?.mobile || ""],
        ["City", user?.city || ""],
        ["State", user?.state || ""],
      ];

      let customerY = sectionTop + 25;

      customerRows.forEach(([label, value]) => {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#000000")
          .text(`${label}:`, 320, customerY, {
            width: 55,
          });

        doc.text(String(value), 375, customerY, {
          width: 185,
        });

        customerY += 16;
      });

      // =========================================================
      // ITEMS TABLE
      // =========================================================

      const tableTop = Math.max(invoiceY, customerY) + 25;

      // Table dimensions
      const tableX = 40;
      const tableWidth = 520;
      const headerHeight = 30;

      // Column positions
      const itemX = 50;
      const itemWidth = 250;

      const typeX = 305;
      const typeWidth = 75;

      const qtyX = 380;
      const qtyWidth = 55;

      const priceX = 435;
      const priceWidth = 115;

      // ---------------- TABLE HEADER ----------------

      doc.rect(tableX, tableTop, tableWidth, headerHeight).fill("#008641");

      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);

      doc.text("Item", itemX, tableTop + 10, {
        width: itemWidth,
        align: "left",
      });

      doc.text("Type", typeX, tableTop + 10, {
        width: typeWidth,
        align: "left",
      });

      doc.text("Qty", qtyX, tableTop + 10, {
        width: qtyWidth,
        align: "center",
      });

      doc.text("Price", priceX, tableTop + 10, {
        width: priceWidth,
        align: "right",
      });

      // ---------------- TABLE ITEMS ----------------

      let y = tableTop + 40;

      (bill?.items || []).forEach((item) => {
        const courseName =
          item?.course?.courseName ||
          item?.course?.title ||
          item?.courseName ||
          "Course";

        const packageType = item?.packageType || "";

        const version =
          typeof item?.version === "string" ? item.version.trim() : "";

        const qty = Number(item?.quantity || 1);

        const price = Number(item?.price || 0);

        // Calculate course name height
        const courseNameHeight = doc.heightOfString(courseName, {
          width: itemWidth,
          font: "Helvetica",
          fontSize: 10,
        });

        const versionHeight = version ? 15 : 0;

        const rowHeight = Math.max(28, courseNameHeight + versionHeight + 10);

        // ---------------- COURSE NAME ----------------

        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#000000")
          .text(courseName, itemX, y, {
            width: itemWidth,
            align: "left",
          });

        // ---------------- PACKAGE TYPE ----------------

        doc.text(packageType, typeX, y, {
          width: typeWidth,
          align: "left",
        });

        // ---------------- QUANTITY ----------------

        doc.text(String(qty), qtyX, y, {
          width: qtyWidth,
          align: "center",
        });

        // ---------------- PRICE ----------------

        doc.text(`Rs. ${price.toFixed(2)}`, priceX, y, {
          width: priceWidth,
          align: "right",
        });

        // ---------------- VERSION ----------------

        if (version) {
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#000000")
            .text(`Version: ${version}`, itemX, y + courseNameHeight + 2, {
              width: itemWidth,
              align: "left",
            });
        }

        // ---------------- ROW LINE ----------------

        y += rowHeight;

        doc
          .moveTo(tableX, y)
          .lineTo(tableX + tableWidth, y)
          .strokeColor("#e5e7eb")
          .stroke();

        y += 10;
      });

      // =========================================================
      // TOTAL SECTION
      // =========================================================

      y += 20;

      const priceBeforeDiscount = Number(bill?.subtotal || 0);

      const baseAmount = Number(priceBeforeDiscount.toFixed(2));

      const subtotal = Number((baseAmount / 1.18).toFixed(2));

      const gstAmount = Number((priceBeforeDiscount - subtotal).toFixed(2));

      const discount = Number(bill?.discount || 0);

      const grandTotal = Number((priceBeforeDiscount - discount).toFixed(2));

      // Coupon comes from populated Bill.coupon
      const couponCode = bill?.coupon?.code || bill?.couponCode || "";

      const hasCoupon = Boolean(couponCode);

      // =========================================================
      // TOTAL BOX
      // =========================================================

      const boxX = 300;
      const boxY = y;
      const boxWidth = 240;

      const boxHeight = hasCoupon ? 175 : 150;

      doc
        .roundedRect(boxX, boxY, boxWidth, boxHeight, 8)
        .strokeColor("#d1d5db")
        .stroke();

      // =========================================================
      // TOTAL BOX COLUMNS
      // =========================================================

      const labelX = boxX + 20;

      // Right value column
      const valueX = boxX + 115;

      const valueWidth = 105;

      // =========================================================
      // SUBTOTAL
      // =========================================================

      doc.font("Helvetica").fontSize(11).fillColor("#000000");

      doc.text("Subtotal", labelX, boxY + 15, {
        width: 100,
        align: "left",
      });

      doc.text(`Rs. ${subtotal.toFixed(2)}`, valueX, boxY + 15, {
        width: valueWidth,
        align: "right",
      });

      // =========================================================
      // GST
      // =========================================================

      doc.text("GST (18%)", labelX, boxY + 40, {
        width: 100,
        align: "left",
      });

      doc.text(`Rs. ${gstAmount.toFixed(2)}`, valueX, boxY + 40, {
        width: valueWidth,
        align: "right",
      });

      // =========================================================
      // PRICE BEFORE DISCOUNT
      // =========================================================

      doc.text("Price Before Discount", labelX, boxY + 65, {
        width: 125,
        align: "left",
      });

      doc.text(`Rs. ${priceBeforeDiscount.toFixed(2)}`, valueX, boxY + 65, {
        width: valueWidth,
        align: "right",
      });

      // =========================================================
      // DISCOUNT
      // =========================================================

      doc.text("Discount", labelX, boxY + 90, {
        width: 100,
        align: "left",
      });

      doc.text(`Rs. ${discount.toFixed(2)}`, valueX, boxY + 90, {
        width: valueWidth,
        align: "right",
      });

      // =========================================================
      // COUPON CODE
      // =========================================================

      if (hasCoupon) {
        doc.font("Helvetica").fontSize(10).fillColor("#000000");

        doc.text("Coupon Code", labelX, boxY + 115, {
          width: 100,
          align: "left",
        });

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(couponCode, valueX, boxY + 115, {
            width: valueWidth,
            align: "right",
          });
      }

      // =========================================================
      // GRAND TOTAL
      // =========================================================

      const grandTotalY = hasCoupon ? boxY + 145 : boxY + 120;

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#008641");

      doc.text("Grand Total", labelX, grandTotalY, {
        width: 100,
        align: "left",
      });

      doc.text(`Rs. ${grandTotal.toFixed(2)}`, valueX, grandTotalY, {
        width: valueWidth,
        align: "right",
      });

      // =========================================================
      // FOOTER
      // =========================================================

      doc
        .fillColor("#6b7280")
        .font("Helvetica")
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

      // =========================================================
      // END PDF
      // =========================================================

      doc.end();
    });
  } catch (error) {
    console.error("Invoice PDF Generation Error:", error);

    throw error;
  }
};

module.exports = generateInvoicePdf;
