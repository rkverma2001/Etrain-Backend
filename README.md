# Etrain India - E-Commerce Backend System

## 🎯 Overview

A complete, production-ready e-commerce backend for an online course platform with:
- **Order Management**: Create and track orders
- **Payment Integration**: Fully integrated Razorpay gateway
- **Bill Management**: Automated invoice generation
- **Email Notifications**: Automated emails for orders, payments, and invoices
- **Authentication**: OTP-based login system
- **Cart System**: Full shopping cart with coupon support
- **User Management**: Complete user profile management

---

## 📋 Features

### Core Features
✅ OTP-based authentication (via SpringEdge SMS)
✅ User registration and profile management
✅ Course catalog with multiple package types
✅ Shopping cart with add/remove/update operations
✅ Coupon/discount system
✅ Order creation with automatic Razorpay order generation
✅ Payment verification with signature validation
✅ Automated email notifications (HTML formatted)
✅ Invoice/bill generation and email delivery
✅ Complete order tracking

### Technical Features
✅ RESTful API architecture
✅ JWT authentication middleware
✅ MongoDB for data persistence
✅ Error handling and validation
✅ Modular controller-model architecture
✅ Environment-based configuration
✅ CORS enabled
✅ Request logging

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or Atlas)
- Razorpay Account
- Gmail Account (for emails)
- SpringEdge Account (for SMS)

### Installation

1. **Clone and Setup**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start Server**
   ```bash
   npm start
   ```
   Server runs on: `http://localhost:8080`

---

## ⚙️ Environment Setup

Create a `.env` file:

```env
# Server
PORT=8080
MONGODB_URI=mongodb://localhost:27017/etrainindia

# Auth
JWT_SECRET=your_super_secret_key_min_32_chars

# Razorpay
RAZORPAY_API_KEY=rzp_test_xxxxx
RAZORPAY_API_SECRET=xxxxx

# Gmail SMTP (for email)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMS Gateway
SPRINGEDGE_API_KEY=your_key

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Getting Email Credentials

1. Enable 2FA on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate "App password" for Mail on Windows
4. Use this 16-character password in `.env`

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── passport.js           # Passport config (if needed)
├── controllers/
│   ├── authController.js     # OTP login logic
│   ├── userController.js     # User CRUD operations
│   ├── cartController.js     # Shopping cart operations
│   ├── courseController.js   # Course management
│   ├── orderController.js    # Order creation with Razorpay
│   ├── paymentController.js  # Payment verification & emails
│   ├── couponController.js   # Discount/coupon logic
│   └── categoryController.js # Category management
├── middlewares/
│   ├── auth.js               # Passport middleware
│   └── authMiddleware.js     # JWT verification
├── models/
│   ├── userModel.js          # User schema
│   ├── cartModel.js          # Cart schema
│   ├── courseModel.js        # Course schema
│   ├── orderModel.js         # Order schema (linked to Bill & Payment)
│   ├── billModel.js          # Invoice/Bill schema
│   ├── paymentModel.js       # Payment schema
│   ├── couponModel.js        # Coupon schema
│   └── otpModel.js           # OTP storage schema
├── routes/
│   ├── index.js              # Main router
│   ├── authRoutes.js         # Auth endpoints
│   ├── userRoutes.js         # User endpoints
│   ├── cartRoutes.js         # Cart endpoints
│   ├── courseRoutes.js       # Course endpoints
│   ├── orderRoutes.js        # Order endpoints ✨ NEW
│   ├── paymentRoutes.js      # Payment endpoints
│   ├── couponRoutes.js       # Coupon endpoints
│   └── categoryRoutes.js     # Category endpoints
├── services/
│   └── emailService.js       # ✨ Email sending utility (NEW)
├── index.js                  # Entry point
├── package.json
├── .env.example              # ✨ Environment template (NEW)
├── API_DOCUMENTATION.md      # ✨ Complete API docs (NEW)
└── README.md                 # This file
```

---

## 🔄 Complete Order Flow

### User Journey

