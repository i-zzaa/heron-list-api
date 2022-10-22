import createError from 'http-errors';
import {
  createConvenio,
  getConvenio,
  searchConvenio,
  updateConvenio,
} from '../services/convenio.service';

export class convenioController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const body = req.body;
      body.ativo = true;
      const data = await createConvenio(req.body);
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
      const data = await updateConvenio(req.body, req.params.id);
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
      const data = await getConvenio();
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
      const data = await searchConvenio(req.params.search);
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
