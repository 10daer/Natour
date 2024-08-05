const nodemailer = require("nodemailer");

const sendEmail = async options => {
  // Create a transporter using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: false,
    auth: {
      user: process.env.MAILER_USERNAME,
      pass: process.env.MAILER_PASSWORD
    }
  });

  // Email data
  const mailOptions = {
    from: "Ridwan Afolabi <no-reply@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
