import { filterSinglePatients } from '../services/patient.service';
import { PrismaClient } from '@prisma/client';
import { formatLocalidade } from '../services/localidade.service';

const prisma = new PrismaClient();

export interface ListProps {
  id: number;
  nome?: string;
  cod?: string;
  descricao?: string;
}

const setFilterStatusPacienteId = (statusPacienteId: number) => {
  switch (statusPacienteId) {
    case 1:
      return [1, 4];
    case 2:
      return [2, 3];
    case 3:
      return [3, 4, 5];
    case 4:
      return [4];
    case 5:
      return [5];
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
                nome: 'Terapia ABA',
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
                nome: Number(query.statusPacienteId) === 1 ? 'Voltou ABA' : '',
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
            Number(query.statusPacienteId) === 1 ? 'vaga' : 'vagaTerapia';

          help = await prisma.paciente.findUniqueOrThrow({
            select: {
              emAtendimento: true,
              [vaga]: {
                include: {
                  especialidades: {
                    include: {
                      especialidade: true,
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
          help = setFilterStatusPacienteId(Number(query.statusPacienteId));
          dropdrown = await prisma.paciente.findMany({
            select: {
              id: true,
              nome: true,
            },
            where: {
              statusPacienteId: {
                in: help,
              },
            },
          });
          break;
        case 'modalidade':
          dropdrown = [];
          dropdrown = await prisma.modalidade.findMany({
            select: {
              id: true,
              nome: true,
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
