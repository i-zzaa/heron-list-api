import { loginService } from '../services/auth.service';
import { messageSuccessLogin } from '../utils/message.response';

export class authController {
  static login = async (req: any, res: any, next: any) => {
    try {
      const data = await loginService(req.body);
      res.status(200).json(messageSuccessLogin(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
}
