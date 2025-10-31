const { pool } = require("../config/db");
const { loginAdminService, verifyAdminOTPService } = require("../services/adminLogin.service");
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  try {
    const result = await loginAdminService(req);
    if (result.error) {
      return res.status(500).json({ message: result.message || 'Error logging in admin', error: result.error });
    }
    if (result.message === "OTP sent successfully. Please enter the OTP to proceed.") {
      return res.status(200).json({ message: result.message });
    }
    return res.status(400).json({ message: result.message || 'Invalid credentials' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const verifyAdminOTP = async (req, res) => {
  try {
    const{email, otp} = req.body
    const result = await verifyAdminOTPService(email, otp);
    if (result.error) {
      return res.status(500).json({ message: result.message || 'Error verifying OTP', error: result.error });
    }
    if (result.accessToken && result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true, 
        sameSite: "Lax",
        maxAge: 10 * 24 * 60 * 60 * 1000,
      });
      res.cookie("Authorization", result.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 15 * 60 * 60 * 1000 
      });
      return res.status(200).json({ message: result.message, accessToken: result.accessToken });
    }
    return res.status(400).json({ message: result.message });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/", 
    });
    res.clearCookie("Authorization", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const tokenData = await pool.query(`Select refresh_token, id from ssoapp.sso_users where refresh_token=?`, [refreshToken])
    const tokenEntry = tokenData[0];
    
    if (!tokenEntry) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }
      const newAccessToken = jwt.sign(
        { id: tokenEntry.id, role: "ADMIN" },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      res.cookie('Authorization', newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000,  // 15 mins
      });
      

      return res.status(200).json({message:"Refreshed successfully", accessToken: newAccessToken});
    });

  } catch (error) {
    res.status(500).json({message:"Internal Server Error"});
  }
};
module.exports = { loginAdmin, verifyAdminOTP, logout, refreshAccessToken };
