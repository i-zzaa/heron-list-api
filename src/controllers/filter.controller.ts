import { filterSinglePatients } from '../services/patient.service';
import { PrismaClient } from '@prisma/client';
import { formatLocalidade } from '../services/localidade.service';
import { STATUS_PACIENT_COD } from '../constants/patient';

const prisma = new PrismaClient();

export interface ListProps {
  id: number;
  nome?: string;
  cod?: string;
  descricao?: string;
}

const setFilterstatusPacienteCod = (statusPacienteCod: string) => {
  switch (statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return [
        STATUS_PACIENT_COD.queue_avaliation,
        STATUS_PACIENT_COD.avaliation,
      ];
    case STATUS_PACIENT_COD.queue_therapy:
      return [
        STATUS_PACIENT_COD.queue_therapy,
        // STATUS_PACIENT_COD.therapy,
        STATUS_PACIENT_COD.devolutiva,
      ];
    case STATUS_PACIENT_COD.therapy:
      return [
        STATUS_PACIENT_COD.queue_avaliation,
        STATUS_PACIENT_COD.queue_devolutiva,
        STATUS_PACIENT_COD.queue_therapy,

        STATUS_PACIENT_COD.therapy,
        STATUS_PACIENT_COD.avaliation,
        STATUS_PACIENT_COD.devolutiva,
        STATUS_PACIENT_COD.crud_therapy,
      ];
    case STATUS_PACIENT_COD.avaliation:
      return [STATUS_PACIENT_COD.avaliation];

    case STATUS_PACIENT_COD.crud_therapy:
      return [STATUS_PACIENT_COD.therapy, STATUS_PACIENT_COD.crud_therapy];

    case STATUS_PACIENT_COD.queue_devolutiva:
      return [
        STATUS_PACIENT_COD.queue_devolutiva,
        STATUS_PACIENT_COD.devolutiva,
      ];
    case STATUS_PACIENT_COD.devolutiva:
      return [STATUS_PACIENT_COD.devolutiva];
  }
};

export class filterController {
  static filter = async (req: any, res: any, next: any) => {
    try {
      let data: any = [];
      switch (req.params.type) {
        case 'pacientes':
          data = await filterSinglePatients(req.body);
          break;
      }

      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };

  static dropdown = async (req: any, res: any, next: any) => {
    try {
      const type = req.params.type;
      const query = req.query;

      let help: any;
      let dropdrown: ListProps[] = [];
      switch (type) {
        case 'perfil':
          dropdrown = await prisma.perfil.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              NOT: {
                nome: {
                  in: ['Developer', 'developer'],
                },
              },
            },
          });
          break;
        case 'permissao':
          dropdrown = await prisma.permissao.findMany({
            select: {
              id: true,
              cod: true,
              descricao: true,
            },
          });
          break;
        case 'terapeuta':
          dropdrown = await prisma.usuario.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              perfil: {
                nome: 'Terapeuta',
              },
              ativo: true,
            },
          });
          break;
        case 'usuario':
          dropdrown = await prisma.usuario.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              NOT: {
                perfil: {
                  nome: {
                    in: ['Developer', 'developer'],
                  },
                },
              },
            },
          });
          break;
        case 'tipo-sessao':
          dropdrown = await prisma.tipoSessao.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              NOT: {
                nome: 'Terapia',
              },
            },
          });
          break;
        case 'status':
          dropdrown = await prisma.status.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              NOT: {
                nome:
                  query.statusPacienteCod ===
                  STATUS_PACIENT_COD.queue_avaliation
                    ? 'Voltou ABA'
                    : '',
              },
            },
          });
          break;
        case 'especialidade':
          dropdrown = await prisma.especialidade.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
          break;
        case 'paciente-especialidade':
          const vaga =
            query.statusPacienteCod === STATUS_PACIENT_COD.queue_avaliation ||
            query.statusPacienteCod === STATUS_PACIENT_COD.queue_devolutiva
              ? 'vaga'
              : 'vagaTerapia';

          help = await prisma.paciente.findUniqueOrThrow({
            select: {
              emAtendimento: true,
              [vaga]: {
                include: {
                  especialidades: {
                    include: {
                      especialidade: true,
                    },
                    where: {
                      agendado:
                        query.statusPacienteCod ===
                        STATUS_PACIENT_COD.queue_devolutiva,
                    },
                  },
                },
              },
            },
            where: {
              id: Number(query.pacienteId),
            },
          });

          dropdrown = help[vaga].especialidades.map((especialidade: any) => {
            return {
              id: especialidade.especialidade.id,
              nome: especialidade.especialidade.nome,
            };
          });

          break;
        case 'paciente-terapeuta':
          help = await prisma.calendario.findMany({
            select: {
              paciente: true,
            },
            where: {
              terapeutaId: Number(query.terapeutaId),
            },
          });

          dropdrown = help.map((evento: any) => {
            return {
              id: evento.paciente.id,
              nome: evento.paciente.nome,
            };
          });

          break;
        case 'especialidade-funcao':
          dropdrown = await prisma.funcao.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              especialidade: {
                nome: query.especialidade,
              },
            },
          });
          break;
        case 'especialidade-terapeuta':
          help = await prisma.terapeuta.findMany({
            select: {
              usuarioId: true,
              usuario: true,
            },
            where: {
              especialidade: {
                nome: query.especialidade,
              },
            },
          });

          dropdrown = help.map((terapeuta: any) => {
            return {
              id: terapeuta.usuario.id,
              nome: terapeuta.usuario.nome,
            };
          });

          break;
        case 'terapeuta-funcao':
          help = await prisma.terapeutaOnFuncao.findMany({
            select: {
              funcao: true,
            },
            where: {
              terapeutaId: Number(query.terapeutaId),
            },
          });

          dropdrown = help.map(({ funcao }: any) => {
            return {
              id: funcao.id,
              nome: funcao.nome,
            };
          });

          break;
        case 'periodo':
          dropdrown = await prisma.periodo.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
          break;
        case 'convenio':
          dropdrown = await prisma.convenio.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
          break;
        case 'paciente':
          help = setFilterstatusPacienteCod(query.statusPacienteCod);
          dropdrown = await prisma.paciente.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              statusPacienteCod: {
                in: help,
              },
            },
          });
          break;
        case 'modalidade':
          switch (query.statusPacienteCod) {
            case STATUS_PACIENT_COD.queue_avaliation:
              help = [1];
              break;
            case STATUS_PACIENT_COD.queue_devolutiva:
              help = [2];
              break;
            case STATUS_PACIENT_COD.queue_therapy:
            case STATUS_PACIENT_COD.devolutiva:
              help = [3];
              break;
            default:
              help = [1, 2, 3];
              break;
          }

          dropdrown = [];
          dropdrown = await prisma.modalidade.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              id: {
                in: help,
              },
            },
          });
          break;
        case 'statusEventos':
          dropdrown = await prisma.statusEventos.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
          break;
        case 'frequencia':
          dropdrown = await prisma.frequencia.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
          break;
        case 'funcao':
          dropdrown = await prisma.funcao.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
          break;
        case 'intervalo':
          dropdrown = await prisma.intervalo.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
          break;
        case 'localidade':
          help = await prisma.localidade.findMany({
            select: {
              id: true,
              casa: true,
              sala: true,
            },
          });

          dropdrown = help.map((item: any) => {
            return {
              id: item.id,
              nome: formatLocalidade(item),
            };
          });
          break;
      }

      res.status(200).json(dropdrown);
    } catch (error) {
      res.status(500).json(error);
      next();
    }
  };
}
