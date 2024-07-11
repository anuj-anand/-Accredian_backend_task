const express = require('express');
const router = express.Router();
const { createReferral } = require('../models/Referral'); // Assuming this is the correct path and function
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/referrals', async (req, res) => {
  try {
    const { yourName, yourEmail, friendName, friendEmail } = req.body;

    // Validate request body
    if (!yourName || !yourEmail || !friendName || !friendEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save referral data to database
    const referral = await createReferral({
      yourName,
      yourEmail,
      friendName,
      friendEmail,
    });

    // Send email notification
    await sendEmailNotification(yourName, yourEmail, friendName, friendEmail);

    // Respond with success message
    res.status(201).json({ message: 'Referral saved successfully' });
  } catch (error) {
    console.error('Error saving referral:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to send email notification
async function sendEmailNotification(yourName, yourEmail, friendName, friendEmail) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: friendEmail,
      subject: `You've been referred by ${yourName}!`,
      text: `Hi ${friendName},\n\nYou've been referred by ${yourName} (${yourEmail}). Check it out!`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email notification sent to', friendEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

module.exports = router;
