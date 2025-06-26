// routes/test.routes.js
const express = require("express");
const router = express.Router();
const { User, Hotel, Room, Booking } = require("../models");

// Create test user
router.post("/test-user", async (req, res) => {
  const user = await User.create({
    name: "Test",
    email: "test@example.com",
    password: "password123",
  });
  res.json(user);
});

// Create test hotel
router.post("/test-hotel", async (req, res) => {
  const hotel = await Hotel.create({
    name: "Hotel test",
    description: "description description description description",
    location: "Test Test Test",
  });
  res.json(hotel);
});

// Create test room
router.post("/test-room", async (req, res) => {
  const room = await Room.create({
    name: "Room test",
    description: "description description description description",
    pricePerNight: 20.5,
    roomType: "double",
    capacity: 5,
    hotelId: "7cfccbe8-44cd-4163-b108-99d4184e873b",
  });
  res.json(room);
});

// Create test booking
router.post("/test-booking", async (req, res) => {
  const booking = await Booking.create({
    userId: "f2f91877-8ff1-42cb-ac0f-c924134ab90c",
    roomId: "6f678790-a7e2-4d01-8259-e5f2a07b8446",
    checkInDate: "2025-07-01",
    checkOutDate: "2025-07-03",
    paymentMethod: "card",
  });
  res.json(booking);
});

router.post("/test-all", async (req, res) => {
  const hotel = await Hotel.create({
    name: "Hotel test",
    description: "description description description description",
    location: "Test Test Test",
  });
  const room = await Room.create({
    name: "Room test",
    description: "description description description description",
    pricePerNight: 20.5,
    roomType: "double",
    capacity: 5,
    hotelId: hotel.id,
  });
  const user = await User.create({
    name: "Test User",
    email: "test0@example.com",
    password: "password123",
  });
  const booking = await Booking.create({
    userId: user.id,
    roomId: room.id,
    checkInDate: "2025-07-01",
    checkOutDate: "2025-07-03",
    paymentMethod: "card",
  });
  res.json({ hotel, room, user, booking });
});

module.exports = router;
