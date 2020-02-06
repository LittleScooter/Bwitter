  const nodemailer = require("nodemailer");

  module.exports = {
      sendMail: sendMail
  }
  // Here you set the email credentials 
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAILPASS
      }
  });

  function sendMail(to, data) {
      const mailOptions = {
          from: "noreply@gmail.com", // this is what the client should see that it is from
          to: to,
          subject: "Verification code",
          html: data
      }
      // This returns the promise
      return transporter.sendMail(mailOptions);
  }