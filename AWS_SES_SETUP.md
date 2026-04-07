# 📧 AWS SES Email Setup Guide

## Current Status

The email service is **integrated with AWS SES** and ready to use!

This means:
✅ All order and payment processing works
✅ Invoices are calculated and stored
✅ Backend doesn't crash if email fails
❌ Emails are NOT sent until AWS SES is configured

---

## ✅ To Enable Email Sending with AWS SES

### Step 1: Install AWS SDK

```bash
# Navigate to backend directory
cd backend

# Install AWS SES client
npm install @aws-sdk/client-ses --save
```

### Step 2: Set Up AWS SES

#### Option A: Using AWS Console (Recommended)

1. **Create AWS Account** (if not already done)
   - Go to: https://aws.amazon.com
   - Sign up or log in

2. **Navigate to SES Service**
   - Search for "Simple Email Service" in AWS Console
   - Click on SES

3. **Verify Email Address**
   - Go to "Verified identities" in SES
   - Click "Create identity"
   - Select "Email address"
   - Enter your sender email (e.g., `noreply@etrainindia.com`)
   - Click "Create identity"
   - Verify the email by clicking link in confirmation email

4. **Create IAM Access Keys**
   - Go to: https://console.aws.amazon.com/iam/
   - Click "Users" in left sidebar
   - Click your username
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Save the Access Key ID and Secret Access Key

#### Option B: Using AWS CLI

```bash
# Configure AWS credentials
aws configure

# Verify email address
aws ses verify-email-identity --email-address noreply@etrainindia.com --region us-east-1

# (Then verify in email confirmation sent to that address)

# Get credentials from ~/.aws/credentials file
cat ~/.aws/credentials
```

### Step 3: Update .env File

```bash
# Edit your .env file with AWS SES credentials:

AWS_ACCESS_KEY_ID=AKIA...your_access_key...
AWS_SECRET_ACCESS_KEY=...your_secret_key...
AWS_REGION=us-east-1
EMAIL_USER=noreply@etrainindia.com

# Other required variables:
PORT=8080
MONGODB_URI=mongodb://localhost:27017/etrainindia
JWT_SECRET=your_strong_secret_key_here
RAZORPAY_API_KEY=rzp_test_xxxxxxxxxxxxx
RAZORPAY_API_SECRET=your_razorpay_secret
SPRINGEDGE_API_KEY=your_springedge_key
FRONTEND_URL=http://localhost:3000
```

### Step 4: Request Production Access (Optional)

By default, AWS SES is in sandbox mode. To send emails to any address:

1. Go to AWS SES Console
2. Click "Request production access"
3. Fill the form with:
   - Use case description
   - Website URL
   - Primary email
4. AWS reviews and approves (usually within 24 hours)

**For sandbox mode**: You can only send to verified email addresses

### Step 5: Restart the Backend

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
- **From**: Your verified SES email
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

### 2. In AWS SES Sandbox Mode

If you only verified one email, use it for both sender and recipient:

```bash
# First verify your email in AWS SES
# Then use it as both sender and recipient for testing
```

### 3. Check Email Deliverability

View email sending statistics in AWS SES Console:
- Go to "Sending statistics"
- Monitor delivery rates
- Check bounce and complaint rates

---

## 🔍 Troubleshooting Email Issues

### Issue: "Credentials not configured"

**Solution**: 
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are in .env
- Check that they are correct (copy-paste from AWS Console)
- No extra spaces or quotes around values

### Issue: "Email address not verified"

**Solution**:
- Go to AWS SES Console
- Click "Verified identities"
- Verify the sender email
- Check email inbox for verification link
- Click confirmation link

### Issue: "Account in sandbox mode"

**Solutions**:
1. Verify recipient email addresses in SES
2. Only test emails to verified addresses
3. Request production access from AWS
4. Or add test email to verified identities

### Issue: "Emails not received (Not in spam either)"

**Possible causes**:
1. Email address not verified in SES
2. AWS SES account in sandbox mode
3. Recipient email not whitelisted for sandbox
4. AWS throttling (sending too many emails)

**Fix**:
```bash
# Check SES console
# Verify email: https://console.aws.amazon.com/ses/

# Check credentials:
# Make sure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct

# Check region:
# Ensure AWS_REGION matches where you created the SES identity
```

---

## 📋 AWS SES Checklist

For successful email sending, ensure:

