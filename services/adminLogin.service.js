const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/sendOtpEmail');
const {randomInt} = require('crypto');

async function isOtpValid(storedOtp, enteredOtp) {
  return storedOtp.otp_code === enteredOtp && new Date() < new Date(storedOtp.expires_at);
}

async function markOtpUsed(otpId) {
  await pool.query('UPDATE ssoapp.analytics_app_otps SET used = 1 WHERE id = ?', [otpId]);
}

async function generateTokens(user) {
  const payload = {
    id: user.id,
    role: "ADMIN",
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m', 
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '10d', 
  });
  return { accessToken: accessToken, refreshToken:refreshToken };
}

async function sendOtpReg(email, userid) {
  try {
    const userId = userid;

    const otpCode = randomInt(100000, 999999);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'INSERT INTO ssoapp.analytics_app_otps (user_id, otp_code, expires_at, used) VALUES (?, ?, ?, ?)',
      [userId, otpCode, expiresAt, 0]
    );

    await sendOtpEmail(email, otpCode)
    return { success: true, otp: otpCode };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

const loginAdminService = async (req) => {
  const { email, password } = req.body;
      if(!email || !password){
      return{message: "You must enter both, email and password"}
    }

  try {
    const [rows] = await pool.query('SELECT * FROM ssoapp.sso_users WHERE email = ? AND user_type = "ADMIN"', [email]);
    const user = rows[0];
    let storedHash = user.password
    if (!user) {
      return { message: "Invalid credentials" };
    }
    if (storedHash.startsWith("$2y$")) {
      storedHash = "$2a$" + storedHash.slice(4);
    }
    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      return { message: "Invalid credentials" };
    }
    else{
      const otp = await sendOtpReg(email, user.id); 
      console.log(otp)

      if (otp.success) {
        return { message: "OTP sent successfully. Please enter the OTP to proceed." };
      } else {
        return {message : `Error: ${otp.error}`}
      }
    }
  } catch (error) {
    return { message: "Error logging in admin", error: error.message };
  }
};

const verifyAdminOTPService = async (email, otp) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ssoapp.sso_users WHERE email = ? AND user_type ="ADMIN" ' , [email]);
    const user = rows[0];
    if (!user) {
      return { message: "User Not Found" };
    }

    const [otpRows] = await pool.query('SELECT * FROM ssoapp.analytics_app_otps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [user.id]);
    const storedOTP = otpRows[0];

    if (!storedOTP) {
      return { message: "Invalid OTP." };
    }
    if (await isOtpValid(storedOTP, otp)) {
      await markOtpUsed(storedOTP.id); 
      const { accessToken, refreshToken } = await generateTokens(user);
      await pool.query(`UPDATE ssoapp.sso_users SET refresh_token = ? WHERE id = ? `, [
        refreshToken,
        user.id,
      ]);

      return {
        message: "Login SuccessFull",
        accessToken,
        refreshToken
        
      };
    }
    return { message: "Invalid OTP" };
  } catch (error) {
    return { message: "Error verifying OTP ", error: error.message };
  }
};


module.exports = {loginAdminService, verifyAdminOTPService}