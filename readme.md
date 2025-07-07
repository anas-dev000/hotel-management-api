# Hotel Management System API

## Overview

A scalable RESTful API for managing hotels, rooms, and bookings, built with **Node.js**, **Express.js**, **Sequelize**, and **PostgreSQL**. It features role-based access control, secure **Stripe** payments, **Nodemailer** email notifications, and **Swagger** documentation. Designed with clean code, modular structure, Sequelize transactions, and robust error handling for reliability and maintainability.

## Features

- 🏨 **Role-Based Access**: Guests book rooms, receptionists manage hotel-specific bookings, admins control all resources.
- 🔎 **Advanced Querying**: Filtering (e.g., location, room type, price), sorting, and pagination for efficient data retrieval.
- 💳 **Secure Payments**: Stripe integration with webhooks for real-time booking updates.
- 📧 **Email Notifications**: Automated confirmations and cancellations via Nodemailer.
- ⏰ **Cron Jobs**: Auto-cancel unpaid bookings after 15 minutes.
- 📜 **Swagger Documentation**: Clear API endpoints at `/api-docs`.
- 🛠 **Clean Code**: Modular structure, Sequelize transactions for data integrity, and standardized error handling.

## Technologies Used

- **Node.js**, **Express.js**: Backend framework
- **Sequelize**, **PostgreSQL**: Database and ORM
- **JWT**, **bcryptjs**: Authentication and password hashing
- **Stripe**: Payment processing with webhooks
- **Nodemailer**: Email notifications
- **Cron**: Scheduled tasks
- **Swagger**: API documentation
- **Helmet**, **CORS**, **Rate Limiting**: Security and performance


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
PORT=???????
PGConnectionString=???????
JWT_SECRET_KEY=???????
JWT_EXPIRE_TIME=???????
EMAIL_HOST=???????
EMAIL_PORT=???????
EMAIL_USER=???????
EMAIL_PASSWORD=???????
STRIPE_SECRET_KEY=?????
STRIPE_WEBHOOK_SECRET=???????
BASE_URL=???????
```

### 4. Set Up Database
- Ensure PostgreSQL is running.
- Create database: `createdb Hotel-Management-System`
- Run migrations: `npx sequelize-cli db:migrate`

### 5. Run the Application
```bash
npm run dev
```

### 6. Access API Documentation
- Open `http://localhost:3000/api-docs` for Swagger UI.

## API Endpoints

- **Hotels**: CRUD (`/hotels`, `/hotels/:id`) with filtering (location, starRating).
- **Rooms**: Manage rooms (`/rooms`, `/rooms/:id`) with filtering (hotelId, roomType, price).
- **Bookings**: Create/manage bookings (`/bookings`, `/bookings/:id`), check availability (`/bookings/available-rooms`), handle Stripe payments (`/bookings/success`, `/bookings/cancel`).

Test endpoints via Swagger UI or Postman.

## Roles & Permissions

- **Guest**: Book rooms, update profile.
- **Receptionist**: Manage bookings/rooms for assigned hotel.
- **Admin**: Full control over hotels, rooms, bookings, and users.

## Testing

- Use **Swagger UI** (`/api-docs`) for interactive testing.
- Example (create booking):
  ```bash
  curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"roomId":"456e7890-f12c-34d5-b678-901234567890","checkInDate":"2025-07-10T14:00:00.000Z","checkOutDate":"2025-07-12T12:00:00.000Z","paymentMethod":"card"}'
  ```

## Contribution

Contributions are welcome! Follow clean code practices and submit pull requests. Open an issue for major changes.


---

*Built by Anas*
