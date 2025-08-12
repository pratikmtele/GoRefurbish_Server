import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
      default: 'New',
    },
    featuredImage: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 4;
        },
        message: 'You can upload a maximum of 4 images.',
      },
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    notiablePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    negotiable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
