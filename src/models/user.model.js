import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    aadharCardNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin', 'employee'],
      default: 'user',
    },
  },
  { timestamps: true }
);

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

function encryptAadhar(text) {
  const iv = crypto.randomBytes(16); // 16 bytes IV
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptAadhar(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('aadharCardNumber')) {
    if (!/^\d{12}$/.test(this.aadharCardNumber)) {
      throw new Error('Invalid Aadhar card number format');
    }
    this.aadharCardNumber = encryptAadhar(this.aadharCardNumber);
  }

  next();
});

userSchema.methods.getDecryptedAadharNumber = function () {
  try {
    return decryptAadhar(this.aadharCardNumber);
  } catch (error) {
    throw new Error('Failed to decrypt Aadhar card number');
  }
};

userSchema.methods.getMaskedAadharNumber = function () {
  try {
    const decrypted = this.getDecryptedAadharNumber();
    // Show only last 4 digits: XXXX XXXX 1234
    return `XXXX XXXX ${decrypted.slice(-4)}`;
  } catch (error) {
    return 'XXXX XXXX XXXX';
  }
};

userSchema.methods.compareAadharCardNumber = function (aadharCardNumber) {
  try {
    const decrypted = this.getDecryptedAadharNumber();
    return decrypted === aadharCardNumber;
  } catch (error) {
    return false;
  }
};

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, username: this.username, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION || '1d',
    }
  );
  return token;
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  return {
    _id: obj._id,
    fullName: obj.fullName,
    email: obj.email,
    phone: obj.phone,
    address: obj.address,
    aadharCardNumber: this.getMaskedAadharNumber(),
    role: obj.role,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

// Transform function for JSON serialization
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    // Don't transform if password is excluded (meaning it's for API response)
    if (!ret.password) {
      ret.aadharCardNumber = doc.getMaskedAadharNumber();
    }
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
