# Hotel Management System API

## Overview

The **Hotel Management System API** is a scalable and modular RESTful API built with **Node.js**, **Express**, and **PostgreSQL** using **Sequelize** ORM. It supports hotel operations such as room management, user authentication, bookings, payments via Stripe, and admin analytics. Built with clean code practices, role-based access, and full documentation.

---

## Project Structure

```
Hotel-Management-API/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── uploads/
├── .env
├── package.json
├── server.js
├── swagger.js
```

> Detailed structure explained in the Project Overview section.

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/Anas-dev000/hotel-management-api.git
cd hotel-management-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=3000
DB_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_password
STRIPE_SECRET_KEY=your_stripe_key
```

### 4. Run the App

```bash
npm run dev
```

---

## API Documentation

API is documented with **Swagger**.

- **Run server**
- Visit: `http://localhost:3000/api-docs`

---

## Technologies Used

- **Node.js**, **Express.js**
- **PostgreSQL** with **Sequelize ORM**
- **JWT** Authentication + **bcryptjs**
- **Stripe API** (Payments)
- **Multer + Sharp** (Image upload/resize)
- **Nodemailer** (Emails)
- **Swagger** (API docs)
- **Helmet**, **CORS**, **Rate Limiting** (Security)

---

## Roles & Permissions

- **Guest**: Register, book, update profile
- **Receptionist**: Manage rooms/bookings (assigned hotel only)
- **Admin**: Full access (users, hotels, analytics)

---

## Testing

Use Postman or Swagger UI to test all endpoints. Full list of routes included in the main documentation.

---

## Admin Features

- Manage hotels, users, and rooms
- View analytics (occupancy, revenue)
- Add/remove staff

---

## Tasks Overview

| Task   | Description                                                 |
| ------ | ----------------------------------------------------------- |
| Task 1 | Setup DB & define Sequelize models                          |
| Task 2 | Implement auth with JWT, signup/login/forget/reset password |
| Task 3 | CRUD for rooms with images                                  |
| Task 4 | Booking system + Stripe integration                         |
| Task 5 | Hotel management (admin only)                               |
| Task 6 | Analytics for admins                                        |
| Task 7 | Swagger documentation setup                                 |

---

## Contribution

This project follows clean code principles and modularity. Open to contributions and improvements.

---

## License

MIT

---

> Built by Anas
