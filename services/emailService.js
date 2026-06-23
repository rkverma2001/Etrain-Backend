const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const generateInvoicePdf = require("../utils/generateInvoicePdf");

/*
====================================================
SENDGRID CONFIG
====================================================
*/

let isConfigured = false;

/*
IMPORTANT:
Use ONLY verified sender email from SendGrid
Do NOT use unsafe fallback sender
*/
const senderEmail = process.env.EMAIL_USER;

try {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    isConfigured = true;
    console.log("✅ SendGrid configured for email sending");
  } else {
    console.warn(
      "⚠️ SENDGRID_API_KEY not found in environment variables. Email sending disabled.",
    );
  }
} catch (e) {
  console.warn("⚠️ SendGrid setup failed.");
  console.warn(e.message);
}

/*
====================================================
HELPER FUNCTIONS
====================================================
*/

/*
Safe course name helper
Fixes:
item.course.courseName undefined issue
*/
const getCourseName = (course) => {
  if (!course) return "Course";

  if (typeof course === "object" && course.courseName) {
    return course.courseName;
  }

  return "Course";
};

/*
Safe customer email helper

Priority:
1. user.email
2. fallback email from payment meta
*/
const getCustomerEmail = (user, fallbackEmail = "") => {
  return user?.email || fallbackEmail || "";
};

/*
Common SendGrid sender
*/
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    if (!isConfigured) {
      console.log("📧 Email skipped → SendGrid not configured");
      return;
    }

    if (!to) {
      console.log("❌ Email skipped → recipient email missing");
      return;
    }

    if (!senderEmail) {
      console.log("❌ Email skipped → sender email missing");
      return;
    }

    const msg = {
      to,
      from: senderEmail,
      cc: ["support@etrainindia.com"],
      subject,
      html,
      attachments,
    };

    console.log("========== SENDING EMAIL ==========");
    console.log("TO:", to);
    console.log("FROM:", senderEmail);
    console.log("SUBJECT:", subject);

    await sgMail.send(msg);

    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ EMAIL ERROR:");
    console.error(error.response?.body || error.message || error);
  }
};

/*
====================================================
PAYMENT SUCCESS EMAIL
====================================================
*/

