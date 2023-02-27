import createError from 'http-errors';
import {
  createCalendario,
  deleteCalendario,
  getFilter,
  getRange,
  updateCalendario,
  updateCalendarioMobile,
} from '../services/calendario.service';
import { getAvailableTimes } from '../services/terapeuta.service';
import { getPrimeiroDoMes, getUltimoDoMes } from '../utils/convert-hours';

export class calendarioController {
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
      // let data: any;
      // if (req.headers.device === 'mobile') {
      //   data = await updateCalendarioMobile(req.body, req.headers.login);
      // } else {
      // }
      const data = await updateCalendario(req.body, req.headers.login);

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
      // if (req.headers?.device === 'mobile') {
      //   const now = new Date();
      //   const mouth = now.getMonth();
      //   const inicioDoMes = getPrimeiroDoMes(now.getFullYear(), mouth - 1);
      //   const ultimoDiaDoMes = getUltimoDoMes(now.getFullYear(), mouth + 2);

      //   const data = await getAvailableTimes(
      //     req.headers.login,
      //     inicioDoMes,
      //     ultimoDiaDoMes
      //   );
      //   res.status(200).json(data);
      // }

      const data = await getRange(req.params, req.headers?.device);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static getFilter = async (req: any, res: any, next: any) => {
    try {
      let inicioDoMes = req.params.start;
      let ultimoDiaDoMes = req.params.end;

      if (req.headers?.device === 'mobile') {
        const now = new Date();
        const mouth = now.getMonth();
        inicioDoMes = getPrimeiroDoMes(now.getFullYear(), mouth - 1);
        ultimoDiaDoMes = getUltimoDoMes(now.getFullYear(), mouth + 2);
      }

      if (req.query?.terapeutaId) {
        const data = await getAvailableTimes(
          inicioDoMes,
          ultimoDiaDoMes,
          req.query,
          req.headers?.device
        );
        res.status(200).json(data);
      } else {
        const data = await getFilter(req.params, req.query);
        res.status(200).json(data);
      }
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
}
