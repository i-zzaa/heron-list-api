import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import momentBusinessDays from 'moment-business-days';
import { FERIADOS, HOURS, weekDay } from '../utils/convert-hours';

import { parseISO, format, addHours, isAfter } from 'date-fns';
import { formatEvents } from './calendario.service';

momentBusinessDays.updateLocale('pt', {
  holidays: FERIADOS,
  holidayFormat: 'YYYY-MM-DD',
  workingWeekdays: [1, 2, 3, 4, 5, 6],
  formatEvents,
});

const prisma = new PrismaClient();

const eventFree = {
  id: 0,
  dataInicio: '2023-02-24',
  dataFim: '2023-02-27',
  start: '20:55',
  end: '21:55',
  observacao: '',
  paciente: {
    nome: 'Livre',
    id: 1,
  },
  modalidade: {
    nome: 'Livre',
    id: 1,
  },
  especialidade: {
    id: 2,
    nome: 'Fono',
  },
  terapeuta: {
    nome: 'TERAPEUTA FONO',
    id: 5,
  },
  funcao: {
    nome: 'Funcao 2',
    id: 2,
  },
  localidade: {
    nome: 'Casa 1 - Sala 2',
    id: 2,
  },
  statusEventos: {
    nome: 'Confirmar',
    id: 1,
  },
  frequencia: {
    nome: 'Único',
    id: 1,
  },
  data: {
    start: '20:55',
    end: '21:55',
  },
  title: 'Livre',
  groupId: 3,
  daysOfWeek: [],
  startTime: '20:55',
  endTime: '21:55',
  borderColor: 'green',
  backgroundColor: 'green',
  rrule: {
    freq: 'weekly',
    dtstart: '2023-02-24 20:55',
    until: '2023-02-27 20:55',
  },
};

function horaEstaEntre(hora: string, horaInicio: string, horaFim: string) {
  const horaObj = moment(hora, 'HH:mm');
  const horaInicioObj = moment(horaInicio, 'HH:mm');
  const horaFimObj = moment(horaFim, 'HH:mm');

  return horaObj.isBetween(horaInicioObj, horaFimObj);
}

function obterDatas(
  diasDaSemana: string[],
  startDate: string,
  endDate: string,
  intervaloSemana: number = 1
) {
  // Crie uma matriz para armazenar as datas
  let datas: string[] = [];

  // Defina a data de início e a data final como objetos moment
  const start = momentBusinessDays(startDate);
  const end = momentBusinessDays(endDate);

  // Defina um objeto moment para a próxima ocorrência do dia da semana especificado após a data de início
  let dataAtual = start;

  // Itere enquanto a data atual for menor ou igual à data final
  while (dataAtual.isSameOrBefore(end)) {
    // Adicione a data atual à matriz de datas

    if (diasDaSemana.length) {
      let diasPercorridos = 0;
      diasDaSemana.map((day: string) => {
        if (parseInt(day) == dataAtual.day()) {
          datas.push(dataAtual.format('YYYY-MM-DD'));
          dataAtual.nextBusinessDay();
          diasPercorridos++;
        }
      });

      if (diasPercorridos > 1) dataAtual.businessSubtract(diasPercorridos);
    } else {
      datas.push(dataAtual.format('YYYY-MM-DD'));
    }

    switch (intervaloSemana) {
      case 1:
        dataAtual = dataAtual.businessAdd(5);
        break;
      case 2:
        dataAtual = dataAtual.businessAdd(10);
        break;
      case 3:
        dataAtual = dataAtual.businessAdd(15);
        break;
    }
  }

  // Retorne a matriz de datas
  return datas;
}

function getDatesBetween(start: string, end: string) {
  // Defina a data de início e a data final como objetos moment
  const startDate = momentBusinessDays(start);
  const endDate = momentBusinessDays(end).add(1, 'days');

  // Obtenha todas as datas úteis entre a data de início e a data final usando o método businessDates

  const datasUteis = [];
  const diff = endDate.businessDiff(startDate);
  for (let index = 0; index <= diff; index++) {
    datasUteis.push(startDate.businessAdd(index).format('YYYY-MM-DD'));
  }

  // Imprima as datas úteis
  // console.log('Datas úteis:', datasUteis);
  return datasUteis;
}

