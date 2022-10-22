import createError from 'http-errors';
import {
  createEspecialidade,
  getEspecialidade,
  searchEspecialidade,
  updateEspecialidade,
} from '../services/especialidade.service';

export class especialidadeController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const body = req.body;
      body.ativo = true;
      const data = await createEspecialidade(req.body);
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
      const data = await updateEspecialidade(req.body, req.params.id);
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
      const data = await getEspecialidade();
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
      const data = await searchEspecialidade(req.params.search);
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
