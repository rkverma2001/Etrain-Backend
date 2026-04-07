# 📧 Email Service Setup Guide

## Current Status

The email service is **integrated and ready**, but currently **running in demo mode** without nodemailer installed.

This means:
✅ All order and payment processing works
✅ Invoices are calculated and stored
✅ Backend doesn't crash if email fails
❌ Emails are NOT actually being sent (logged as "Email transporter not configured")

---

## ✅ To Enable Email Sending

### Step 1: Install Nodemailer

```bash
# Navigate to backend directory
cd backend

# Install nodemailer
npm install nodemailer --save
```

### Step 2: Get Gmail App Password

**Option A: Use Gmail App Password (Recommended for Production)**

1. Go to your Gmail account: https://myaccount.google.com
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification" if not enabled
4. Go to https://myaccount.google.com/apppasswords
5. Select:
   - App: `Mail`
   - Device: `Windows Computer` (or your device)
6. Click "Generate"
7. Copy the 16-character password shown

**Option B: Enable Less Secure Apps (For Development Only)**

1. Go to: https://myaccount.google.com/lesssecureapps
2. Enable "Allow less secure apps"
3. Use your regular Gmail password in `.env`

### Step 3: Update .env File

```bash
# Edit your .env file with Gmail credentials:

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char app password

# Other required variables:
JWT_SECRET=your_strong_secret_key_here
MONGODB_URI=mongodb://localhost:27017/etrainindia
RAZORPAY_API_KEY=rzp_test_xxxxxxxxxxxxx
RAZORPAY_API_SECRET=your_razorpay_secret
SPRINGEDGE_API_KEY=your_springedge_key
FRONTEND_URL=http://localhost:3000
```

### Step 4: Restart the Backend

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm start
```

You should see:
```
[nodemon] starting `node index.js`
Server is up and running on port 8080
Connected to MongoDB
```

**No warning about email service** = Emails are now enabled! ✅

---

## 📧 Emails Will Be Sent For

### 1. Order Creation
- **Sent to**: Customer's email
- **When**: Immediately after order is created
- **Contains**: Order details, items, pricing

### 2. Payment Success
- **Sent to**: Customer's email
- **When**: After successful payment verification
- **Contains**: Payment confirmation, invoice preview

### 3. Invoice/Bill
- **Sent to**: Customer's email
- **When**: Immediately after payment success
- **Contains**: Full professional invoice

### 4. Payment Failed
- **Sent to**: Customer's email
- **When**: If payment verification fails
- **Contains**: Failure notification, retry link

---

## 🧪 Test Email Sending

### 1. Create a test order and payment

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"919876543210","otp":"123456"}' | jq -r '.token')

# Create order
curl -X POST http://localhost:8080/api/v1/order/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod":"Card"}' > order.json

# You should receive email #1: Order Confirmation Email
# (Check your inbox in ~1-2 seconds)
```

### 2. Verify payment

```bash
# Get order ID from previous response
ORDER_ID=$(jq -r '.razorpayOrder.id' order.json)

# Verify payment (simulate successful payment)
curl -X POST http://localhost:8080/api/v1/payment/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id":"'$ORDER_ID'",
    "razorpay_payment_id":"pay_test_success",
    "razorpay_signature":"test_signature"
  }'

# You should receive emails #2 & #3:
# - Payment Success Email
# - Invoice/Bill Email
# (Check your inbox in ~1-2 seconds)
```

---

## 🔍 Troubleshooting Email Issues

### Issue: "Invalid login. The user you are trying to authenticate to does not exist."

**Solution**: 
- You're using a regular Gmail password instead of App Password
- Generate an App Password: https://myaccount.google.com/apppasswords
- Make sure you enabled 2-Factor Authentication first

### Issue: "Invalid Credentials / 535 5.7.8 Username and password not accepted"

**Solution**:
- Double-check EMAIL_USER and EMAIL_PASSWORD in .env
- Copy-paste directly from Google instead of typing
- Make sure there are no extra spaces

### Issue: "Less secure app access has been disabled"

**Solution**:
- Use App Password instead (recommended)
- Or enable: https://myaccount.google.com/lesssecureapps

### Issue: Emails not received (Not in spam either)

