import createError from 'http-errors';
import {
  createStatusEventos,
  deleteStatusEventos,
  getStatusEventos,
  searchStatusEventos,
  updateStatusEventos,
} from '../services/statusEventos.service';

export class statusEventosController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const data = await createStatusEventos(req.body);
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
      const data = await updateStatusEventos(req.body);
      res.status(200).json({
        status: true,
        message: 'Atualizado com sucesso!',
        data,
      });
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static get = async (req: any, res: any, next: any) => {
    try {
      const data = await getStatusEventos();
      res.status(200).json(data);
    } catch (error: any) {
      // res.status(401).json(error);
      // next();
      next(createError(error.statusCode, error.message));
    }
  };
  static search = async (req: any, res: any, next: any) => {
    try {
      const data = await searchStatusEventos(req.params.search);
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static delete = async (req: any, res: any, next: any) => {
    try {
      const data = await deleteStatusEventos(req.params.search);
      res.status(200).json({
        status: true,
        message: 'Sucesso!',
        data,
      });
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
}
