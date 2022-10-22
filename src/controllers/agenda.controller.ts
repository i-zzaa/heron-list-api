
import { createAgenda, getDia, getMes, updateAgenda } from '../services/agenda.service';
import { messageSuccess, messageSuccessList, messageUpdate } from '../utils/message.response';

export class agendaController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const body = req.body;
      body.ativo = true;
      const data = await createAgenda(req.body);
      res.status(200).json(messageSuccess(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static getMes = async (req: any, res: any, next: any) => {
    try {
      const response = await getMes(req.params.current);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static getDia = async (req: any, res: any, next: any) => {
    try {
      const data = await getDia(req.params.current);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static update = async (req: any, res: any, next: any) => {
    try {
      const data = await updateAgenda(req.params.id);
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
}
