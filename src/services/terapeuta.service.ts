import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import momentBusinessDays from 'moment-business-days';
import { FERIADOS, HOURS, weekDay } from '../utils/convert-hours';

import { parseISO, addHours, isAfter, isBefore } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
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

function horaEstaEntre(hora: string, horaInicio: string) {
  const horaObj = moment(hora, 'HH:mm').subtract(30, 'minute');
  const horaFimObj = moment(hora, 'HH:mm').add(1, 'hours');

  const horaInicioObj = moment(horaInicio, 'HH:mm');

  return horaInicioObj.isBetween(horaObj, horaFimObj);
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
  const end = momentBusinessDays(endDate).nextBusinessDay();

  console.log('inicio', start, end);

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
        terapeutaId: terapeutaId,
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

  if (!Boolean(terapeuta)) {
    throw new Error('Terapeuta não encontrado');
  }

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

    const dataFim = ev.dataFim || endDate;
    const datasRecorrentes = obterDatas(
      ev.diasFrequencia,
      ev.dataInicio,
      dataFim,
      ev.intervalo.id
    );

    datasRecorrentes.map((dataRecorrentes: string) => {
      ev.date = moment(dataRecorrentes).format('YYYY-MM-DD');
      if (Boolean(eventosFormatados[dataRecorrentes])) {
        eventosFormatados[dataRecorrentes].push(ev);
      } else {
        eventosFormatados[dataRecorrentes] = [ev];
      }
    });
  });

  // console.log(eventosFormatados);

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
      const date = moment(`${day}T${h}:00`);

      const hoursFinal = moment(`${day}T${h}:00`).add(1, 'hours');
      const hoursFinalFormat = hoursFinal.format('HH:mm');

      const eventoAdd = {
        ...eventFree,
        dataInicio: day,
        dataFim: day,
        start: h,
        startTime: h,
        time: `${h} - ${hoursFinalFormat}`,
        end: hoursFinalFormat,
        endTime: hoursFinalFormat,
        date: day,
        terapeuta: {
          nome: terapeuta?.usuario?.nome || '',
          id: terapeuta?.usuario?.id || '',
        },
        localidade: { nome: 'Sem Localizacao', id: 0 },
        statusEventos: { nome: 'Não criado', id: 0 },
        disabled: true,
        isDevolutiva: false,
        rrule: {
          dtstart: date.format('YYYY-MM-DD HH:mm'),
          until: hoursFinal.format('YYYY-MM-DD HH:mm'),
          freq: 'weekly',
        },
      };

      const eventosDoDia = eventosFormatados[day] || [];

      if (
        date.isAfter(new Date()) &&
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
          horaEstaEntre(h, e.data.start)
        )[0];

        if (Boolean(sessao)) {
          const isInPast = isAfter(
            parseISO(`${day} ${sessao.data.dataFim}`),
            new Date()
          );

          sessao.isDevolutiva = sessao.modalidade.nome === 'Devolutiva';
          sessao.time = `${sessao.data.start} - ${sessao.data.end}`;
          sessao.disabled =
            isInPast ||
            sessao.statusEventos.nome.includes('Cancelado') ||
            sessao.statusEventos.nome == 'Atendido';

          if (Boolean(mobileArray[day])) {
            mobileArray[day].push(sessao);
          } else {
            mobileArray[day] = [sessao];
          }

          webArray.push(sessao);
        } else if (horariosTerapeuta[h] && date.isAfter(new Date())) {
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
