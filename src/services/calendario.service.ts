import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  formatDateTime,
  getDiasDoMes,
  getPrimeiroDoMes,
  getUltimoDoMes,
} from '../utils/convert-hours';
import { getFrequenciaName } from './frequencia.service';
import { formatLocalidade } from './localidade.service';
import { setPacienteEmAtendimento } from './patient.service';
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
  usuarioId?: number;
}

export interface CalendarioCreateParam {
  dataInicio: string;
  dataFim: string;
  start: string;
  end: string;
  diasFrequencia: number[];
  especialidade: ObjProps;
  frequencia: any;
  funcao: ObjProps;
  localidade: ObjProps;
  modalidade: ObjProps;
  paciente: ObjProps;
  statusEventos: ObjProps;
  intervalo: ObjProps;
  terapeuta: any;
  observacao: string;
}

export const getCalendario = async () => {
  return [];
};

export const geFilter = async (params: any, query: any) => {
  const inicioDoMes = getPrimeiroDoMes(params.ano, params.mes);
  const ultimoDiaDoMes = getUltimoDoMes(params.ano, params.mes);

  const filter: any = {};
  Object.keys(query).map((key: string) => (filter[key] = Number(query[key])));

  const eventos = await prisma.calendario.findMany({
    select: {
      id: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,
      groupId: true,

      ciclo: true,
      observacao: true,
      paciente: {
        select: {
          nome: true,
          id: true,
        },
      },
      modalidade: {
        select: {
          nome: true,
          id: true,
        },
      },
      especialidade: true,
      terapeuta: {
        select: {
          usuario: {
            select: {
              nome: true,
              id: true,
            },
          },
        },
      },
      funcao: {
        select: {
          nome: true,
          id: true,
        },
      },
      localidade: true,
      statusEventos: {
        select: {
          nome: true,
          id: true,
        },
      },
      frequencia: {
        select: {
          nome: true,
          id: true,
        },
      },
      intervalo: {
        select: {
          nome: true,
          id: true,
        },
      },
    },
    where: {
      ...filter,

      dataInicio: {
        lte: ultimoDiaDoMes, // menor que o ultimo dia do mes
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
      // pacienteId: Number(query?.pacientes),
      // statusEventosId: Number(query?.statusEventos),
    },
  });

  const eventosFormat = await formatEvents(eventos);
  return eventosFormat;
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
      groupId: true,
      ciclo: true,
      observacao: true,
      paciente: {
        select: {
          nome: true,
          id: true,
        },
      },
      modalidade: {
        select: {
          nome: true,
          id: true,
        },
      },
      especialidade: true,
      terapeuta: {
        select: {
          usuario: {
            select: {
              nome: true,
              id: true,
            },
          },
        },
      },
      funcao: {
        select: {
          nome: true,
          id: true,
        },
      },
      localidade: true,
      statusEventos: {
        select: {
          nome: true,
          id: true,
        },
      },
      frequencia: {
        select: {
          nome: true,
          id: true,
        },
      },
      intervalo: {
        select: {
          nome: true,
          id: true,
        },
      },
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

  const eventosFormat = await formatEvents(eventos);
  return eventosFormat;
};

export const createCalendario = async (
  body: CalendarioCreateParam,
  login: string
) => {
  const user = await getUser(login);
  const frequencia: ObjProps =
    body.frequencia === '' ? await getFrequenciaName('Único') : body.frequencia;

  if (frequencia?.nome === 'Único') {
    body.dataFim = body.dataInicio;
    body.diasFrequencia = [];
    body.intervalo = {
      id: 1,
      nome: '1 Semana',
    };
  }

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
      frequenciaId: frequencia.id,
      intervaloId: body.intervalo.id,

      usuarioId: user.id,
    },
  });

  return evento;
};

export const updateCalendario = async (body: any) => {
  const evento = await prisma.calendario.updateMany({
    data: {
      dataInicio: body?.dataInicio,
      dataFim: body?.dataFim,
      start: body?.start,
      end: body?.end,
      ciclo: body?.ciclo,
      observacao: body?.observacao,
      pacienteId: body?.paciente?.id,
      modalidadeId: body?.modalidade?.id,
      especialidadeId: body?.especialidade?.id,
      terapeutaId: body?.terapeuta?.id,
      funcaoId: body?.funcao?.id,
      localidadeId: body?.localidade?.id,
      statusEventosId: body?.statusEventos?.id,
      frequenciaId: body?.frequencia?.id,
      intervaloId: body?.intervalo?.id,
      diasFrequencia: body?.diasFrequencia,
    },
    where: {
      id: body.id,
    },
  });

  return evento;
};

export const deleteCalendario = async (id: number) => {
  return [];
};

const formatEvents = async (eventos: any) => {
  const eventosFormat: any = [];
  eventos.map((evento: any) => {
    let formated: any = {};
    const cor = evento.especialidade.cor;
    delete evento.especialidade.cor;

    evento.localidade = {
      nome: formatLocalidade(evento.localidade),
      id: evento.localidade.id,
    };

    evento.terapeuta = {
      nome: evento.terapeuta.usuario.nome,
      id: evento.terapeuta.usuario.id,
    };

    const groupId =
      evento?.groupId && evento?.groupId !== 0 ? evento.groupId : evento.id;

    switch (true) {
      case evento.diasFrequencia.length && evento.intervalo.id === 1: // com dias selecionados e todas semanas
        formated = {
          ...evento,
          data: {
            start: evento.start,
            end: evento.end,
          },
          title: evento.paciente.nome,
          startRecur: evento.dataInicio,
          endRecur: moment(evento.dataFim).add(1, 'days'),
          groupId: groupId, // recurrent events in this group move together
          daysOfWeek: evento.diasFrequencia,
          start: formatDateTime(evento.start, evento.dataInicio),
          end: formatDateTime(evento.end, evento.dataInicio),
          startTime: evento.start,
          endTime: evento.end,
          borderColor: cor,
          backgroundColor: cor,
        };
        break;
      case evento.diasFrequencia.length && evento.intervalo.id !== 1:
        formated = {
          ...evento,
          data: {
            start: evento.start,
            end: evento.end,
          },
          title: evento.paciente.nome,
          groupId: groupId, // recurrent events in this group move together
          borderColor: cor,
          backgroundColor: cor,
          startTime: formatDateTime(evento.start, evento.dataInicio),
          endTime: formatDateTime(evento.end, evento.dataInicio),
          rrule: {
            freq: 'weekly',
            interval: 2,
            byweekday: evento.diasFrequencia,
            dtstart: formatDateTime(evento.start, evento.dataInicio), // will also accept '20120201T103000'
          },
        };
        break;

      default:
        formated = {
          ...evento,
          data: {
            start: evento.start,
            end: evento.end,
          },
          title: evento.paciente.nome,
          date: evento.dataInicio,
          start: formatDateTime(evento.start, evento.dataInicio),
          end: formatDateTime(evento.end, evento.dataInicio),
          borderColor: cor,
          backgroundColor: cor,
        };
        break;
    }
    eventosFormat.push(formated);
  });

  return eventosFormat;
};
