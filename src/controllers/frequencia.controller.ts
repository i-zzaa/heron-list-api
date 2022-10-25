import createError from 'http-errors';
import {
  createFrequencia,
  deleteFrequencia,
  getFrequencia,
  searchFrequencia,
  updateFrequencia,
} from '../services/frequencia.service';

export class frequenciaController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const data = await createFrequencia(req.body);
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
      const data = await updateFrequencia(req.body);
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
      const data = await getFrequencia();
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static search = async (req: any, res: any, next: any) => {
    try {
      const data = await searchFrequencia(req.params.search);
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static delete = async (req: any, res: any, next: any) => {
    try {
      const data = await deleteFrequencia(req.params.search);
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
