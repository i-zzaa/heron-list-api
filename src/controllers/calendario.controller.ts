import createError from 'http-errors';
import {
  createCalendario,
  deleteCalendario,
  getFilter,
  getRange,
  updateCalendario,
  updateCalendarioMobile,
} from '../services/calendario.service';

export class calendarioController {
  static getTerapeuta(
    arg0: string,
    auth: (req: any, res: any, next: any) => Promise<void>,
    getTerapeuta: any
  ) {
    throw new Error('Method not implemented.');
  }
  static create = async (req: any, res: any, next: any) => {
    try {
      const data = await createCalendario(req.body, req.headers.login);
      res.status(200).json({
        status: true,
        message: 'Criado com sucesso!',
        data,
      });
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static update = async (req: any, res: any, next: any) => {
    try {
      let data: any;
      if (req.headers.device === 'mobile') {
        data = await updateCalendarioMobile(req.body, req.headers.login);
      } else {
        data = await updateCalendario(req.body, req.headers.login);
      }

      res.status(200).json({
        status: true,
        message: 'Atualizado com sucesso!',
        data,
      });
    } catch (error: any) {
      res.status(401).json(error);
      next();
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
      res.status(401).json(error);
      next();
    }
  };

  static getRange = async (req: any, res: any, next: any) => {
    try {
      const data = await getRange(req.params);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static getFilter = async (req: any, res: any, next: any) => {
    try {
      const data = await getFilter(req.params, req.query);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
}
