const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Car Catalog" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} | Subject: ${subject}`);
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw new Error('Email yuborishda xatolik yuz berdi');
  }
};

const sendVerifyEmail = (to, code) =>
  sendEmail({
    to,
    subject: 'Email tasdiqlash kodi',
    html: `<h2>Tasdiqlash kodi</h2><p>Sizning kodingiz: <b>${code}</b></p><p>Kod 10 daqiqa davomida amal qiladi.</p>`,
  });

const sendResetPasswordEmail = (to, code) =>
  sendEmail({
    to,
    subject: 'Parolni tiklash kodi',
    html: `<h2>Parolni tiklash</h2><p>Sizning kodingiz: <b>${code}</b></p><p>Kod 10 daqiqa davomida amal qiladi.</p>`,
  });

module.exports = { sendVerifyEmail, sendResetPasswordEmail };