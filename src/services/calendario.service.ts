import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  formatDateTime,
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
  diasFrequencia: number[];
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
      intervalo: true,
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
    let formated: any = {};
    switch (true) {
      case !!evento.diasFrequencia && !evento.intervalo:
        formated = {
          ...evento,
          title: evento.paciente.nome,
          groupId: evento.id, // recurrent events in this group move together
          daysOfWeek: evento.diasFrequencia,
          startTime: evento.start,
          endTime: evento.end,
          borderColor: evento.especialidade.cor,
          backgroundColor: evento.especialidade.cor,
        };
        break;
      case evento.intervalo && evento.intervalo.id !== 1:
        const frequencia = evento.diasFrequencia
          .split(',')
          .map((item: string) => parseInt(item) - 1);

        formated = {
          ...evento,
          title: evento.paciente.nome,
          groupId: evento.id, // recurrent events in this group move together
          borderColor: evento.especialidade.cor,
          backgroundColor: evento.especialidade.cor,

          rrule: {
            freq: 'weekly',
            interval: 2,
            byweekday: frequencia,
            dtstart: formatDateTime(evento.start, evento.dataInicio), // will also accept '20120201T103000'
            // until: '2012-06-01' // will also accept '20120201'
          },
        };
        break;

      default:
        formated = {
          ...evento,
          title: evento.paciente.nome,
          date: evento.dataInicio,
          start: formatDateTime(evento.start, evento.dataInicio),
          end: formatDateTime(evento.end, evento.dataInicio),
          borderColor: evento.especialidade.cor,
          backgroundColor: evento.especialidade.cor,
        };
        break;
    }
    eventosFormat.push(formated);
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

  if (body.frequencia.nome === 'Unico') {
    body.dataFim = body.dataInicio;
    body.diasFrequencia = [];
  }

  const evento = await prisma.calendario.create({
    data: {
      dataInicio: body.dataInicio,
      dataFim: body.dataFim,
      start: formatDateTime(body.start, body.dataInicio),
      end: formatDateTime(body.end, body.dataInicio),
      diasFrequencia: body.diasFrequencia.join(','),

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

// const fomatEventos = (evento: any, ano: number, mes: number) => {
//   const date = evento.dataInicio;
//   const ultimoDiaDoMesFomat = getUltimoDoMes(ano, mes);
//   const diasUteisDoMes = getDiasDoMes(ano, mes - 1);
//   const diasFrequencia: number[] = evento.diasFrequencia;

//   const intervaloCalc = 7 * evento.intervalo.id;
//   const arrDatasEventos: any = [];
//   let newDate = date;

//   while (newDate !== ultimoDiaDoMesFomat) {
//     if (diasFrequencia.length > 1) {
//       let dataDiasFrequencia = newDate;
//       for (let index = 0; index < diasFrequencia.length; index++) {
//         let indice = index;
//         const diff =
//           index === 0 ? 0 : diasFrequencia[index] - diasFrequencia[--indice];

//         const dataFrequencia = moment(dataDiasFrequencia)
//           .add(diff, 'd')
//           .format('YYYY-MM-DD');

//         if (diasUteisDoMes.includes(dataFrequencia)) {
//           arrDatasEventos.push({
//             ...evento,
//             title: evento.paciente.nome,
//             start: formatDateTime(evento.start, dataFrequencia),
//             end: formatDateTime(evento.end, dataFrequencia),
//             borderColor: evento.especialidade.cor,
//             backgroundColor: evento.especialidade.cor,
//             daysOfWeek: evento.diasFrequencia,
//           });
//         }

//         dataDiasFrequencia = dataFrequencia;
//       }
//     } else {
//       const newDateFomat = newDate.format('YYYY-MM-DD');
//       if (diasUteisDoMes.includes(newDateFomat)) {
//         arrDatasEventos.push({
//           ...evento,
//           title: evento.paciente.nome,
//           start: formatDateTime(evento.start, newDate),
//           end: formatDateTime(evento.end, newDate),
//           borderColor: evento.especialidade.cor,
//           backgroundColor: evento.especialidade.cor,
//           daysOfWeek: evento.diasFrequencia,
//         });
//       }
//     }
//     newDate = moment(newDate).add(intervaloCalc, 'd').format('YYYY-MM-DD');
//   }

//   return arrDatasEventos;
// };