- [ ] AWS account is created and accessible
- [ ] SES service is available in your region
- [ ] Sender email is verified in AWS SES
- [ ] AWS Access Key ID is correct (copy from IAM)
- [ ] AWS Secret Access Key is correct (copy from IAM)
- [ ] AWS_REGION matches SES identity region (us-east-1, etc.)
- [ ] EMAIL_USER in .env matches verified sender email
- [ ] AWS_ACCESS_KEY_ID in .env is set correctly
- [ ] AWS_SECRET_ACCESS_KEY in .env is set correctly
- [ ] .env file is saved
- [ ] Backend is restarted after .env changes
- [ ] No typos in credentials

---

## 📊 AWS SES Service Limits

### Default Quotas (Sandbox Mode)
- **Sending rate**: 1 email/second
- **Daily limit**: 200 emails/day
- **Recipients**: Only verified email addresses

### After Production Access Approval
- **Sending rate**: 14 emails/second (can increase)
- **Daily limit**: 50,000 emails/day (can increase)
- **Recipients**: Any email address

---

## 🔒 AWS SES Security Best Practices

1. **Never commit .env file to Git**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   ```

2. **Rotate credentials regularly**
   - Change IAM access keys every 90 days
   - Delete old access keys after rotation

3. **Use IAM roles in production**
   - Deploy with EC2 instance roles
   - Don't hardcode credentials in code

4. **Monitor SES activity**
   - Check sending statistics
   - Monitor bounce/complaint rates
   - Set up email notifications for issues

5. **Verify all sender addresses**
   - Only send from verified addresses
   - Use domain verification for better reputation

---

## 🚀 Production Deployment with AWS SES

### For High Volume (1000+ emails/day)

```bash
# Request production access
# Scale up SES sending rate in console
# Consider using email queue (Bull + Redis)
npm install bull redis
```

### With Email Queue (Recommended)

```javascript
// services/emailQueue.js
const Queue = require('bull');
const redis = require('redis');

const emailQueue = new Queue('emails', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

emailQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

### Environment Variables for Production

```env
# AWS SES
AWS_ACCESS_KEY_ID=your_production_key
AWS_SECRET_ACCESS_KEY=your_production_secret
AWS_REGION=us-east-1

# Email
EMAIL_USER=noreply@etrainindia.com

# Redis (if using email queue)
REDIS_HOST=redis.production.com
REDIS_PORT=6379
```

---

## 📧 Email Deliverability Tips

1. **Use DKIM/DMARC**
   - Set up in AWS SES
   - Improves email reputation
   - Reduces spam scores

2. **Monitor bounce rates**
   - Keep below 5%
   - Remove bounced addresses

3. **Avoid spam triggers**
   - Don't use excessive links
   - Use professional templates
   - Include unsubscribe option

4. **Test emails**
   - Use services like Mail-tester
   - Check spam score
   - Verify rendering in clients

---

## 📞 Support

If you need help:

1. **Check AWS SES Console**
   - Verified identities
   - Sending statistics
   - Bounce/complaint info

2. **Verify Setup**
   - Go to: https://console.aws.amazon.com/ses/
   - Check region matches AWS_REGION
   - Verify sender email is in list

3. **Check IAM Keys**
   - Go to: https://console.aws.amazon.com/iam/
   - View access keys
   - Verify they're active and correct

4. **Test manually**
   ```bash
   # Test AWS SES directly
   aws ses send-email \
     --from noreply@etrainindia.com \
     --to test@example.com \
     --subject "Test" \
     --text "Test message" \
     --region us-east-1
   ```

---

## ✅ Verification Checklist

After AWS SES setup:

- [ ] `npm install @aws-sdk/client-ses` completed
- [ ] .env file has AWS credentials
- [ ] Sender email is verified in AWS SES
- [ ] Backend starts without SES errors
- [ ] Create test order
- [ ] Receive Order Confirmation email
- [ ] Verify payment
- [ ] Receive Payment Success + Invoice emails
- [ ] Check email content is correct

---

## 🎁 Advantages of AWS SES

✅ More reliable than Gmail SMTP
✅ Better deliverability rates
✅ Detailed monitoring and statistics
✅ Scalable to thousands of emails
✅ Lower cost for volume
✅ DKIM/DMARC support
✅ No password exposure
✅ Production-ready

---

**Email service is now ready with AWS SES! 🎉**

Start sending emails:
```bash
npm install @aws-sdk/client-ses
# Configure .env with AWS credentials
npm start
```

*For more help, see API_DOCUMENTATION.md and README.md*
