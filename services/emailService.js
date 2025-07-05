// services/emailService.js
const SendEmail = require("../utils/sendEmail");

const sendBookingConfirmationEmail = async ({
  userEmail,
  roomName,
  checkInDate,
  checkOutDate,
  paymentMethod,
  paymentUrl,
}) => {
  try {
    const message =
      `Your booking for room ${roomName} from ${checkInDate} to ${checkOutDate} has been created. ` +
      (paymentMethod === "card"
        ? `Payment must be made within fifteen minutes, otherwise the reservation will be cancelled.\n
           Complete your payment here: ${paymentUrl} `
        : "Please pay in cash at check-in.");

    await SendEmail({
      email: userEmail,
      subject: "Booking Confirmation",
      message,
    });
  } catch (err) {
    console.error("Error sending email booking Confirmation: ", err.message);
    throw new Error("EMAIL_FAILED");
  }
};

const sendPasswordResetEmail = async ({ userEmail, resetCode }) => {
  const message = `Your password reset code is: ${resetCode}\nThis code is valid for 10 minutes.`;

  try {
    await SendEmail({
      email: userEmail,
      subject: "Your password reset code (valid for 10 minutes)",
      message,
    });
  } catch (err) {
    console.error("Error sending password reset email:", err.message);
    throw new Error("EMAIL_FAILED");
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendPasswordResetEmail,
};
