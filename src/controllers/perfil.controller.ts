import createError from 'http-errors';
import {
  createPerfil,
  getPerfil,
  searchPerfil,
  updatePerfil,
} from '../services/perfil.service';

export class perfilController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const body = req.body;
      body.ativo = true;
      const data = await createPerfil(req.body);
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
      const data = await updatePerfil(req.body, req.params.id);
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
      const data = await getPerfil();
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
      const data = await searchPerfil(req.params.search);
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