```
Step 1: AUTHENTICATION
        ↓
   Send OTP → Verify OTP → Get JWT Token
        ↓
Step 2: SHOPPING
        ↓
   Browse Courses → Add to Cart → Apply Coupon
        ↓
Step 3: CHECKOUT
        ↓
   Create Order → Generate Razorpay Order ID
        ↓
Step 4: PAYMENT
        ↓
   Razorpay Payment → Signature Verification
        ↓
Step 5: CONFIRMATION
        ↓
   Order → Bill → Payment Records Updated
        ↓
Step 6: EMAILS SENT
        ↓
   ✉️  Order Confirmation
   ✉️  Payment Success
   ✉️  Invoice/Bill
```

### Data Models Relationship

```
User
 ├── Order (1:Many)
 │    ├── Bill (1:1)
 │    └── Payment (1:1)
 ├── Cart (1:1)
 │    └── Items (Many) → Course
 └── Profile
    └── city, state, email

Order
 ├── user_id (ref: User)
 ├── cart (embedded with item details)
 ├── bill_id (ref: Bill)
 ├── razorpayOrderId
 ├── status (CREATED, PAID, FAILED)
 └── timestamps

Bill
 ├── user_id
 ├── items (courses purchased)
 ├── prices (subtotal, tax, discount, grand total)
 ├── paymentStatus
 ├── transactionId
 └── timestamps

Payment
 ├── user_id
 ├── orderId (razorpay order id)
 ├── paymentId (after verification)
 ├── signature
 ├── status (created, paid, failed)
 └── meta (payment method, etc)
```

---

## 📧 Email System

### Emails Sent Automatically

1. **Order Confirmation** (on order creation)
   - Order ID, date, items list
   - Pricing breakdown
   - Next steps for payment

2. **Payment Success** (on payment verification)
   - Payment confirmation badge
   - Invoice details
   - Payment method and ID

3. **Invoice/Bill** (on payment success)
   - Professional HTML invoice
   - Itemized course list
   - Tax calculations
   - Transaction ID

4. **Payment Failed** (on failed verification)
   - Failure notification
   - Possible reasons
   - Retry payment link

All emails are HTML formatted with professional styling and include company branding.

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP to mobile
- `POST /api/v1/auth/verify-otp` - Verify OTP and get token

### User
- `POST /api/v1/user` - Create user
- `GET /api/v1/user/me` - Get profile (auth required)
- `PUT /api/v1/user/me` - Update profile (auth required)
- `DELETE /api/v1/user/me` - Delete account (auth required)

### Cart
- `GET /api/v1/cart` - Get cart (auth required)
- `POST /api/v1/cart/add` - Add item (auth required)
- `POST /api/v1/cart/remove` - Remove item (auth required)
- `PUT /api/v1/cart/update` - Update quantity (auth required)
- `DELETE /api/v1/cart/clear` - Clear cart (auth required)

### Orders ✨ NEW
- `POST /api/v1/order/create` - Create order with Razorpay (auth required)
- `GET /api/v1/order` - Get all user orders (auth required)

### Payments ✨ ENHANCED
- `POST /api/v1/payment/create-order` - Create payment order
- `POST /api/v1/payment/verify` - Verify payment & send emails

### Other
- `GET /api/v1/course` - Get courses
- `POST /api/v1/coupon/validate` - Validate coupon
- `GET /check` - Health check

**See `API_DOCUMENTATION.md` for complete details with examples**

---

## 🧪 Testing

### Manual Testing
See `API_DOCUMENTATION.md` for curl commands to test each endpoint.

### Testing Payment Flow
1. Create order via `/api/v1/order/create`
2. Get `razorpayOrder` from response
3. Frontend opens Razorpay payment page
4. After user pays, call `/api/v1/payment/verify`
5. Check email for confirmations

### Testing Emails
Make sure to check spam/promotions folder in Gmail. You can configure Gmail filters to ensure emails arrive in inbox.

---

## 🛡️ Security

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation on all endpoints
- Protected routes with auth middleware
- Razorpay signature verification for payments
- CORS enabled and configured
- Environment variables for sensitive data

