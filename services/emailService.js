let SESClient;
let sesClient = null;

try {
  const { SESClient: AWS_SES, SendEmailCommand } = require("@aws-sdk/client-ses");
  SESClient = AWS_SES;
  require("dotenv").config();

  sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
} catch (e) {
  console.warn("⚠️  AWS SES or credentials not available. Email sending disabled.");
  console.warn("   To enable emails: npm install @aws-sdk/client-ses && set AWS credentials in .env");
}

const sendOrderConfirmationEmail = async (user, order, bill) => {
  try {
    if (!sesClient) {
      console.log("📧 [Email] Order confirmation email (AWS SES not configured)");
      return;
    }
    
    const { SendEmailCommand } = require("@aws-sdk/client-ses");
    const itemsHtml = order.cart.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.course.courseName}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.packageType}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${item.total.toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { background-color: white; padding: 20px; margin-top: 20px; }
          .order-details { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          .total-row { background-color: #ecf0f1; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #7f8c8d; }
          .success-badge { display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name || "Valued Customer"},</p>
            <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
            
            <span class="success-badge">✓ Order Confirmed</span>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>

            <h3>Ordered Items:</h3>
            <table>
              <thead>
                <tr style="background-color: #34495e; color: white;">
                  <th style="padding: 10px;">Course Name</th>
                  <th style="padding: 10px;">Package Type</th>
                  <th style="padding: 10px;">Qty</th>
                  <th style="padding: 10px;">Price</th>
                  <th style="padding: 10px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="4" style="padding: 10px; text-align: right;">Subtotal:</td>
                  <td style="padding: 10px;">₹${order.cart.subTotal.toFixed(2)}</td>
                </tr>
                ${
                  bill.discount > 0
                    ? `
                  <tr>
                    <td colspan="4" style="padding: 10px; text-align: right;">Discount:</td>
                    <td style="padding: 10px;">-₹${bill.discount.toFixed(2)}</td>
                  </tr>
                `
                    : ""
                }
                <tr>
                  <td colspan="4" style="padding: 10px; text-align: right;">Tax (18%):</td>
                  <td style="padding: 10px;">₹${order.cart.tax.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" style="padding: 10px; text-align: right; font-size: 16px;">Grand Total:</td>
                  <td style="padding: 10px; font-size: 16px;">₹${order.cart.grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 20px; padding: 15px; background-color: #ecf0f1; border-radius: 5px;">
              <h4>Next Steps:</h4>
              <p>1. Proceed to payment to complete your order</p>
              <p>2. Use Razorpay to securely pay</p>
              <p>3. You will receive a payment confirmation email once payment is successful</p>
            </div>

            <p style="margin-top: 30px;">If you have any questions, please contact us at support@etrainindia.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Etrain India. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { SendEmailCommand } = require("@aws-sdk/client-ses");
    
    const params = {
      Source: process.env.EMAIL_USER,
      Destination: { ToAddresses: [user.email] },
      Message: {
        Subject: { Data: `Order Confirmation - Order #${order._id}` },
        Body: { Html: { Data: htmlContent } }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};

const sendPaymentSuccessEmail = async (user, order, bill, paymentDetails) => {
  try {
    if (!transporter) {
      console.log("📧 [Email] Payment success email (transporter not configured)");
      return;
    }
    const itemsHtml = order.cart.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.course.courseName}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.packageType}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${item.total.toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
          .content { background-color: white; padding: 20px; margin-top: 20px; }
          .payment-details { margin: 20px 0; padding: 15px; background-color: #d5f4e6; border-left: 4px solid #27ae60; }
          table { width: 100%; border-collapse: collapse; }
          .total-row { background-color: #ecf0f1; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #7f8c8d; }
          .success-badge { display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Payment Successful</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name || "Valued Customer"},</p>
            <p>Your payment has been received successfully!</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="success-badge">Payment Confirmed</span>
            </div>

            <div class="payment-details">
              <h3 style="margin-top: 0;">Payment Information:</h3>
              <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Amount Paid:</strong> ₹${order.cart.grandTotal.toFixed(2)}</p>
              <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${paymentDetails.method || "Online"}</p>
            </div>

            <h3>Your Invoice:</h3>
            <table>
              <thead>
                <tr style="background-color: #34495e; color: white;">
                  <th style="padding: 10px;">Course Name</th>
                  <th style="padding: 10px;">Package Type</th>
                  <th style="padding: 10px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 10px; text-align: right;">Subtotal:</td>
                  <td style="padding: 10px;">₹${order.cart.subTotal.toFixed(2)}</td>
                </tr>
                ${
                  bill.discount > 0
                    ? `
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right;">Discount:</td>
                    <td style="padding: 10px;">-₹${bill.discount.toFixed(2)}</td>
                  </tr>
                `
                    : ""
                }
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right;">Tax (18%):</td>
                  <td style="padding: 10px;">₹${order.cart.tax.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="2" style="padding: 10px; text-align: right; font-size: 16px;">Total Paid:</td>
                  <td style="padding: 10px; font-size: 16px;">₹${order.cart.grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 20px; padding: 15px; background-color: #ecf0f1; border-radius: 5px;">
              <h4>What's Next?</h4>
              <p>1. Your courses are now active in your account</p>
              <p>2. Log in to access all course materials</p>
              <p>3. Download your invoice from your dashboard</p>
            </div>

            <p style="margin-top: 30px;">Thank you for choosing Etrain India! For support, contact us at support@etrainindia.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Etrain India. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { SendEmailCommand } = require("@aws-sdk/client-ses");
    
    const params = {
      Source: process.env.EMAIL_USER,
      Destination: { ToAddresses: [user.email] },
      Message: {
        Subject: { Data: `Payment Successful - Invoice for Order #${order._id}` },
        Body: { Html: { Data: htmlContent } }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`Payment success email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending payment success email:", error);
  }
};

const sendPaymentFailedEmail = async (user, order) => {
  try {
    if (!transporter) {
      console.log("📧 [Email] Payment failed email (transporter not configured)");
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { background-color: white; padding: 20px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #7f8c8d; }
          .action-btn { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name || "Valued Customer"},</p>
            <p>Unfortunately, your payment could not be processed. Please try again.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #fdeaea; border-left: 4px solid #e74c3c;">
              <h3 style="margin-top: 0;">Order Details:</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Amount:</strong> ₹${order.cart.grandTotal.toFixed(2)}</p>
            </div>

            <p><strong>Possible reasons for failure:</strong></p>
            <ul>
              <li>Insufficient funds</li>
              <li>Invalid card details</li>
              <li>Card declined by bank</li>
              <li>Network connection issue</li>
            </ul>

            <div style="margin-top: 20px; padding: 15px; background-color: #ecf0f1; border-radius: 5px;">
              <h4>What to do next:</h4>
              <p>1. Please try a different payment method</p>
              <p>2. Verify your card/account details</p>
              <p>3. Contact your bank if the issue persists</p>
              <p>4. Your items remain in your cart for retry</p>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "https://etrainindia.com"}/payment/${order._id}" class="action-btn">Retry Payment</a>
            </p>

            <p style="margin-top: 30px;">Need help? Contact us at support@etrainindia.com or call our customer support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Etrain India. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { SendEmailCommand } = require("@aws-sdk/client-ses");
    
    const params = {
      Source: process.env.EMAIL_USER,
      Destination: { ToAddresses: [user.email] },
      Message: {
        Subject: { Data: `Payment Failed - Order #${order._id}` },
        Body: { Html: { Data: htmlContent } }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`Payment failed email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending payment failed email:", error);
  }
};

const sendBillEmail = async (user, bill, order) => {
  try {
    if (!transporter) {
      console.log("📧 [Email] Bill/Invoice email (transporter not configured)");
      return;
    }
    const itemsHtml = bill.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.course.courseName || item.course}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">₹${item.total.toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .invoice-header { display: flex; justify-content: space-between; padding: 20px 0; border-bottom: 2px solid #34495e; }
          .content { background-color: white; padding: 20px; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total-row { background-color: #ecf0f1; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #7f8c8d; }
          .bill-number { font-weight: bold; color: #2c3e50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice</h1>
          </div>
          <div class="content">
            <div class="invoice-header">
              <div>
                <p><strong>Invoice #:</strong> <span class="bill-number">${bill._id}</span></p>
                <p><strong>Invoice Date:</strong> ${new Date(bill.billDate).toLocaleDateString()}</p>
              </div>
              <div style="text-align: right;">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Payment Status:</strong> <span style="color: ${bill.paymentStatus === "Paid" ? "#27ae60" : "#e74c3c"};">${bill.paymentStatus}</span></p>
              </div>
            </div>

            <div style="margin: 20px 0; padding: 15px; background-color: #ecf0f1; border-radius: 5px;">
              <h4 style="margin-top: 0;">Bill To:</h4>
              <p><strong>${user.name || "Customer"}</strong></p>
              <p>Email: ${user.email}</p>
              <p>Mobile: ${user.mobile}</p>
              ${user.city ? `<p>City: ${user.city}</p>` : ""}
              ${user.state ? `<p>State: ${user.state}</p>` : ""}
            </div>

            <h3>Items Purchased:</h3>
            <table>
              <thead>
                <tr style="background-color: #34495e; color: white;">
                  <th style="padding: 10px; text-align: left;">Course Name</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Unit Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table style="width: 50%; margin-left: auto;">
              <tr>
                <td style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;">₹${bill.subtotal.toFixed(2)}</td>
              </tr>
              ${
                bill.discount > 0
                  ? `
              <tr>
                <td style="padding: 10px; text-align: right;"><strong>Discount:</strong></td>
                <td style="padding: 10px; text-align: right;">-₹${bill.discount.toFixed(2)}</td>
              </tr>
              `
                  : ""
              }
              <tr>
                <td style="padding: 10px; text-align: right;"><strong>Tax (18%):</strong></td>
                <td style="padding: 10px; text-align: right;">₹${bill.tax.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td style="padding: 10px; text-align: right; font-size: 16px;"><strong>Grand Total:</strong></td>
                <td style="padding: 10px; text-align: right; font-size: 16px;">₹${bill.grandTotal.toFixed(2)}</td>
              </tr>
            </table>

            <div style="margin-top: 30px; padding: 15px; background-color: #ecf0f1; border-radius: 5px; font-size: 12px;">
              <p><strong>Payment Method:</strong> ${bill.paymentMethod}</p>
              <p><strong>Transaction ID:</strong> ${bill.transactionId || "N/A"}</p>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">
              This is an automatically generated invoice. Thank you for your purchase!
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Etrain India. All rights reserved.</p>
            <p>Support: support@etrainindia.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { SendEmailCommand } = require("@aws-sdk/client-ses");
    
    const params = {
      Source: process.env.EMAIL_USER,
      Destination: { ToAddresses: [user.email] },
      Message: {
        Subject: { Data: `Invoice - Etrain India (Invoice #${bill._id})` },
        Body: { Html: { Data: htmlContent } }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`Bill email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending bill email:", error);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendBillEmail,
};