const sendPaymentSuccessEmail = async (user, order, bill, paymentDetails) => {
  try {
    const customerEmail = getCustomerEmail(user, paymentDetails?.email);

    const itemsHtml = (order?.cart?.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding:10px; border:1px solid #ddd;">
            ${getCourseName(item.course)}
          </td>

          <td style="padding:10px; border:1px solid #ddd;">
            ${item.packageType || "-"}
          </td>

          <td style="padding:10px; border:1px solid #ddd;">
            ₹${Number(item.total || 0).toFixed(2)}
          </td>
        </tr>
      `,
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payment Successful</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, sans-serif;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f7fb; padding: 30px 0;"
  >
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table
          width="700"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 18px rgba(0,0,0,0.08);
          "
        >

          <!-- Header -->
          <!-- Header -->
<tr>
  <td
    style="
      background: linear-gradient(135deg, #0f9d58, #34a853);
      padding: 35px;
      text-align: center;
      color: #ffffff;
    "
  >
    <img
      src="https://etrain.blr1.cdn.digitaloceanspaces.com/logo.webp"
      alt="eTrainIndia"
      style="
        width: 180px;
        max-width: 100%;
        margin-bottom: 20px;
      "
    />

    <h1
      style="
        margin: 0;
        font-size: 30px;
        font-weight: 700;
      "
    >
      Payment Successful ✅
    </h1>

    <p
      style="
        margin-top: 10px;
        font-size: 15px;
        opacity: 0.95;
      "
    >
      Your transaction has been completed successfully
    </p>
  </td>
</tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">

              <p
                style="
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                "
              >
                Dear
                <strong>
                  ${user?.name || "Customer"}
                </strong>,
              </p>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #555;
                  margin-bottom: 30px;
                "
              >
                Thank you for your payment. We have successfully received your payment
and your order has been confirmed.

<br /><br />

Your official invoice PDF is attached with this email.
              </p>

              <!-- Payment Info Card -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background: #f8fafc;
                  border: 1px solid #e5e7eb;
                  border-radius: 10px;
                  margin-bottom: 30px;
                "
              >
                <tr>
                  <td style="padding: 25px;">

                    <h3
                      style="
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #111827;
                      "
                    >
                      Payment Details
                    </h3>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Payment ID:</strong>
                      ${paymentDetails?.paymentId || "N/A"}
                    </p>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Order ID:</strong>
                      ${order?._id || "N/A"}
                    </p>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Total Paid:</strong>
                      <span
                        style="
                          color: #0f9d58;
                          font-size: 18px;
                          font-weight: bold;
                        "
                      >
                        ₹${Number(order?.cart?.grandTotal || 0).toFixed(2)}
                      </span>
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Purchased Items -->
              <h3
                style="
                  margin-bottom: 20px;
                  color: #111827;
                  font-size: 20px;
                "
              >
                Purchased Items
              </h3>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  border-collapse: collapse;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                "
              >
                <thead>
                  <tr
                    style="
                      background: #111827;
                      color: #ffffff;
                    "
                  >
                    <th
                      align="left"
                      style="padding: 14px;"
                    >
                      Course
                    </th>

                    <th
                      align="left"
                      style="padding: 14px;"
                    >
                      Package
                    </th>

                    <th
                      align="right"
                      style="padding: 14px;"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Next Steps -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top: 35px;
                  background: #f9fafb;
                  border-left: 5px solid #0f9d58;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td style="padding: 25px;">
                    <h3
                      style="
                        margin: 0 0 15px 0;
                        color: #111827;
                      "
                    >
                      What Happens Next?
                    </h3>

                    <p style="margin: 8px 0; color: #4b5563;">
                      • You'll receive an email within 24 to 48 hours from our support team regarding your order.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <p
                style="
                  margin-top: 40px;
                  font-size: 15px;
                  color: #555;
                "
              >
                Thank you for choosing
                <strong>eTrainIndia</strong>.
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #6b7280;
                "
              >
                Need help? Contact us at
                <strong>${senderEmail}</strong>
              </p>

            </td>
          </tr>

          <!-- Bottom Footer -->
          <tr>
            <td
              style="
                background: #111827;
                padding: 20px;
                text-align: center;
                color: #d1d5db;
                font-size: 13px;
              "
            >
              © 2026 eTrainIndia. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

    const pdfBuffer = await generateInvoicePdf(bill, order, user);

    await sendEmail({
      to: customerEmail,

      subject: `Payment Successful - Order #${order?._id}`,

      html,

      attachments: [
        {
          filename: `Invoice-${order?._id}.pdf`,
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
  } catch (error) {
    console.error("Error in sendPaymentSuccessEmail:", error.message);
  }
};

/*
====================================================
BILL / INVOICE EMAIL
====================================================
*/

const sendBillEmail = async (user, bill, order, fallbackEmail = "") => {
  try {
    const customerEmail = getCustomerEmail(user, fallbackEmail);

    const itemsHtml = (bill?.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding:10px; border:1px solid #ddd;">
            ${getCourseName(item.course)}
          </td>

          <td style="padding:10px; border:1px solid #ddd;">
            ${item.quantity || 1}
          </td>

          <td style="padding:10px; border:1px solid #ddd;">
            ₹${Number(item.price || 0).toFixed(2)}
          </td>

          <td style="padding:10px; border:1px solid #ddd;">
            ₹${Number(item.total || 0).toFixed(2)}
          </td>
        </tr>
      `,
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, sans-serif;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f7fb; padding: 30px 0;"
  >
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table
          width="720"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 18px rgba(0,0,0,0.08);
          "
        >

          <!-- Header -->
          <tr>
            <td
              style="
                background: linear-gradient(135deg, #1f2937, #111827);
                padding: 35px;
                text-align: center;
                color: #ffffff;
              "
            >
              <h1
                style="
                  margin: 0;
                  font-size: 30px;
                  font-weight: 700;
                "
              >
                Invoice
              </h1>

              <p
                style="
                  margin-top: 10px;
                  font-size: 15px;
                  opacity: 0.9;
                "
              >
                Your payment invoice and purchase summary
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Customer Greeting -->
              <p
                style="
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                "
              >
                Hello
                <strong>
                  ${user?.name || "Customer"}
                </strong>,
              </p>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #555;
                  margin-bottom: 30px;
                "
              >
                Thank you for your purchase. Please find your invoice details
                below for your successful transaction.
              </p>

              <!-- Invoice Summary Card -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background: #f8fafc;
                  border: 1px solid #e5e7eb;
                  border-radius: 10px;
                  margin-bottom: 30px;
                "
              >
                <tr>
                  <td style="padding: 25px;">

                    <h3
                      style="
                        margin: 0 0 20px 0;
                        font-size: 20px;
                        color: #111827;
                      "
                    >
                      Invoice Details
                    </h3>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Invoice ID:</strong>
                      ${bill?._id || "N/A"}
                    </p>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Order ID:</strong>
                      ${order?._id || "N/A"}
                    </p>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Payment Status:</strong>
                      <span
                        style="
                          color: #0f9d58;
                          font-weight: bold;
                        "
                      >
                        ${bill?.paymentStatus || "Pending"}
                      </span>
                    </p>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Transaction ID:</strong>
                      ${bill?.transactionId || "N/A"}
                    </p>

                    <p style="margin: 10px 0; color: #374151;">
                      <strong>Customer Email:</strong>
                      ${customerEmail}
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Purchased Items -->
              <h3
                style="
                  margin-bottom: 20px;
                  color: #111827;
                  font-size: 20px;
                "
              >
                Purchased Items
              </h3>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  border-collapse: collapse;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                "
              >
                <thead>
                  <tr
                    style="
                      background: #111827;
                      color: #ffffff;
                    "
                  >
                    <th
                      align="left"
                      style="padding: 14px;"
                    >
                      Course
                    </th>

                    <th
                      align="center"
                      style="padding: 14px;"
                    >
                      Qty
                    </th>

                    <th
                      align="right"
                      style="padding: 14px;"
                    >
                      Price
                    </th>

                    <th
                      align="right"
                      style="padding: 14px;"
                    >
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Grand Total -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top: 30px;
                  background: #f9fafb;
                  border-left: 5px solid #2563eb;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td style="padding: 25px;">

                    <h3
                      style="
                        margin: 0 0 15px 0;
                        color: #111827;
                      "
                    >
                      Payment Summary
                    </h3>

                    <p
                      style="
                        margin: 0;
                        font-size: 18px;
                        color: #111827;
                      "
                    >
                      <strong>Grand Total:</strong>
                      <span
                        style="
                          color: #2563eb;
                          font-size: 22px;
                          font-weight: bold;
                        "
                      >
                        ₹${Number(bill?.grandTotal || 0).toFixed(2)}
                      </span>
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <p
                style="
                  margin-top: 40px;
                  font-size: 15px;
                  color: #555;
                "
              >
                Thank you for choosing
                <strong>EtrainIndia</strong>.
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #6b7280;
                "
              >
                Need help? Contact us at
                <strong>${senderEmail}</strong>
              </p>

            </td>
          </tr>

          <!-- Bottom Footer -->
          <tr>
            <td
              style="
                background: #111827;
                padding: 20px;
                text-align: center;
                color: #d1d5db;
                font-size: 13px;
              "
            >
              © 2026 EtrainIndia. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

    await sendEmail({
      to: customerEmail,
      cc: ["support@etrainindia.com"],
      subject: `Invoice - Order #${order?._id}`,
      html,
    });
  } catch (error) {
    console.error("Error in sendBillEmail:", error.message);
  }
};

module.exports = {
  sendPaymentSuccessEmail,
  sendBillEmail,
};
