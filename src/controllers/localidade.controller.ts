import createError from 'http-errors';
import {
  createLocalidade,
  deleteLocalidade,
  getLocalidade,
  searchLocalidade,
  updateLocalidade,
} from '../services/localidade.service';

export class localidadeController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const data = await createLocalidade(req.body);
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
      const data = await updateLocalidade(req.body);
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
      const data = await getLocalidade();
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static search = async (req: any, res: any, next: any) => {
    try {
      const data = await searchLocalidade(req.params.search);
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static delete = async (req: any, res: any, next: any) => {
    try {
      const data = await deleteLocalidade(req.params.search);
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
