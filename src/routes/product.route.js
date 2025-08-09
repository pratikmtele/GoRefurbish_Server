import express from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { uploadProduct } from '../controllers/product.controller.js';
import authenticate from '../middleware/authenticate.js';

const productRouter = express.Router();

productRouter.post('/', authenticate, upload.array('images'), uploadProduct);

export default productRouter;
