const nodemailer = require('nodemailer');

const isEmailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendMail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    console.warn('Email is not configured. Set EMAIL_USER and EMAIL_PASS in backend/.env');
    return false;
  }
  await getTransporter().sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
  return true;
};

module.exports = { sendMail, isEmailConfigured };
