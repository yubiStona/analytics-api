const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST ,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
    });
const sendOtpEmail = async (email, otpCode) => {
  const otp = otpCode 

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: email,                   
    subject: 'Your OTP Code',    
    text: `Your OTP code is: ${otp}`,  
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return {message : "otp send successfully"}
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Unable to send OTP email');
  }
};
module.exports = {sendOtpEmail}