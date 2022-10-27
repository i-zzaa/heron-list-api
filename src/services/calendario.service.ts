import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  fomatEventos,
  getDiasDoMes,
  getPrimeiroDoMes,
  getUltimoDoMes,
} from '../utils/convert-hours';
import { getUser } from './user.service';

const prisma = new PrismaClient();

export interface CalendarioProps {
  id: number;
  nome: string;
  ativo: boolean;
}

interface ObjProps {
  nome: string;
  id: number;
}

export interface CalendarioCreateParam {
  dataInicio: string;
  dataFim: string;
  start: string;
  end: string;
  diasFrequencia: string;
  especialidade: ObjProps;
  frequencia: ObjProps;
  funcao: ObjProps;
  localidade: ObjProps;
  modalidade: ObjProps;
  paciente: ObjProps;
  statusEventos: ObjProps;
  terapeuta: any;
  observacao: string;
}

export const getCalendario = async () => {
  return [];
};

export const getMonth = async (params: any) => {
  const inicioDoMes = getPrimeiroDoMes(params.ano, params.mes);
  const ultimoDiaDoMes = getUltimoDoMes(params.ano, params.mes);

  const eventos = await prisma.calendario.findMany({
    select: {
      id: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,

      ciclo: true,
      observacao: true,
      paciente: true,
      modalidade: true,
      especialidade: true,
      terapeuta: true,
      funcao: true,
      localidade: true,
      statusEventos: true,
      frequencia: true,
    },
    where: {
      dataInicio: {
        lte: ultimoDiaDoMes, // menor que o ultimo dia do mes
        // gte: inicioDoMes, // maior que o primeiro dia do mes
      },
      OR: [
        {
          dataFim: '',
        },
        {
          dataFim: {
            // lte: ultimoDiaDoMes, // menor que o ultimo dia do mes
            gte: inicioDoMes, // maior que o primeiro dia do mes
          },
        },
      ],
    },
  });

  const eventosFormat: any = [];
  eventos.map((evento: any) => {
    const intervalo = 1; //evento.intervalo
    switch (evento.frequencia.nome) {
      case 'Semanal':
        evento.diasFrequencia = evento.diasFrequencia.split(',');

        const formated = fomatEventos(
          evento,
          params.ano,
          params.mes,
          intervalo
        );
        eventosFormat.push(...formated);
        break;

      default:
        break;
    }
  });

  return eventosFormat;
};

export const getWeek = async (params: any) => {
  return [];
};

export const getDay = async (params: any) => {
  return [];
};

export const createCalendario = async (
  body: CalendarioCreateParam,
  login: string
) => {
  const user = await getUser(login);

  const evento = await prisma.calendario.create({
    data: {
      dataInicio: body.dataInicio,
      dataFim: body.dataFim,
      start: body.start,
      end: body.end,
      diasFrequencia: body.diasFrequencia,

      ciclo: 'ativo',
      observacao: body.observacao,
      pacienteId: body.paciente.id,
      modalidadeId: body.modalidade.id,
      especialidadeId: body.especialidade.id,
      terapeutaId: body.terapeuta.id,
      funcaoId: body.funcao.id,
      localidadeId: body.localidade.id,
      statusEventosId: body.statusEventos.id,
      frequenciaId: body.frequencia.id,

      usuarioId: user.id,
    },
  });

  return evento;
};

export const updateCalendario = async (body: CalendarioProps) => {
  return [];
};

export const deleteCalendario = async (id: number) => {
  return [];
};
