const prisma = require('../config/db');
const nodemailer = require('nodemailer');

exports.createReferral = async (req, res) => {
  try {
    console.log('Received Data:', req.body); // Log the received data

    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newReferral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    // Send referral email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: refereeEmail,
      subject: 'You have been referred!',
      text: `Hi ${refereeName},\n\n${referrerName} has referred you to our service.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json(newReferral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
