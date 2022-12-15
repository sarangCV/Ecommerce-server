const nodemailer = require("nodemailer");
const { resetPassword } = require("./emailTemplates");

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Define the email options
  const mailOptions = {
    from: "Sarang Cheruvattil <hello@sarang.co>",
    to: options.email,
    subject: options.subject,
    html: resetPassword(options.url),
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