**Production TODO:**
- Implement rate limiting
- Add request logging
- Set up HTTPS
- Add helmet for HTTP headers
- Implement refresh tokens
- Add email queue for bulk sending
- Set up Redis caching

---

## 🐛 Troubleshooting

### Issue: Cannot find module 'nodemailer'
```bash
npm install nodemailer --save
npm start
```

### Issue: MongoDB connection fails
- Verify MONGODB_URI in .env
- Ensure MongoDB is running
- Check connection string format

### Issue: Emails not sending
- Verify EMAIL_USER and EMAIL_PASSWORD
- Check if using "App password" (not regular password)
- Look for "suspicious activity" alert from Gmail
- Enable "Less secure apps" if not using App password

### Issue: Razorpay orders not creating
- Verify RAZORPAY_API_KEY and RAZORPAY_API_SECRET
- Ensure amount is in correct format (paise)
- Check Razorpay dashboard for invalid keys

### Issue: CORS errors
- Verify frontend URL in .env
- CORS middleware is already enabled
- Check browser console for specific Origin errors

---

## 📊 Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  mobile: String (unique, required),
  userType: Enum ["Student", "Freelancer", "Trainer", "WorkingProfessional"],
  city: String,
  state: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  user: ObjectId (ref: User),
  cart: {
    items: [{
      course: ObjectId (ref: Course),
      packageType: String,
      quantity: Number,
      price: Number,
      total: Number
    }],
    subTotal: Number,
    tax: Number,
    grandTotal: Number
  },
  bill: ObjectId (ref: Bill),
  coupon: ObjectId (ref: Coupon),
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: Enum ["CREATED", "PAID", "FAILED", "REFUNDED"],
  createdAt: Date,
  updatedAt: Date
}
```

### Bill Schema
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    course: ObjectId (ref: Course),
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: Number,
  tax: Number,
  discount: Number,
  grandTotal: Number,
  paymentStatus: Enum ["Pending", "Paid", "Failed", "Refunded"],
  paymentMethod: String,
  transactionId: String,
  billDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📝 Example Usage

### 1. Complete Order to Payment Flow

```bash
# Get Token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"919876543210","otp":"123456"}' | jq -r '.token')

# Add to Cart
curl -X POST http://localhost:8080/api/v1/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"JAVA101","packageType":"Bundle","quantity":1}'

# Create Order
ORDER=$(curl -s -X POST http://localhost:8080/api/v1/order/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"couponCode":"SAVE20","paymentMethod":"Card"}')

# Get Razorpay Order from response
RAZORPAY_ORDER_ID=$(echo $ORDER | jq -r '.razorpayOrder.id')

# Frontend: User pays via Razorpay...
# After payment, verify:

curl -X POST http://localhost:8080/api/v1/payment/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id":"'$RAZORPAY_ORDER_ID'",
    "razorpay_payment_id":"pay_xyz",
    "razorpay_signature":"sig_xyz",
    "meta":{"method":"card"}
  }'

# Emails automatically sent!
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Use production Razorpay keys
- [ ] Configure production MongoDB
- [ ] Enable email queue for reliability
- [ ] Set up error logging service
- [ ] Configure SSL/HTTPS
- [ ] Enable rate limiting
- [ ] Set up backup strategy
- [ ] Configure CDN for static files
- [ ] Test all email templates
- [ ] Document API for frontend team

### Deploy to Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set JWT_SECRET=your_secret
heroku config:set RAZORPAY_API_KEY=...
# Set other env variables
```

---

## 📞 Support & Contact

For issues or questions:
1. Check error logs in console
2. Review API_DOCUMENTATION.md
3. Verify all .env variables
4. Test with curl commands
5. Check MongoDB connection
6. Review email service logs

---

## 📄 License

ISC License - Etrain India

---

## 👨‍💻 Author

Ritesh Kumar Verma

---

### Last Updated
March 27, 2026

### Next Steps for Frontend Integration
1. Get authentication token from `/auth/verify-otp`
2. Store token in localStorage
3. Use token in Authorization header for all requests
4. Integrate Razorpay checkout with order response
5. Handle payment verification and success page
6. Display invoices and order history

---

**Happy Coding! 🎉**
