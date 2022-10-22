import { verifyAccessToken } from '../utils/jwt';
import createError from 'http-errors';

export const auth = async (req: any, res: any, next: any) => {
  // if (!req.headers.authorization) {
  // 	return next(new createError.Unauthorized('Access token is required'));
  // }

  // const token = req.headers.authorization.split(' ')[1];
  // if (!token) {
  // 	return next(new createError.Unauthorized());
  // }

  // await verifyAccessToken(token)
  // 	.then((user: any) => {
  // 		req.user = user;
  // 		next();
  // 	})
  // 	.catch((error: any) => {
  // 		next(new createError.Unauthorized(error.message));
  // 	});
  next();
};
