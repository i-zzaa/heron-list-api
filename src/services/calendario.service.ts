import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  formatadataPadraoBD,
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
  groupId: number;
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
      // groupId: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,
      exdate: true,

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
      // groupId: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,
      ciclo: true,
      observacao: true,
      exdate: true,
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
      groupId: body.groupId || 0,
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

export const updateCalendario = async (body: any, login: string) => {
  let dataFim = moment(body.dataAtual).subtract(1, 'days').format('YYYY-MM-DD');
  if (body.statusEventos.nome === 'Cancelado' && !body?.dataFim) {
    body.dataFim = dataFim;
  }

  const eventoUnico = await prisma.calendario.findFirstOrThrow({
    where: {
      id: body.id,
    },
  });

  let evento;
  switch (true) {
    case body.frequencia.nome === 'Único':
      evento = await prisma.calendario.updateMany({
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
      break;
    case body.changeAll && dataFim !== eventoUnico.dataInicio:
      evento = await prisma.calendario.updateMany({
        data: {
          dataFim,
        },
        where: {
          id: body.id,
        },
      });

      await createCalendario(
        {
          ...body,
          dataInicio: body.dataInicio,
        },
        login
      );
      break;
    case body.changeAll && dataFim === eventoUnico.dataInicio:
      evento = await prisma.calendario.updateMany({
        data: {
          ...body,
        },
        where: {
          id: body.id,
        },
      });
      break;
    case !body.changeAll:
      const exdate = eventoUnico.exdate;
      exdate.push(formatDateTime(body.start, body.dataAtual));
      evento = await prisma.calendario.updateMany({
        data: {
          exdate: exdate,
        },
        where: {
          id: body.id,
        },
      });

      await createCalendario(
        {
          ...body,
          frequencia: '',
        },
        login
      );
      break;
    default:
      break;
  }

  return evento;
};

export const deleteCalendario = async (id: number) => {
  return [];
};

const formatEvents = async (eventos: any) => {
  const eventosFormat: any = [];
  eventos.map((evento: any) => {
    let formated: any = {};
    const cor =
      evento.statusEventos.nome === 'Cancelado'
        ? '#f87171'
        : evento.especialidade.cor;
    delete evento.especialidade.cor;

    evento.localidade = {
      nome: formatLocalidade(evento.localidade),
      id: evento.localidade.id,
    };

    evento.terapeuta = {
      nome: evento.terapeuta.usuario.nome,
      id: evento.terapeuta.usuario.id,
    };

    // const groupId =
    //   evento?.groupId && evento?.groupId !== 0 ? evento.groupId : evento.id;

    switch (true) {
      case evento.diasFrequencia.length && evento.intervalo.id === 1: // com dias selecionados e todas semanas
        formated = {
          ...evento,
          data: {
            start: evento.start,
            end: evento.end,
          },
          title: evento.paciente.nome,

          groupId: evento.id,
          daysOfWeek: evento.diasFrequencia,
          start: formatDateTime(evento.start, evento.dataInicio),
          end: formatDateTime(evento.end, evento.dataInicio),

          borderColor: cor,
          backgroundColor: cor,
          exdate: evento.exdate,
          rrule: {
            freq: 'weekly',
            byweekday: evento.diasFrequencia,
            dtstart: formatDateTime(evento.start, evento.dataInicio),
          },
        };
        break;
      case evento.diasFrequencia.length && evento.intervalo.id !== 1: // com dias selecionados e intervalos
        formated = {
          ...evento,
          data: {
            start: evento.start,
            end: evento.end,
          },
          title: evento.paciente.nome,
          groupId: evento.id,
          borderColor: cor,
          backgroundColor: cor,

          exdate: evento.exdate,

          rrule: {
            freq: 'weekly',
            interval: evento.intervalo.id,
            byweekday: evento.diasFrequencia,
            dtstart: formatDateTime(evento.start, evento.dataInicio),
          },
        };
        break;

      default: // evento unico
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
