import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import Response from '../utils/Response.js';
import asyncHandler from '../utils/asyncHandler.js';
import EmailService from '../services/emailService.js';

const signup = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    address,
    idNumber,
    password,
    confirmPassword,
    role,
  } = req.body;

  if (
    [fullName, email, address, phone, idNumber, password, confirmPassword].some(
      field => field.trim() === ''
    )
  )
    return res.status(400).json({ message: 'All fields are required' });

  const validRoles = ['user', 'admin', 'superadmin', 'employee'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  const isPasswordValid = password === confirmPassword;

  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const isUserExisting = await User.findOne({
    $or: [{ email }, { phone }, { aadharCardNumber: idNumber }],
  }).select('_id');

  if (isUserExisting)
    return res.status(400).json({ message: 'User already exists' });

  try {
    // Create a new user instance
    const newUser = new User({
      fullName,
      email,
      address,
      phone,
      aadharCardNumber: idNumber,
      password,
      role: role || 'user',
    });

    const savedUser = await newUser.save();

    const isSaved = await User.findById(savedUser._id).select('-password -__v');

    if (!isSaved) {
      return res.status(500).json({ message: 'Error saving user' });
    }

    new EmailService().sendWelcomeEmail(email, fullName);
    const response = new Response(200, 'User created successfully', isSaved);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error creating user' });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some(field => field.trim() === ''))
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = await user.generateAuthToken();

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: undefined,
    };

    const response = new Response(200, 'Login successful', {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        aadharCardNumber: user.aadharCardNumber,
        role: user.role,
      },
    });

    return res
      .cookie('auth-token', token, cookieOptions)
      .status(response.statusCode)
      .json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error logging in' });
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    if (!user) return res.json(new Response(401, 'Unauthorized', null));

    const isuservalid = await User.findById(user._id).select(
      '-password -aadharCardNumber -__v'
    );

    const response = new Response(
      200,
      'User retrieved successfully',
      isuservalid
    );

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Error retrieving user' });
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    const response = new Response(200, 'Logged out successfully', {
      message: 'You have been logged out successfully',
    });

    return res
      .clearCookie('auth-token', {
        httpOnly: true,
        secure: false, // Match login cookie settings
        sameSite: 'lax',
        path: '/',
        domain: undefined,
      })
      .status(response.statusCode)
      .json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error logging out' });
  }
});

// Forgot Password - Send OTP
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await OTP.deleteMany({ email: email.toLowerCase() });

    const emailService = new EmailService();
    const otp = emailService.generateOTP();

    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp: otp,
      purpose: 'password-reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await otpRecord.save();

    console.log('OTP created with expiration:', otpRecord.expiresAt);

    const emailResult = await emailService.sendOTPEmail(
      email,
      otp,
      user.fullName
    );

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    const response = new Response(200, 'OTP sent successfully to your email', {
      email: email,
      expiresIn: '10 minutes',
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res
      .status(500)
      .json({ message: 'Error processing forgot password request' });
  }
});

// Reset Password - Verify OTP and Update Password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Email, OTP, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: 'password-reset',
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const isValidOTP = otpRecord.verifyOTP(otp);

    if (!isValidOTP) {
      await otpRecord.save();
      const remainingAttempts = 3 - otpRecord.attempts;

      if (remainingAttempts <= 0) {
        return res.status(400).json({
          message: 'Maximum OTP attempts exceeded. Please request a new OTP.',
        });
      }

      return res.status(400).json({
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
      });
    }

    await otpRecord.save();

    const user = await User.findOne({ email: email.toLowerCase() });
    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email: email.toLowerCase() });

    const response = new Response(200, 'Password reset successfully', {
      message: 'You can now login with your new password',
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error('Reset password error:', error);

    if (error.message.includes('OTP')) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error resetting password' });
  }
});

// Verify OTP (without resetting password)
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: 'password-reset',
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const isValidOTP = otpRecord.verifyOTP(otp);

    if (!isValidOTP) {
      await otpRecord.save();
      const remainingAttempts = 3 - otpRecord.attempts;

      if (remainingAttempts <= 0) {
        return res.status(400).json({
          message: 'Maximum OTP attempts exceeded. Please request a new OTP.',
        });
      }

      return res.status(400).json({
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
      });
    }

    // Don't mark as used yet - just verify
    const response = new Response(200, 'OTP verified successfully', {
      message: 'OTP is valid. You can now reset your password.',
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error('Verify OTP error:', error);

    if (error.message.includes('OTP')) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Error verifying OTP' });
  }
});

export {
  signup,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
  verifyOTP,
};
