import {
  getFinancial,
  getFinancialPaciente,
} from '../services/financial.service';
import { messageUpdate } from '../utils/message.response';

export class fiancialController {
  static getTerapeuta = async (req: any, res: any, next: any) => {
    try {
      const data = await getFinancial(req.body);
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static getPaciente = async (req: any, res: any, next: any) => {
    try {
      const data = await getFinancialPaciente(req.body);
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
}
