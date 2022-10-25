import createError from 'http-errors';
import {
  createCalendario,
  deleteCalendario,
  getDay,
  getMonth,
  getWeek,
  updateCalendario,
} from '../services/calendario.service';

export class calendarioController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const data = await createCalendario(req.body);
      res.status(200).json({
        status: true,
        message: 'Criado com sucesso!',
        data,
      });
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static update = async (req: any, res: any, next: any) => {
    try {
      const data = await updateCalendario(req.body);
      res.status(200).json({
        status: true,
        message: 'Atualizado com sucesso!',
        data,
      });
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static delete = async (req: any, res: any, next: any) => {
    try {
      const data = await deleteCalendario(req.params.search);
      res.status(200).json({
        status: true,
        message: 'Sucesso!',
        data,
      });
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };

  static getMonth = async (req: any, res: any, next: any) => {
    try {
      const data = await getMonth(req.params);
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static getDay = async (req: any, res: any, next: any) => {
    try {
      const data = await getDay(req.params);
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static getWeek = async (req: any, res: any, next: any) => {
    try {
      const data = await getWeek(req.params);
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
}
