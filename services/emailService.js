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
      bcc: [
        "support@etrainindia.com",
        "sagar.verma@etrainindia.com",
        "harsh.chhabra@etrainindia.com",
        "rahul.bedi@etrainindia.com",
      ],
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
            Rs ${Number(item.total || 0).toFixed(2)}
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

          <tr>

            <td
              style="
                background: #111827;
                padding: 35px;
                text-align: center;
                color: #d1d5db;
              "
            >

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

                <br />
                <br />

                Your invoice is attached with this email.

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


                    <p
                      style="
                        margin: 10px 0;
                        color: #374151;
                      "
                    >

                      <strong>Payment ID:</strong>

                      ${paymentDetails?.paymentId || "N/A"}

                    </p>


                    <p
                      style="
                        margin: 10px 0;
                        color: #374151;
                      "
                    >

                      <strong>Order Number:</strong>

                      ${bill?.orderNumber || "N/A"}

                    </p>


                    <p
                      style="
                        margin: 10px 0;
                        color: #374151;
                      "
                    >

                      <strong>Total Paid:</strong>

                      <span
                        style="
                          color: #0f9d58;
                          font-size: 18px;
                          font-weight: bold;
                        "
                      >
                        Rs ${Number(order?.cart?.grandTotal || 0).toFixed(2)}
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
                      Item
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

                  ${(order?.cart?.items || [])
                    .map((item) => {
                      const courseName =
                        item?.course?.courseName ||
                        item?.course?.title ||
                        item?.courseName ||
                        "Course";

                      const packageType = item?.packageType || "N/A";

                      const quantity = Number(item?.quantity || 1);

                      const version =
                        typeof item?.version === "string"
                          ? item.version.trim()
                          : "";

                      const price = Number(item?.price || 0);

                      const total = Number(item?.total ?? price * quantity);

                      return `

                          <tr>

                            <!-- Item -->

                            <td
                              style="
                                padding: 14px;
                                border-bottom: 1px solid #e5e7eb;
                                color: #374151;
                                vertical-align: top;
                              "
                            >

                              <strong>
                                ${courseName}
                              </strong>

                              ${
                                version
                                  ? `
                                    <br />

                                    <span
                                      style="
                                        font-size: 12px;
                                        color: #6b7280;
                                      "
                                    >
                                      Version: ${version}
                                    </span>
                                  `
                                  : ""
                              }

                            </td>


                            <!-- Package + Quantity -->

                            <td
                              style="
                                padding: 14px;
                                border-bottom: 1px solid #e5e7eb;
                                color: #374151;
                                vertical-align: top;
                              "
                            >

                              ${packageType}

                              <br />

                              <span
                                style="
                                  font-size: 12px;
                                  color: #6b7280;
                                "
                              >
                                Qty: ${quantity}
                              </span>

                            </td>


                            <!-- Amount -->

                            <td
                              align="right"
                              style="
                                padding: 14px;
                                border-bottom: 1px solid #e5e7eb;
                                color: #374151;
                                vertical-align: top;
                                white-space: nowrap;
                              "
                            >

                              Rs ${total.toFixed(2)}

                            </td>

                          </tr>

                        `;
                    })
                    .join("")}

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


                    <p
                      style="
                        margin: 8px 0;
                        color: #4b5563;
                      "
                    >
                      • This is a digital product. You will receive an email within 24 to 48 hours from our support team regarding your order.
                    </p>


                    <p
                      style="
                        margin: 8px 0;
                        color: #4b5563;
                      "
                    >
                      • Kindly contact us on support@etrainindia.com should you have any queries.
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

                <strong>etrainIndia</strong>.

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

              © 2026 etrainIndia. All rights reserved.

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

      subject: `Payment Successful - Order #${bill?.orderNumber}`,

      html,

      attachments: [
        {
          filename: `Invoice-${bill?.invoiceNumber}.pdf`,
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

const sendContactEmail = async (contactData) => {
  try {
    const { name, email, phone, message } = contactData;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const formattedDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>

    <body style="margin:0;padding:30px;background:#f4f6f9;font-family:Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">

            <table width="700" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">

              <tr>
                <td
                  style="background:#0b8841;color:#ffffff;padding:30px;text-align:center;">
                  <h1 style="margin:0;">New Contact Form Enquiry</h1>
                  <p style="margin-top:10px;">
                    A new enquiry has been received from the website.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:35px;">

                  <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">

                    <tr>
                      <td width="180"><strong>Name</strong></td>
                      <td>${name}</td>
                    </tr>

                    <tr>
                      <td><strong>Email</strong></td>
                      <td>${email}</td>
                    </tr>

                    <tr>
                      <td><strong>Phone</strong></td>
                      <td>${phone}</td>
                    </tr>

                    <tr>
                      <td valign="top"><strong>Message</strong></td>
                      <td>${message}</td>
                    </tr>

                    <tr>
                      <td><strong>Date</strong></td>
                      <td>${formattedDate}</td>
                    </tr>

                  </table>

                  <hr style="margin:30px 0;">

                  <p style="color:#666;">
                    This enquiry was submitted through the
                    <strong>etrainIndia Contact Form</strong>.
                  </p>

                </td>
              </tr>

              <tr>
                <td
                  style="background:#111827;color:#ffffff;text-align:center;padding:20px;">
                  © ${new Date().getFullYear()} etrainIndia
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
    `;

    const msg = {
      to: "gaurav.kapoor@etrainindia.com",
      from: process.env.EMAIL_USER, // Verified sender
      subject: `New Contact Form Enquiry - ${name}`,
      html,
    };

    await sgMail.send(msg);

    console.log("✅ Contact enquiry email sent successfully.");

    return true;
  } catch (error) {
    console.error("❌ Contact Email Error:");
    console.error(error.response?.body || error.message);

    return false;
  }
};

const sendPartnerEmail = async (data) => {
  try {
    const { name, organisation, email, phone, city, state, message } = data;
    const formattedDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Partnership Enquiry</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="720" cellpadding="0" cellspacing="0" border="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:#0b8841;padding:45px 40px;">

              <h1 style="
                  margin:0;
                  color:#ffffff;
                  font-size:32px;
                  font-weight:700;
                ">
                New Partnership Enquiry
              </h1>

              <p style="
                  margin:15px 0 0;
                  color:#e6f6ec;
                  font-size:16px;
                  line-height:1.6;
                ">
                A new partnership request has been submitted through the
                etrainIndia website.
              </p>

            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:40px 45px 20px;">

              <h2 style="
                  margin:0;
                  color:#111827;
                  font-size:24px;
                  font-weight:700;
                ">
                Partnership Information
              </h2>

              <p style="
                  margin:12px 0 0;
                  color:#6b7280;
                  line-height:1.8;
                  font-size:15px;
                ">
                Please find below the complete details submitted by the
                prospective partner.
              </p>

            </td>
          </tr>

          <!-- Details -->

          <tr>
            <td style="padding:0 45px 30px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

                <tr>
                  <td style="
                    width:220px;
                    padding:18px;
                    background:#f9fafb;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:600;
                    color:#374151;
                  ">
                    Full Name
                  </td>

                  <td style="
                    padding:18px;
                    border-bottom:1px solid #e5e7eb;
                    color:#111827;
                  ">
                    ${name}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:18px;
                    background:#f9fafb;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:600;
                  ">
                    Organisation
                  </td>

                  <td style="
                    padding:18px;
                    border-bottom:1px solid #e5e7eb;
                  ">
                    ${organisation}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:18px;
                    background:#f9fafb;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:600;
                  ">
                    Email Address
                  </td>

                  <td style="
                    padding:18px;
                    border-bottom:1px solid #e5e7eb;
                  ">
                    <a href="mailto:${email}"
                      style="color:#0b8841;text-decoration:none;">
                      ${email}
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:18px;
                    background:#f9fafb;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:600;
                  ">
                    Phone Number
                  </td>

                  <td style="
                    padding:18px;
                    border-bottom:1px solid #e5e7eb;
                  ">
                    <a href="tel:${phone}"
                      style="color:#111827;text-decoration:none;">
                      ${phone}
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:18px;
                    background:#f9fafb;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:600;
                  ">
                    City
                  </td>

                  <td style="
                    padding:18px;
                    border-bottom:1px solid #e5e7eb;
                  ">
                    ${city}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:18px;
                    background:#f9fafb;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:600;
                  ">
                    State
                  </td>

                  <td style="
                    padding:18px;
                    border-bottom:1px solid #e5e7eb;
                  ">
                    ${state}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:18px;
                    background:#f9fafb;
                    vertical-align:top;
                    font-weight:600;
                  ">
                    Partnership Requirements
                  </td>

                  <td style="
                    padding:18px;
                    color:#374151;
                    line-height:1.8;
                    white-space:pre-line;
                  ">
                    ${message}
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Submission Details -->

          <tr>
            <td style="padding:0 45px 40px;">

              <table width="100%" cellpadding="0" cellspacing="0"
                style="
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:12px;
              ">

                <tr>
                  <td style="padding:25px;">

                    <h3 style="
                        margin:0 0 15px;
                        color:#111827;
                        font-size:20px;
                      ">
                      Submission Details
                    </h3>

                    <table width="100%">

                      <tr>
                        <td style="
                          padding:8px 0;
                          color:#6b7280;
                          width:180px;
                        ">
                          Submitted On
                        </td>

                        <td style="
                          padding:8px 0;
                          color:#111827;
                          font-weight:600;
                        ">
                          ${formattedDate}
                        </td>
                      </tr>

                      <tr>
                        <td style="
                          padding:8px 0;
                          color:#6b7280;
                        ">
                          Source
                        </td>

                        <td style="
                          padding:8px 0;
                          color:#111827;
                          font-weight:600;
                        ">
                          etrainIndia Partner With Us Page
                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Action -->

          <tr>
            <td style="padding:0 45px 45px;">

              <table width="100%" cellpadding="0" cellspacing="0"
                style="
                background:#effaf3;
                border-left:5px solid #0b8841;
                border-radius:12px;
              ">

                <tr>
                  <td style="padding:28px;">

                    <h3 style="
                        margin:0;
                        color:#0b8841;
                        font-size:20px;
                      ">
                      Recommended Action
                    </h3>

                    <p style="
                        margin:15px 0 0;
                        color:#4b5563;
                        line-height:1.9;
                        font-size:15px;
                      ">
                      Please review this enquiry and contact the organisation
                      within the next 24 hours. Discuss partnership
                      opportunities, provide relevant documentation, and guide
                      them through the onboarding process.
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Footer -->

          <tr>
            <td align="center"
              style="
              background:#111827;
              padding:35px;
            ">

              <h2 style="
                  margin:0;
                  color:#ffffff;
                  font-size:22px;
                ">
                etrainIndia
              </h2>

              <p style="
                  margin:15px 0 0;
                  color:#d1d5db;
                  font-size:14px;
                  line-height:1.8;
                ">
                This email was automatically generated from the
                <strong>Partner With Us</strong> form submitted on the
                etrainIndia website.
              </p>

              <p style="
                  margin-top:18px;
                  color:#9ca3af;
                  font-size:13px;
                ">
                © ${new Date().getFullYear()} etrainIndia. All Rights Reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>

</html>
`;

    await sgMail.send({
      to: "gaurav.kapoor@etrainindia.com",
      from: process.env.EMAIL_USER,
      subject: `New Partnership Request - ${organisation}`,
      html,
    });

    return true;
  } catch (error) {
    console.error(error.response?.body || error.message);
    return false;
  }
};

module.exports = {
  sendPaymentSuccessEmail,
  sendContactEmail,
  sendPartnerEmail,
};
