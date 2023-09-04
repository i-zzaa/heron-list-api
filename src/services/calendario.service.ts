import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { STATUS_PACIENT_COD } from '../constants/patient';
import { formatDateTime, getPrimeiroDoMes } from '../utils/convert-hours';
import { getFrequenciaName } from './frequencia.service';
import { formatLocalidade } from './localidade.service';
import { getUser } from './user.service';
import bcrypt from 'bcryptjs';
import { updateVaga } from './vaga.service';

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
  groupId: string;
  isExterno: boolean;
  km?: string;
}

export const getCalendario = async () => {
  return [];
};

export const getFilter = async (params: any, query: any, login: string) => {
  const inicioDoMes = params.start;
  const ultimoDiaDoMes = params.end;

  const filter: any = {};
  Object.keys(query).map((key: string) => (filter[key] = Number(query[key])));

  const eventos = await prisma.calendario.findMany({
    select: {
      id: true,
      groupId: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,
      exdate: true,
      isExterno: true,
      isChildren: true,
      usuarioId: true,
      km: true,

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

  const eventosFormat = await formatEvents(eventos, login);
  return eventosFormat;
};

export const getFilterFinancialTerapeuta = async ({
  dataInicio,
  dataFim,
  terapeutaId,
}: any) => {
  const eventos = await prisma.calendario.findMany({
    select: {
      id: true,
      groupId: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,
      exdate: true,
      km: true,

      ciclo: true,
      observacao: true,
      paciente: {
        select: {
          nome: true,
          id: true,
          vaga: {
            select: {
              especialidades: true,
            },
          },
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
          funcoes: {
            select: {
              comissao: true,
              tipo: true,
              funcaoId: true,
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
          cobrar: true,
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
      terapeutaId: terapeutaId,
      dataInicio: {
        lte: dataFim, // menor que o ultimo dia do mes
      },
      OR: [
        {
          dataFim: '',
        },
        {
          dataFim: {
            gte: dataInicio, // maior que o primeiro dia do mes
          },
        },
      ],

      // statusEventos: {
      //   cobrar: true,
      // },
    },
    orderBy: {
      paciente: {
        nome: 'asc',
      },
    },
  });

  return eventos;
};

export const getFilterFinancialPaciente = async ({
  dataInicio,
  dataFim,
  pacienteId,
  statusEventosId,
}: any) => {
  const eventos = await prisma.calendario.findMany({
    select: {
      id: true,
      groupId: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,
      exdate: true,
      km: true,

      ciclo: true,
      observacao: true,
      paciente: {
        select: {
          nome: true,
          id: true,
          vaga: {
            select: {
              especialidades: true,
            },
          },
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
          funcoes: {
            select: {
              comissao: true,
              tipo: true,
              funcaoId: true,
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
          cobrar: true,
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
        lte: dataFim, // menor que o ultimo dia do mes
      },
      OR: [
        {
          dataFim: '',
        },
        {
          dataFim: {
            gte: dataInicio, // maior que o primeiro dia do mes
          },
        },
      ],
      pacienteId: pacienteId,
      statusEventosId: statusEventosId,
      // statusEventos: {
      //   cobrar: true,
      // },
    },
    orderBy: {
      terapeuta: {
        usuario: {
          nome: 'asc',
        },
      },
    },
  });

  return eventos;
};

export const getRange = async (params: any, device: string, login: string) => {
  let inicioDoMes = params.start;
  let ultimoDiaDoMes = params.end;

  if (device === 'mobile') {
    const now = new Date();
    const mouth = now.getMonth();
    inicioDoMes = getPrimeiroDoMes(now.getFullYear(), mouth - 1);
    ultimoDiaDoMes = getPrimeiroDoMes(now.getFullYear(), mouth + 2);
  }

  const eventos = await prisma.calendario.findMany({
    select: {
      id: true,
      groupId: true,
      dataInicio: true,
      dataFim: true,
      start: true,
      end: true,
      diasFrequencia: true,
      ciclo: true,
      observacao: true,
      isChildren: true,
      usuarioId: true,
      isExterno: true,
      km: true,
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
      AND: [
        {
          OR: [
            {
              dataFim: '',
            },
            {
              dataFim: {
                gte: inicioDoMes,
              },
            },
          ],
        },
        {
          dataInicio: {
            lte: ultimoDiaDoMes,
          },
        },
      ],
    },
  });

  const eventosFormat = await formatEvents(eventos, login);
  return eventosFormat;
};

const getHashGroupId = async (
  pacienteId: number,
  modalidadeId: number,
  especialidadeId: number,
  funcaoId: number
) => {
  const plaintext = `${pacienteId} ${modalidadeId} ${especialidadeId} ${funcaoId}`;
  const hash = await bcrypt.hash(plaintext, 10);

  return hash;
};

const createEventoDefault = async (
  body: CalendarioCreateParam,
  login: string,
  diasFrequencia: any,
  frequencia: any,
  user: any
) => {
  const hash: string = await getHashGroupId(
    body.paciente.id,
    body.modalidade.id,
    body.especialidade.id,
    body.funcao.id
  );

  const eventData = {
    groupId: hash,
    dataInicio: body.dataInicio,
    km: body?.km,
    dataFim: body.dataFim || '',
    start: body.start,
    end: body.end,
    diasFrequencia: diasFrequencia,
    ciclo: 'ativo',
    observacao: body.observacao || '',
    pacienteId: body.paciente.id,
    modalidadeId: body.modalidade.id,
    especialidadeId: body.especialidade.id,
    terapeutaId: body.terapeuta.id,
    funcaoId: body.funcao.id,
    localidadeId: body.localidade.id,
    statusEventosId: body.statusEventos.id,
    frequenciaId: frequencia.id,
    intervaloId: body.intervalo.id,
    isExterno: !!body.isExterno,
    usuarioId: user.id,
  };

  const evento = await prisma.$transaction([
    prisma.calendario.create({
      data: eventData,
    }),
  ]);

  return evento[0];
};

const createEventoDevolutiva = async (
  body: any,
  login: string,
  diasFrequencia: any,
  frequencia: any,
  user: any
) => {
  const filter = Object.keys(body).filter(
    (key: string) => key.includes('terapeuta') && Object.keys(body[key]).length
  );

  const datas: any[] = await Promise.all(
    filter.map(async (key: string) => {
      const index = key.split('terapeuta')[1];

      const hash: string = await getHashGroupId(
        body.paciente.id,
        body.modalidade.id,
        body[`especialidade${index}`].id,
        body[`funcao${index}`].id
      );

      const data = Object.assign({}, body, {
        terapeuta: { id: body[key].id },
        especialidade: { id: body[`especialidade${index}`].id },
        funcao: { id: body[`funcao${index}`].id },
      });

      return {
        groupId: hash,
        km: data?.km,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        start: data.start,
        end: data.end,
        diasFrequencia: diasFrequencia,
        ciclo: 'ativo',
        observacao: data.observacao || '',
        pacienteId: data.paciente.id,
        modalidadeId: data.modalidade.id,
        especialidadeId: data.especialidade.id,
        terapeutaId: data.terapeuta.id,
        funcaoId: data.funcao.id,
        localidadeId: data.localidade.id,
        statusEventosId: data.statusEventos.id,
        frequenciaId: frequencia.id,
        intervaloId: data.intervalo.id,
        isExterno: !!data.isExterno,

        usuarioId: user.id,
      };
    })
  );

  return await prisma.calendario.createMany({
    data: datas,
  });
};

export const createCalendario = async (body: any, login: string) => {
  const user = await getUser(login);
  const frequencia: ObjProps =
    !body?.frequencia || body.frequencia === ''
      ? await getFrequenciaName('Único')
      : body.frequencia;

  if (frequencia?.nome === 'Único') {
    body.dataFim = body.dataInicio;
    body.diasFrequencia = [];
    body.intervalo = {
      id: 1,
      nome: '1 Semana',
    };
  }

  const diasFrequencia = body.diasFrequencia.join(',');

  if (body.modalidade.nome === 'Devolutiva') {
    return createEventoDevolutiva(
      body,
      login,
      diasFrequencia,
      frequencia,
      user
    );
  } else {
    return createEventoDefault(body, login, diasFrequencia, frequencia, user);
  }
};

const formatEvent = (event: any) => {
  return {
    groupId: event?.groupId,
    km: event?.km,
    dataInicio: event?.dataInicio,
    dataFim: event?.dataFim,
    start: event?.start,
    end: event?.end,
    ciclo: event?.ciclo,
    observacao: event?.observacao,
    pacienteId: event?.paciente?.id,
    modalidadeId: event?.modalidade?.id,
    especialidadeId: event?.especialidade?.id,
    terapeutaId: event?.terapeuta?.id,
    funcaoId: event?.funcao?.id,
    localidadeId: event.localidade?.id,
    statusEventosId: event?.statusEventos?.id,
    diasFrequencia: event?.diasFrequencia?.join(),
    isExterno: event?.isExterno,
    frequenciaId: event?.frequencia?.id,
    intervaloId: event?.intervalo?.id,
  };
};

const getExDate = (event: any) => {
  let _exdate =
    typeof event?.exdate === 'string' ? event?.exdate.split() : event?.exdate;
  const exdate: string[] = _exdate || [];
  exdate.push(event.dataAtual);
  return exdate;
};

export const updateCalendario = async (body: any, login: string) => {
  const eventoSalvo: any[] = await prisma.calendario.findMany({
    where: { groupId: body.groupId },
  });

  switch (true) {
    case eventoSalvo.length === 0:
      throw new Error('Não existe evento desse groupo!');
    case eventoSalvo.length === 1:
      return updateEventoUnicoGrupo(body, login);
    case eventoSalvo.length >= 2:
      const data = formatEvent(body);

      if (body.changeAll) {
        delete data.dataFim;

        return await prisma.calendario.updateMany({
          data: {
            ...data,
          },
          where: {
            groupId: data.groupId,
          },
        });
      } else {
        if (body.isChildren) {
          try {
            const eventos = prisma.calendario.update({
              data,
              where: {
                id: body.id,
              },
            });

            return eventos;
          } catch (error) {
            console.log(error);
          }
        } else {
          const evento = eventoSalvo.filter(
            (event: any) => event.id === body.id
          )[0];
          body.exdate = evento.exdate;

          updateEventoRecorrentes(body, login);
        }
      }
    default:
      break;
  }
};

const updateEventoUnicoGrupo = async (event: any, login: string) => {
  let evento;
  switch (event.frequencia.id) {
    case 1: //se o evento for único
      const data = formatEvent(event);
      evento = await prisma.calendario.update({
        data,
        where: {
          id: event.id,
        },
      });
      break;
    case 2: // se o evento for recorrente
      evento = await updateEventoRecorrentes(event, login);

    default:
      break;
  }

  return evento;
};

const updateEventoRecorrentes = async (event: any, login: string) => {
  const data = formatEvent(event);

  let dataFim = moment(event.dataAtual).add(1, 'days').format('YYYY-MM-DD');

  const statusEventos = event.statusEventos.nome.toLowerCase();
  const isCanceled =
    statusEventos.includes('permanente') ||
    statusEventos.includes('cancelamento');
  if (isCanceled && !event?.dataFim) {
    event.dataFim = dataFim;
  }

  const exdate = getExDate(event);

  switch (true) {
    case event.changeAll: // se for mudar todos
      const eventosAll = await updateEventoRecorrentesAllChange(
        event,
        exdate.join(','),
        login,
        isCanceled
      );
      return eventosAll;
    case !event.changeAll: // se for mudar todos
      const usuario = await getUser(login);

      try {
        const [, eventos] = await Promise.all([
          prisma.calendario.update({
            data: {
              exdate: exdate.join(),
            },
            where: {
              id: event.id,
            },
          }),
          prisma.calendario.create({
            data: {
              ...data,
              dataInicio: event.dataAtual,
              dataFim,
              usuarioId: usuario.id,
              isChildren: true,
            },
          }),
        ]);

        return eventos;
      } catch (error) {
        console.log(error);
        return;
      }
  }
};

const updateEventoRecorrentesAllChange = async (
  event: any,
  exdate: string,
  login: string,
  isCanceled?: boolean
) => {
  const evento: any = await prisma.calendario.findFirst({
    where: { id: event.id },
  });

  const dataInicio = moment(evento.dataInicio);
  const dataAtual = moment(event.dataAtual);

  const data = formatEvent(event);

  if (exdate !== '') {
    event.exdate = exdate;
  }

  if (dataInicio.isBefore(dataAtual)) {
    const usuario = await getUser(login);
    let dataFim = moment(event.dataAtual).add(1, 'days').format('YYYY-MM-DD');

    // se data de inicio já passou, for recorrente e mudar todos
    const [, eventos] = await Promise.all([
      prisma.calendario.create({
        data: {
          ...data,
          dataInicio: event.dataAtual,
          usuarioId: usuario.id,
          isChildren: true,
          dataFim,
        },
      }),
      prisma.calendario.updateMany({
        data: {
          // ...data,
          // dataFim: dataAtual.subtract(1, 'day').format('YYYY-MM-DD'),
          dataFim: dataAtual.subtract(1, 'day').format('YYYY-MM-DD'),
          statusEventosId: evento.statusEventosId,
        },
        where: {
          id: event.id,
        },
      }),
    ]);

    return eventos;
  } else {
    // console.log('updateEventoRecorrentesAllChange change all after');

    delete event.dataAtual;
    const eventosAll = await prisma.calendario.updateMany({
      data: {
        ...data,
        statusEventosId: evento.statusEventosId,
      },
      where: {
        groupId: data.groupId,
      },
    });
    return eventosAll;
  }
};

export const updateCalendario_ = async (body: any, login: string) => {
  let dataFim = moment(body.dataAtual).subtract(2, 'days').format('YYYY-MM-DD');
  const isCanceled = body.statusEventos.nome.includes('permanente');
  if (isCanceled && !body?.dataFim) {
    body.dataFim = dataFim;
  }

  const eventoUnico = await prisma.calendario.findFirstOrThrow({
    where: {
      id: body.id,
    },
  });

  let evento;
  switch (true) {
    case body.frequencia.id === 1 && !body.changeAll:
      evento = await prisma.calendario.updateMany({
        data: {
          dataInicio: body?.dataInicio,
          km: body?.km,
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
          localidadeId: body.localidade?.id,
          statusEventosId: body?.statusEventos?.id,
        },
        where: {
          id: body.id,
        },
      });
      break;
    case isCanceled && body.changeAll:
      evento = await prisma.calendario.updateMany({
        data: {
          ...body,
          dataFim,
        },
        where: {
          groupId: body.groupId,
        },
      });
      break;
    case body.changeAll && dataFim !== eventoUnico.dataInicio:
      evento = await prisma.calendario.updateMany({
        data: {
          dataFim,
        },
        where: {
          groupId: body.groupId,
        },
      });

      await createCalendario(
        {
          ...body,
          groupId: body.groupId,
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
          groupId: body.groupId,
        },
      });
      break;
    case body.frequencia.id !== 1 && !body.changeAll:
      const exdate = eventoUnico?.exdate ? eventoUnico?.exdate.split(',') : [];
      exdate.push(formatDateTime(body.start, body.dataAtual));

      const format = exdate.join(',');

      evento = await prisma.calendario.updateMany({
        data: {
          exdate: format,
        },
        where: {
          id: body.id,
        },
      });

      await createCalendario(
        {
          ...body,
          frequenciaId: 1,
          groupId: body.id,
        },
        login
      );
      break;
    default:
      break;
  }

  return evento;
};

export const updateCalendarioMobile = async (body: any, login: string) => {
  const statusEventos = await prisma.statusEventos.findFirst({
    where: {
      nome: 'Atendido',
    },
  });

  body.statusEventos = statusEventos;

  updateCalendario(body, login);
};
export const updateCalendarioAtestado = async (body: any, login: string) => {
  const statusEventos = await prisma.statusEventos.findFirst({
    where: {
      nome: 'Atestado',
    },
  });

  body.statusEventos = statusEventos;

  updateCalendario(body, login);
};

export const deleteCalendario = async (eventId: number, login: string) => {
  try {
    const { id } = await getUser(login);
    const evento = await prisma.calendario.findFirstOrThrow({
      select: {
        paciente: {
          include: {
            vaga: {
              include: {
                especialidades: true,
              },
            },
          },
        },
        especialidadeId: true,
        groupId: true,
      },
      where: { id: Number(eventId) },
    });

    updateVaga({
      desagendar: [evento.especialidadeId],
      agendar: [],
      vagaId: evento.paciente?.vaga?.id || 0,
      pacienteId: evento.paciente.id,
      statusPacienteCod: evento.paciente.statusPacienteCod,
    });

    return await prisma.calendario.deleteMany({
      where: {
        groupId: evento.groupId,
        usuarioId: id,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const formatEvents = async (eventos: any, login: string) => {
  const usuario = await getUser(login);

  const eventosFormat = await Promise.all(
    eventos.map((evento: any) => {
      let formated: any = {};
      const cor =
        evento.statusEventos.nome.includes('Cancelado') ||
        evento.statusEventos.nome.includes('cancelado')
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

      evento.diasFrequencia =
        evento.diasFrequencia && evento.diasFrequencia.split(',');

      evento.exdate = evento.exdate ? evento.exdate.split(',') : [];
      evento.exdate = evento.exdate.map(
        (ex: string) => `${ex} ${evento.start}`
      );

      evento.canDelete = evento.usuarioId === usuario.id;

      const diasFrequencia: number[] =
        evento.diasFrequencia &&
        evento.diasFrequencia.map((dia: string) => Number(dia) - 1);

      switch (true) {
        case evento.frequencia.id !== 1 && evento.intervalo.id === 1: // com dias selecionados e todas semanas
          formated = {
            ...evento,
            data: {
              start: evento.start,
              end: evento.end,
            },
            title: evento.paciente.nome,
            groupId: evento.groupId,
            daysOfWeek: diasFrequencia,
            isChildren: evento.isChildren,
            startTime: evento.start,
            endTime: evento.end,
            borderColor: cor,
            backgroundColor: cor,
            rrule: {
              freq: 'weekly',
              // byweekday: diasFrequencia,
              dtstart: formatDateTime(evento.start, evento.dataInicio),
            },
          };

          if (evento.dataFim) {
            formated.rrule.until = formatDateTime(evento.start, evento.dataFim);
          }

          break;
        case evento.frequencia.id !== 1 && evento.intervalo.id !== 1: // com dias selecionados e intervalos
          const dtstart = moment(evento.dataInicio)
            .subtract(1, 'days')
            .format('YYYY-MM-DD');
          formated = {
            ...evento,
            data: {
              start: evento.start,
              end: evento.end,
            },
            title: evento.paciente.nome,
            groupId: evento.groupId,
            borderColor: cor,
            backgroundColor: cor,
            isChildren: evento.isChildren,
            rrule: {
              freq: 'weekly',
              interval: evento.intervalo.id,
              byweekday: diasFrequencia,
              dtstart: `${evento.dataInicio}T${evento.start}:00Z`,
            },
          };

          if (evento.dataFim) {
            formated.rrule.until = `${evento.dataFim}T${evento.end}:00Z`; //formatDateTime(evento.end, evento.dataFim);
          }

          break;

        default: // evento unico
          formated = {
            ...evento,
            groupId: evento.groupId,
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
            allDay: false,
            isChildren: evento.isChildren,
          };

          // delete formated.exdate;
          delete formated.diasFrequencia;
          break;
      }

      return formated;
    })
  );

  return eventosFormat;
};

export const removeEvents = async (
  pacienteId: number,
  statusPacienteCod: string,
  especialidadeIds: number[]
) => {
  let modalidade = '';

  switch (statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
    case STATUS_PACIENT_COD.avaliation:
    case STATUS_PACIENT_COD.queue_devolutiva:
      modalidade = 'Avaliação';
      break;
    case STATUS_PACIENT_COD.devolutiva:
      modalidade = 'Devolutiva';
      break;
    case STATUS_PACIENT_COD.queue_therapy:
      modalidade = 'Terapia';
      break;
  }

  const modalidadeDB = await prisma.modalidade.findFirst({
    where: {
      nome: modalidade,
    },
  });

  return await prisma.calendario.deleteMany({
    where: {
      pacienteId,
      especialidadeId: {
        in: especialidadeIds,
      },
      modalidadeId: modalidadeDB?.id,
    },
  });
};
