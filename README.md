
<img src="https://tejasvi.vercel.app/img/LibraryManagement.webp" alt="">
# Bihari Library Management System

A comprehensive library management system built with Node.js and Express.js for managing students, seats, payments, and administrative tasks.

## 🚀 Features

- **Student Management**: Registration, login, profile management
- **Seat Management**: Real-time seat booking and availability tracking
- **Payment Processing**: Payment creation, tracking, and management
- **Admin Authentication**: Secure admin login with OTP verification
- **Mail System**: Email notifications and communication
- **Testimonials**: Student feedback and testimonial management
- **Bulk Operations**: Bulk student admission and data management

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (assumed)
- **Authentication**: JWT tokens, OTP verification
- **Email Service**: Integrated mail controller

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bihari-library.git

# Navigate to project directory
cd bihari-library

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the server
npm start
```

## 🌐 API Documentation

Base URL: `https://api.biharilibrary.in/`

### 🔐 Admin Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/signup` | Admin registration |
| POST | `/api/admin/auth/signin` | Admin login |
| POST | `/api/admin/auth/checkuser` | Check admin user status |
| POST | `/api/admin/auth/senotp` | Send OTP for verification |
| POST | `/api/admin/auth/verifyotp` | Verify OTP |

**Example Requests:**

```javascript
// Admin Signup
POST https://api.biharilibrary.in/api/admin/auth/signup
{
  "name": "Admin Name",
  "email": "admin@biharilibrary.in",
  "password": "securepassword"
}

// Admin Login
POST https://api.biharilibrary.in/api/admin/auth/signin
{
  "email": "admin@biharilibrary.in",
  "password": "securepassword"
}
```

### 👨‍🎓 Student Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/student/auth/signin` | Student login |

**Example Request:**

```javascript
// Student Login
POST https://api.biharilibrary.in/api/student/auth/signin
{
  "studentId": "STU001",
  "password": "studentpassword"
}
```

### 👥 Student Management Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/student/create-old-student` | Create old student record |
| POST | `/api/student/create-new-student` | Create new student record |
| POST | `/api/student/login` | Student login |
| POST | `/api/student/logout` | Student logout |
| GET | `/api/student/online-users` | Get online students |
| GET | `/api/student/getallstudent` | Get all students |
| GET | `/api/student/getstudent` | Get specific student |
| POST | `/api/student/updatestudent` | Update student information |
| POST | `/api/student/bulk-admission` | Bulk student admission |
| GET | `/api/student/get-admission-month` | Get admission month data |
| GET | `/api/student/delete` | Delete student (trash) |
| GET | `/api/student/trash-Student` | Get trashed students |

**Example Requests:**

```javascript
// Create New Student
POST https://api.biharilibrary.in/api/student/create-new-student
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "course": "Engineering",
  "shift": "morning"
}

// Get All Students
GET https://api.biharilibrary.in/api/student/getallstudent
```

### 🪑 Seat Management Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seat/getAvailableSeats/:shift` | Get available seats by shift |
| GET | `/api/seat/getVacantSeatsByShift` | Get vacant seats by shift |
| POST | `/api/seat/createSeat` | Create new seat |
| GET | `/api/seat/getAllSeat` | Get all seats |
| GET | `/api/seat/getseatbynumber/:seatNumber` | Get seat by number |
| PUT | `/api/seat/updateSeat/:seatNumber` | Update seat information |

**Example Requests:**

```javascript
// Get Available Seats by Shift
GET https://api.biharilibrary.in/api/seat/getAvailableSeats/morning

// Create New Seat
POST https://api.biharilibrary.in/api/seat/createSeat
{
  "seatNumber": "A001",
  "shift": "morning",
  "status": "available"
}

// Update Seat
PUT https://api.biharilibrary.in/api/seat/updateSeat/A001
{
  "status": "occupied",
  "studentId": "STU001"
}
```

### 💳 Payment Management Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/makepayment` | Create new payment |
| GET | `/api/payment/getallpayment` | Get all payments |
| GET | `/api/payment/getpaymentsid/:sid` | Get payment by student ID |
| DELETE | `/api/payment/deletePayment/:id` | Delete payment record |

**Example Requests:**

```javascript
// Make Payment
POST https://api.biharilibrary.in/api/payment/makepayment
{
  "studentId": "STU001",
  "amount": 1000,
  "paymentMethod": "card",
  "description": "Monthly fee"
}

// Get Payment by Student ID
GET https://api.biharilibrary.in/api/payment/getpaymentsid/STU001
```

### 📧 Mail Management Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mail/getmail` | Get mail information |
| GET | `/api/mail/getstudentemail` | Get student email |
| POST | `/api/mail/sendemail` | Send email |

**Example Requests:**

```javascript
// Send Email
POST https://api.biharilibrary.in/api/mail/sendemail
{
  "to": "student@example.com",
  "subject": "Welcome to Bihari Library",
  "message": "Welcome message content"
}
```

### 🔄 Update Management Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/update/update-student` | Update student payment status |

**Example Request:**

```javascript
// Update Payment Status
POST https://api.biharilibrary.in/api/update/update-student
{
  "studentId": "STU001",
  "paymentStatus": "paid"
}
```

### 💬 Testimonial Management Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/testimonial/add-testimonial` | Add new testimonial |
| GET | `/api/testimonial/get-testimonial` | Get all testimonials |
| DELETE | `/api/testimonial/delete-testimonial/:id` | Delete testimonial |

**Example Requests:**

```javascript
// Add Testimonial
POST https://api.biharilibrary.in/api/testimonial/add-testimonial
{
  "studentName": "John Doe",
  "message": "Great library with excellent facilities!",
  "rating": 5
}

// Get All Testimonials
GET https://api.biharilibrary.in/api/testimonial/get-testimonial
```

## 🔒 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📱 Response Format

All API responses follow this standard format:

```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "error": null
}
```

## 🚨 Error Handling

Error responses follow this format:

```javascript
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bihari-library

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# OTP Configuration
OTP_EXPIRE=10
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Database Schema

### Student Schema
```javascript
{
  studentId: String,
  name: String,
  email: String,
  phone: String,
  course: String,
  shift: String,
  admissionDate: Date,
  paymentStatus: String,
  seatNumber: String,
  isActive: Boolean
}
```

### Seat Schema
```javascript
{
  seatNumber: String,
  shift: String,
  status: String, // available, occupied, maintenance
  studentId: String,
  assignedDate: Date
}
```

### Payment Schema
```javascript
{
  paymentId: String,
  studentId: String,
  amount: Number,
  paymentMethod: String,
  paymentDate: Date,
  status: String,
  description: String
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and queries:
- Email: support@biharilibrary.in
- Documentation: [API Docs](https://api.biharilibrary.in/docs)
- Issues: [GitHub Issues](https://github.com/yourusername/bihari-library/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### v1.0.0
- Initial release
- Student management system
- Seat booking functionality
- Payment processing
- Admin authentication
- Email notifications

---

**Note**: Replace placeholder values like GitHub repository URL, email addresses, and environment variables with actual values for your project.