**Possible causes**:
1. Check if server logs show "Email sent successfully"
2. Verify EMAIL_USER is a valid Gmail account
3. Check if Gmail is blocking the login attempt
4. Look for "suspicious activity" alert from Google

**Fix**:
```bash
# Clear .env and start fresh
# Make sure you use app_password, not regular password
EMAIL_USER=your_real_gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # This from apppasswords

# Restart server
npm start
```

---

## 📋 Gmail Account Checklist

For successful email sending, ensure:

- [ ] Gmail account is accessible
- [ ] 2-Factor Authentication is ENABLED
- [ ] App Password is generated (16 characters)
- [ ] App Password is copied correctly (no extra spaces)
- [ ] EMAIL_USER in .env matches your Gmail
- [ ] EMAIL_PASSWORD in .env is the App Password (not login password)
- [ ] .env file is saved
- [ ] Backend is restarted after .env changes
- [ ] No typos in EMAIL_USER or EMAIL_PASSWORD

---

## 📊 Email Service Architecture

```
Order Created
    ↓
Backend generates Order+Bill
    ↓
Email Service checks if transporter available
    ├─ YES: Send Email via Gmail SMTP
    │   ↓
    │ Email Queue (if configured)
    │   ↓
    │ Gmail Sends Email
    │   ↓
    │ ✅ Email in customer inbox (1-2 seconds)
    │
    └─ NO: Log warning, continue
        (Graceful degradation)
```

---

## 🔒 Email Security Best Practices

1. **Never commit .env file to Git**
   ```bash
   # Add to .gitignore
   .env
   ```

2. **Use App Passwords instead of main password**
   - More secure
   - Can be regenerated if compromised
   - Doesn't expose main account

3. **Rotate credentials regularly**
   - Change App Password every 3-6 months
   - Monitor for suspicious activity

4. **Review Gmail Security Settings**
   - https://myaccount.google.com/security-checkup
   - https://myaccount.google.com/device-activity

---

## 🚀 Production Email Setup

For production with high volume:

### Option 1: SendGrid
```bash
npm install @sendgrid/mail
```
- Better uptime
- Higher delivery rates
- Better tracking

### Option 2: Mailgun
```bash
npm install mailgun.js
```
- Reliable delivery
- Detailed logging
- API-based

### Option 3: AWS SES
```bash
npm install @aws-sdk/client-sesv2
```
- Enterprise-grade
- Cost-effective at scale
- Full audit trails

### Option 4: Email Queue (RabbitMQ + Bull)
```bash
npm install bull
npm install redis
```
- Handles retries
- Prevents email flood
- Better reliability

---

## 📞 Support

If you need help:

1. **Check the logs**:
   ```bash
   npm start
   ```
   Look for email-related messages

2. **Verify Gmail setup**:
   - Go to https://myaccount.google.com
   - Check Security settings
   - Verify App Password is correct

3. **Test manually**:
   ```bash
   # Send test email from Node.js
   node -e "
   const nodemailer = require('nodemailer');
   const t = nodemailer.createTransport({
     service: 'gmail',
     auth: { user: 'your@gmail.com', pass: 'xxxx' }
   });
   t.sendMail({
     from: 'your@gmail.com',
     to: 'test@exam ple.com',
     subject: 'Test',
     text: 'Test'
   }).then(console.log).catch(console.error);
   "
   ```

---

## ✅ Verification Checklist

After email setup, run through:

- [ ] `npm install nodemailer` completed successfully
- [ ] .env file has EMAIL_USER and EMAIL_PASSWORD
- [ ] Backend starts without email errors
- [ ] Create test order
- [ ] Receive Order Confirmation email
- [ ] Verify payment
- [ ] Receive Payment Success + Invoice emails
- [ ] Check email content is correct

---

## 📧 Email Templates

All emails use professional HTML templates with:
- Company branding (Etrain India color scheme)
- Responsive design (mobile-friendly)
- Itemized tables
- Color-coded status (green for success, red for failed)
- Next action items
- Contact information

Customization:
- Edit templates in `services/emailService.js`
- Add company logo (update HTML with logo URL)
- Change colors to match brand
- Add custom footer text

---

**Email service is now ready to use! 🎉**

Start sending emails:
```bash
npm install nodemailer
npm start
```

*For more help, see API_DOCUMENTATION.md and README.md*
