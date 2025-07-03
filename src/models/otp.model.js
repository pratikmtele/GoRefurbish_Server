import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['password-reset', 'email-verification'],
    default: 'password-reset'
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    expires: 0 // MongoDB TTL for automatic cleanup
  }
}, { 
  timestamps: true 
});

// Index for automatic cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to verify OTP
otpSchema.methods.verifyOTP = function(providedOTP) {
  if (this.isUsed) {
    throw new Error('OTP has already been used');
  }
  
  if (this.attempts >= 3) {
    throw new Error('Maximum OTP attempts exceeded');
  }
  
  if (new Date() > this.expiresAt) {
    throw new Error('OTP has expired');
  }
  
  this.attempts += 1;
  
  if (this.otp === providedOTP) {
    this.isUsed = true;
    return true;
  }
  
  return false;
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
