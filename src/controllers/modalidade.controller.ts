import createError from 'http-errors';
import {
  createModalidade,
  deleteModalidade,
  getModalidade,
  searchModalidade,
  updateModalidade,
} from '../services/modalidade.service';

export class modalidadeController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const data = await createModalidade(req.body);
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
      const data = await updateModalidade(req.body);
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
      const data = await getModalidade();
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static search = async (req: any, res: any, next: any) => {
    try {
      const data = await searchModalidade(req.params.search);
      res.status(200).json(data);
    } catch (error: any) {
      next(createError(error.statusCode, error.message));
    }
  };
  static delete = async (req: any, res: any, next: any) => {
    try {
      const data = await deleteModalidade(req.params.search);
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
