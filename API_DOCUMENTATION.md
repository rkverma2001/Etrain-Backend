# Etrain India Backend - Complete API Documentation

## Table of Contents
1. [Setup & Installation](#setup--installation)
2. [Environment Variables](#environment-variables)
3. [API Endpoints](#api-endpoints)
4. [Complete Order Flow](#complete-order-flow)
5. [Email Configuration](#email-configuration)
6. [Testing Guide](#testing-guide)

---

## Setup & Installation

### Prerequisites
- Node.js v16+ 
- MongoDB (local or cloud)
- Razorpay Account (for payments)
- Gmail Account (for email notifications)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:8080`

---

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=8080
MONGODB_URI=mongodb://localhost:27017/etrainindia

# Authentication
JWT_SECRET=your_secret_key_here

# Razorpay Payment Gateway
RAZORPAY_API_KEY=rzp_test_xxxxxxxxxxxxx
RAZORPAY_API_SECRET=your_razorpay_secret

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# SMS Gateway
SPRINGEDGE_API_KEY=your_springedge_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password Setup
1. Enable 2-Factor Authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Generate an "App password" for Mail
4. Use this password in `EMAIL_PASSWORD`

---

## API Endpoints

### Authentication Endpoints

#### 1. Send OTP
```
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "mobile": "919876543210"
}

Response:
{
  "message": "OTP sent successfully"
}
```

#### 2. Verify OTP & Login
```
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "mobile": "919876543210",
  "otp": "123456"
}

Response:
{
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### User Endpoints

#### 1. Create User
```
POST /api/v1/user
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "919876543210",
  "userType": "Student",
  "city": "Delhi",
  "state": "Delhi"
}

Response:
{
  "message": "User created successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "919876543210",
    "userType": "Student",
    "city": "Delhi",
    "state": "Delhi"
  }
}
```

#### 2. Get User Profile
```
GET /api/v1/user/me
Authorization: Bearer <token>

Response:
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "919876543210",
  "userType": "Student",
  "city": "Delhi",
  "state": "Delhi"
}
```

#### 3. Update User Profile
```
PUT /api/v1/user/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "city": "Mumbai",
  "state": "Maharashtra"
}

Response: Updated user object
```

#### 4. Delete User Account
```
DELETE /api/v1/user/me
Authorization: Bearer <token>

Response:
{
  "message": "User deleted successfully"
}
```

---

### Course Endpoints

#### 1. Get All Courses
```
GET /api/v1/course

Response:
{
  "courses": [...]
}
```

#### 2. Get Course by Code
```
GET /api/v1/course/:courseCode

Response: Course object with pricing for all package types
```

---

### Cart Endpoints

#### 1. Get Cart
```
GET /api/v1/cart
Authorization: Bearer <token>

Response:
{
  "user": "...",
  "items": [
    {
      "course": "...",
      "packageType": "Bundle",
      "quantity": 1,
      "price": 5000,
      "total": 5000
    }
  ]
}
```

#### 2. Add to Cart
```
POST /api/v1/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseCode": "JAVA101",
  "packageType": "Bundle",
  "quantity": 1
}

Response:
{
  "message": "Item added to cart successfully",
  "cart": {...}
}
```

#### 3. Remove from Cart
```
POST /api/v1/cart/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "60b5ec8c8c8c8c8c8c8c8c8c",
  "packageType": "Bundle"
}

Response:
{
  "message": "Item removed from cart",
  "cart": {...}
}
```

#### 4. Update Cart Item Quantity
```
PUT /api/v1/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "60b5ec8c8c8c8c8c8c8c8c8c",
  "packageType": "Bundle",
  "quantity": 2
}

Response:
{
  "message": "Cart updated successfully",
  "cart": {...}
}
```

#### 5. Clear Cart
```
DELETE /api/v1/cart/clear
Authorization: Bearer <token>

Response:
{
  "message": "Cart cleared successfully"
}
```

---

### Coupon Endpoints

#### 1. Apply Coupon (Check Validity)
```
POST /api/v1/coupon/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SAVE20",
  "cartTotal": 10000
}

Response:
{
  "valid": true,
  "discount": 2000,
  "finalAmount": 8000
}
```

---

### Order Endpoints

#### 1. Create Order (with Razorpay OrderId)
```
POST /api/v1/order/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "couponCode": "SAVE20",
  "paymentMethod": "Card"
}

Response:
{
  "message": "Order created successfully",
  "order": {
    "_id": "...",
    "user": "...",
    "cart": {
      "items": [...],
      "subTotal": 5000,
      "tax": 900,
      "grandTotal": 5900
    },
    "razorpayOrderId": "order_1234567890",
    "status": "CREATED"
  },
  "bill": {
    "_id": "...",
    "subtotal": 5000,
    "discount": 0,
    "tax": 900,
    "grandTotal": 5900
  },
  "razorpayOrder": {...}
}
```
**Emails sent:**
- Order confirmation email to user

#### 2. Get All Orders
```
GET /api/v1/order
Authorization: Bearer <token>

Response: Array of user's orders
```

---

### Payment Endpoints

#### 1. Create Payment Order (Alternative method)
```
POST /api/v1/payment/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 590000,
  "currency": "INR",
  "receipt": "rcpt_12345",
  "meta": {
    "method": "card"
  }
}

Response:
{
  "order": {
    "id": "order_1234567890",
    "amount": 590000,
    "currency": "INR"
  }
}
```

#### 2. Verify Payment
```
POST /api/v1/payment/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_1234567890",
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_signature": "abcdef123456",
  "meta": {
    "method": "card"
  }
}

Response:
{
  "ok": true,
  "message": "Payment verified and saved"
}
```
**Emails sent if payment successful:**
- Payment success email with invoice
- Bill/Invoice email

---

## Complete Order Flow

### Step-by-Step User Journey

```
1. AUTHENTICATION
   ├─ User sends OTP request with mobile number
   ├─ User provides OTP to verify
   └─ User receives JWT token

2. PRODUCT BROWSING
   ├─ Get all courses or search for specific courses
   └─ View course package types and pricing

3. CART MANAGEMENT
   ├─ Add courses with selected package type to cart
   ├─ View cart items
   ├─ Update quantities or remove items
   └─ Apply coupon codes for discounts

4. ORDER CREATION
   ├─ Create order (cart is converted to order)
   ├─ Razorpay order ID is generated
   ├─ Bill/Invoice is created
   ├─ Order confirmation email sent
   ├─ Cart is cleared
   └─ Frontend receives order details with razorpayOrder

5. PAYMENT PROCESSING
   ├─ Frontend initializes Razorpay with order details
   ├─ User completes payment on Razorpay
   ├─ Frontend captures payment response
   └─ Frontend sends verification request to backend

6. PAYMENT VERIFICATION
   ├─ Backend verifies Razorpay signature
   ├─ Order status updated to "PAID"
   ├─ Bill status updated to "Paid"
   ├─ Payment success email sent
   ├─ Invoice/Bill email sent
   └─ Frontend shows success page

7. POST-PAYMENT
   ├─ User can view orders and invoices
   ├─ Courses are activated in user account
   └─ User can access course materials
```

### Data Flow Diagram

```
User → Mobile OTP → Backend → SMS Service → User
         ↓
      JWT Token
         ↓
   Browse Courses → Get from DB
         ↓
   Add to Cart → Stored in Cart Model
         ↓
   Apply Coupon → Validate & Calculate Discount
         ↓
   Create Order → Order + Bill + Razorpay Order ID
         ↓
   📧 Order Confirmation Email
         ↓
   Razorpay Payment → User Pays
         ↓
   Verify Payment Signature
         ↓
   Update Order/Bill Status
         ↓
   📧 Payment Success + Invoice Emails
```

---

## Email Configuration

### Automated Emails Sent

#### 1. Order Confirmation Email
**When**: Immediately after order creation
**To**: User's email
**Contents**:
- Order ID
- Order date
- List of items ordered
- Prices (subtotal, tax, discount, grand total)
- Next steps for payment

#### 2. Payment Success Email
**When**: After successful payment verification
**To**: User's email
**Contents**:
- Payment confirmation badge
- Payment ID
- Order ID
- Amount paid
- Payment date & method
- Invoice details

#### 3. Invoice/Bill Email
**When**: Immediately after payment success
**To**: User's email
**Contents**:
- Professional invoice layout
- Invoice number & date
- Bill-to address
- Itemized list of courses
- Tax calculations
- Total amount paid
- Payment method & transaction ID

#### 4. Payment Failed Email
**When**: If payment verification fails
**To**: User's email
**Contents**:
- Failed payment notification
- Reasons for failure
- Retry payment link
- Support contact information

---

## Testing Guide

### Testing Authentication Flow

```bash
# 1. Send OTP
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "919876543210"}'

# 2. Verify OTP (use OTP from SMS)
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "919876543210", "otp": "123456"}'

# Save the token from response
TOKEN="your_token_here"
```

### Testing Cart & Order Flow

```bash
# Get cart
curl -X GET http://localhost:8080/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"

# Add to cart
curl -X POST http://localhost:8080/api/v1/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "JAVA101",
    "packageType": "Bundle",
    "quantity": 1
  }'

# Create order
curl -X POST http://localhost:8080/api/v1/order/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "SAVE20",
    "paymentMethod": "Card"
  }'
```

### Testing Payment Flow

```bash
# Frontend receives: razorpayOrder from create order response
# Frontend opens Razorpay with order details

# After user completes payment, verify it
curl -X POST http://localhost:8080/api/v1/payment/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_1234567890",
    "razorpay_payment_id": "pay_1234567890",
    "razorpay_signature": "signature_from_razorpay",
    "meta": {
      "method": "card"
    }
  }'
```

---

## API Response Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

---

## Common Issues & Solutions

### Issue: Email not sending

**Solution**:
1. Check Gmail credentials are correct
2. Verify "Less secure app access" is enabled (or use App Password)
3. Check that EMAIL_USER and EMAIL_PASSWORD in .env are correct
4. Gmail might block first attempt - check email for "suspicious activity" alert

### Issue: Razorpay webhook not working

**Solution**:
1. Use frontend to verify payment (recommended for now)
2. Or implement webhook endpoint for production
3. Ensure RAZORPAY_API_KEY and RAZORPAY_API_SECRET are correct

### Issue: CORS errors

**Solution**: CORS is already enabled in the backend. If issues persist, verify frontend URL setting.

---

## Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use production Razorpay keys
- [ ] Enable MongoDB authentication
- [ ] Set up proper error logging
- [ ] Implement rate limiting
- [ ] Set up HTTPS
- [ ] Configure CDN for static files
- [ ] Set up automated backups
- [ ] Enable payment webhook for production
- [ ] Set up email queue for bulk sending

---

## Support & Troubleshooting

For issues or questions:
1. Check error logs: `npm start` console output
2. Verify .env variables are set correctly
3. Check MongoDB connection
4. Verify API keys (Razorpay, Gmail, SpringEdge)
5. Test endpoints with provided curl commands
