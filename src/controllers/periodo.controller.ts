import createError from 'http-errors';
import {
  createPeriodo,
  getPeriodo,
  searchPeriodo,
  updatePeriodo,
} from '../services/periodo.service';

export class periodoController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const body = req.body;
      body.ativo = true;
      const data = await createPeriodo(req.body);
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
      const data = await updatePeriodo(req.body, req.params.id);
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
      const data = await getPeriodo();
      res.status(200).json({
        status: true,
        message: 'Sucesso!',
        data,
      });
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static search = async (req: any, res: any, next: any) => {
    try {
      const data = await searchPeriodo(req.params.search);
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
