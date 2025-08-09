import Product from '../models/product.model.js';
import Response from '../utils/Response.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/Error.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';

const uploadProduct = asyncHandler(async (req, res) => {
  const { title, description, category, condition, price, negotiable } =
    req.body;
  const files = req.files.map(file => file?.path);

  if (files.length <= 0)
    return res
      .status(402)
      .json(new ApiError(400, 'Upload atleast one product image'));

  if (
    [title, description, category, condition].some(field => field.trim() === '')
  )
    return res
      .status(400)
      .json(new ApiError(400, 'All the fields are required'));

  if (price < 0)
    return res.status(400).json(new ApiError(400, 'Price is less than 0rs'));

  const imageUrls = [];
  try {
    for (const file of files) {
      const imageUrl = await uploadOnCloudinary(file, 'GoRefurbish/Products');
      imageUrls.push(imageUrl.url);
    }

    const product = await Product.create({
      title: title,
      description,
      userId: req.user._id,
      category,
      condition,
      featuredImage: imageUrls[0],
      images: imageUrls.slice(-4),
      price: Number(price),
      negotiable,
    });

    if (!product)
      return res.status(400).json(new ApiError(400, 'Product is not listed'));

    return res
      .status(200)
      .json(new Response(200, 'Product listed successfully', product));
  } catch (error) {
    if (imageUrls.length > 0) {
      imageUrls.forEach(imageUrl => {
        deleteFromCloudinary(imageUrl);
      });
    }
    console.log(error.message);

    throw new ApiError(
      400,
      'Something went wrong while uploading product images'
    );
  }
});

export { uploadProduct };