export async function getAvailableTimes(
  startDate: string,
  endDate: string,
  query: any,
  device: string
) {
  const filter: any = {};
  Object.keys(query).map((key: string) => (filter[key] = Number(query[key])));

  const terapeutaId = parseInt(query.terapeutaId);
  const [terapeuta, events, datas] = await Promise.all([
    prisma.terapeuta.findUnique({
      select: {
        especialidade: true,
        cargaHoraria: true,
        usuario: {
          select: {
            nome: true,
            id: true,
          },
        },
      },
      where: {
        usuarioId: terapeutaId,
      },
    }),
    prisma.calendario.findMany({
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
        ...filter,
        terapeutaId: 6,
        dataInicio: {
          lte: endDate, // menor que o ultimo dia do mes
          // gte: inicioDoMes, // maior que o primeiro dia do mes
        },
        OR: [
          {
            dataFim: '',
          },
          {
            dataFim: {
              // lte: ultimoDiaDoMes, // menor que o ultimo dia do mes
              gte: startDate, // maior que o primeiro dia do mes
            },
          },
        ],
      },
    }),
    getDatesBetween(startDate, endDate),
  ]);

  const eventosFormat = await formatEvents(events);

  const eventosFormatados: any = {};
  eventosFormat.flatMap((ev: any) => {
    if (ev.frequencia.id === 1) {
      if (Boolean(eventosFormatados[ev.dataInicio])) {
        eventosFormatados[ev.dataInicio].push(ev);
      } else {
        eventosFormatados[ev.dataInicio] = [ev];
      }

      return;
    }

    const dataFim = ev.dataInicio || endDate;
    const datasRecorrentes = obterDatas(
      ev.diasFrequencia,
      ev.dataInicio,
      dataFim,
      ev.intervalo.id
    );

    datasRecorrentes.map((dataRecorrentes: string) => {
      if (Boolean(eventosFormatados[dataRecorrentes])) {
        eventosFormatados[dataRecorrentes].push(ev);
      } else {
        eventosFormatados[dataRecorrentes] = [ev];
      }
    });
  });

  let cargaHoraria: any =
    terapeuta?.cargaHoraria && typeof terapeuta.cargaHoraria === 'string'
      ? JSON.parse(terapeuta.cargaHoraria)
      : {};

  const mobileArray: any = {};
  const webArray: any = [];

  datas.map((day: any) => {
    const dateEvent = new Date(day);
    const dayOfWeek = weekDay[dateEvent.getDay()];
    const horariosTerapeuta = cargaHoraria[dayOfWeek];

    HOURS.map((h) => {
      const date = parseISO(`${day} ${h}`);
      const hoursFinal = addHours(date, 1);

      const eventoAdd = {
        ...eventFree,
        dataInicio: day,
        dataFim: day,
        start: h,
        startTime: h,
        end: format(hoursFinal, 'HH:mm'),
        endTime: format(hoursFinal, 'HH:mm'),
        date: day,
        terapeuta: terapeuta,
        rrule: {
          dtstart: format(date, ' yyyy-MM-dd HH:mm'),
          until: format(hoursFinal, ' yyyy-MM-dd HH:mm'),
          freq: 'weekly',
        },
      };

      const eventosDoDia = eventosFormatados[day] || [];

      if (
        isAfter(date, new Date()) &&
        horariosTerapeuta[h] &&
        !eventosDoDia.length
      ) {
        if (Boolean(mobileArray[day])) {
          mobileArray[day].push(eventoAdd);
        } else {
          mobileArray[day] = [eventoAdd];
        }

        webArray.push(eventoAdd);
      }

      if (eventosDoDia.length) {
        const sessao = eventosDoDia.filter((e: any) =>
          horaEstaEntre(h, e.start, e.end)
        )[0];

        if (Boolean(sessao)) {
          if (Boolean(mobileArray[day])) {
            mobileArray[day].push(sessao);
          } else {
            mobileArray[day] = [sessao];
          }

          webArray.push(sessao);
        } else if (horariosTerapeuta[h]) {
          if (Boolean(mobileArray[day])) {
            mobileArray[day].push(eventoAdd);
          } else {
            mobileArray[day] = [eventoAdd];
          }

          webArray.push(eventoAdd);
        }
      }
    });
  });

  return device === 'mobile' ? mobileArray : webArray;
}
