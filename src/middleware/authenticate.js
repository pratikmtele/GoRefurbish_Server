import jwt from 'jsonwebtoken';
import Response from '../utils/Response.js';

const authenticate = (req, res, next) => {
  const token =
    req.cookies?.['auth-token'] ||
    req.header('Authorization')?.replace('Bearer ', '') ||
    req.body.token ||
    req.query.token;

  if (token === undefined) next();

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return res
      .status(401)
      .json(new Response(401, 'Invalid authentication token'));
  }
  req.user = decoded;
  next();
};

export default authenticate;
