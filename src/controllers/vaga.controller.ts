import {
  especialidadesVaga,
  esperaVaga,
  returnVaga,
  statusVaga,
  tipoSessoesVaga,
  updateEspecialidadeVaga,
  updateReturn,
  updateVaga,
} from '../services/vaga.service';
import { messageUpdate } from '../utils/message.response';

export class vagaController {
  static update = async (req: any, res: any, next: any) => {
    try {
      const data = await updateVaga(req.body);

      const message = {
        data: data ? 'Paciente ainda na fila' : 'Paciente saiu da fila',
      };

      res.status(200).json(messageUpdate(message));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static updateEspecialidadeVaga = async (req: any, res: any, next: any) => {
    try {
      const data = await updateEspecialidadeVaga(
        req.body.vagaId,
        req.body.especialidadeId
      );

      const message = {
        data: data ? 'Paciente ainda na fila' : 'Paciente saiu da fila',
      };

      res.status(200).json(messageUpdate(message));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static dashboard = async (req: any, res: any, next: any) => {
    try {
      let data;
      switch (req.params.type) {
        case 'tipoSessoes':
          data = await tipoSessoesVaga();
          break;
        case 'especialidades':
          data = await especialidadesVaga();
          break;
        case 'status':
          data = await statusVaga();
          break;
      }

      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };

  static wait = async (req: any, res: any, next: any) => {
    try {
      const data = await esperaVaga();
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static returnTrend = async (req: any, res: any, next: any) => {
    try {
      const data = await returnVaga();
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static updateReturn = async (req: any, res: any, next: any) => {
    try {
      const data = await updateReturn(req.body);
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
}
