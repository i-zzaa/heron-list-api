import { filterSinglePatients } from '../services/patient.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ListProps {
  id: number;
  nome: string;
}

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
          });
          break;
        case 'status':
          dropdrown = await prisma.status.findMany({
            select: {
              id: true,
              nome: true,
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
          dropdrown = await prisma.paciente.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
        case 'modalidade':
          dropdrown = [];
          dropdrown = await prisma.modalidade.findMany({
            select: {
              id: true,
              nome: true,
            },
          });
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
              nome: `${item.casa} - ${item.sala}`,
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
