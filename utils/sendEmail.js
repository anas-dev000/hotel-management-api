const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create transporter
  const transporter = nodemailer.createTransport({
    // create transport consists of four things
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: `O-Hotel Management API <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error while sending email:", error);
    throw new Error("Failed to send email");
  }
  // 3) Send email
};

module.exports = sendEmail;
