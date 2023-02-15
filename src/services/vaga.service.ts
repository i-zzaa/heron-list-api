import { PrismaClient } from '@prisma/client';
import { STATUS_PACIENT_COD } from '../constants/patient';
import {
  calculaData,
  formatadataPadraoBD,
  getFormat,
} from '../utils/convert-hours';
import { removeEvents } from './calendario.service';
import { getPatientId, setStatusPaciente } from './patient.service';

const prisma = new PrismaClient();

interface VagaEspecialidadeProps {
  especialidades: Array<number>;
  nome: string;
  vagaId: number;
  agendar: number[];
  desagendar: number[];
  statusPacienteCod: string;
  pacienteId: number;
}
interface EspecialidadeProps {
  agendado: boolean;
  nome: string;
  especialidadeId: number;
  vagaId: number;
}
export interface VagaProps {
  id: number;
  dataContato: string;
  status: string;
  especialidades: EspecialidadeProps[];
  tipoSessaoId: number;
  periodoId: number;
  statusId: number;
  pacienteId: number;
  naFila: boolean;
  observacao: string;
}

export interface FilaProps {
  vagaId: number;
  dataAgendado: string;
}

export interface AgendarEspecialidadeProps {
  vagaId: number;
  especialidadeId: number;
  statusPacienteCod: string;
}

export const getVagas = async () => {
  return await prisma.vaga.findMany({
    orderBy: {
      dataContato: 'asc',
    },
  });
};

export const createVaga = async (body: any) => {
  return await prisma.vaga.create({
    data: body,
  });
};

const verifyInFila = async (
  vagaId: number,
  dataAgendado: string,
  statusPacienteCod: string
) => {
  let naFila = false;
  switch (statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      const vagaOnEspecialidade: any =
        await prisma.vagaOnEspecialidade.aggregate({
          _count: {
            especialidadeId: true,
          },
          where: {
            vagaId: vagaId,
            agendado: false,
          },
        });

      naFila = vagaOnEspecialidade._count.especialidadeId > 0;

      if (!naFila) {
        const { dataContato }: any = await prisma.vaga.findUniqueOrThrow({
          select: {
            dataContato: true,
          },
          where: {
            id: vagaId,
          },
        });

        const diff = calculaData(dataAgendado, dataContato);
        await prisma.vaga.update({
          data: {
            naFila: naFila,
            dataSaiuFila: dataAgendado,
            diff: diff.toString(),
          },
          where: {
            id: vagaId,
          },
        });
      }

      break;
    case STATUS_PACIENT_COD.queue_therapy:
    case STATUS_PACIENT_COD.crud_therapy:
      const vagaTerapiaOnEspecialidade: any =
        await prisma.vagaTerapiaOnEspecialidade.aggregate({
          _count: {
            especialidadeId: true,
          },
          where: {
            vagaId: vagaId,
            agendado: false,
          },
        });

      naFila = vagaTerapiaOnEspecialidade._count.especialidadeId > 0;

      if (!naFila) {
        const { dataVoltouAba }: any =
          await prisma.vagaTerapia.findUniqueOrThrow({
            select: {
              dataVoltouAba: true,
            },
            where: {
              id: vagaId,
            },
          });

        const diff = calculaData(dataAgendado, dataVoltouAba);
        await prisma.vagaTerapia.update({
          data: {
            naFila: naFila,
            dataSaiuFila: dataAgendado,
            diff: diff.toString(),
          },
          where: {
            id: vagaId,
          },
        });
      }
      break;
    default:
      break;
  }

  return naFila;
};

const setQueueStatus = async (
  vagaId: number,
  statusPacienteCod: string,
  statusTwo: string
) => {
  const dataAgendado = formatadataPadraoBD(new Date());

  const isQueue = await verifyInFila(vagaId, dataAgendado, statusPacienteCod);

  await setStatusPaciente(isQueue ? statusPacienteCod : statusTwo, vagaId);

  return isQueue;
};

export const updateVaga = async (body: VagaEspecialidadeProps) => {
  const dataAgendado = formatadataPadraoBD(new Date());

  if (body.agendar.length) {
    switch (body.statusPacienteCod) {
      case STATUS_PACIENT_COD.queue_avaliation:
      case STATUS_PACIENT_COD.avaliation:
        await prisma.vagaOnEspecialidade.updateMany({
          data: {
            agendado: true,
            dataAgendado: dataAgendado,
          },
          where: {
            vagaId: body.vagaId,
            especialidadeId: {
              in: body.agendar,
            },
          },
        });

        setQueueStatus(
          body.vagaId,
          STATUS_PACIENT_COD.queue_avaliation,
          STATUS_PACIENT_COD.avaliation
        );

        break;
      case STATUS_PACIENT_COD.queue_devolutiva:
        await prisma.vagaOnEspecialidade.updateMany({
          data: {
            agendado: true,
            dataAgendado: dataAgendado,
          },
          where: {
            vagaId: body.vagaId,
            especialidadeId: {
              in: body.agendar,
            },
          },
        });

        setQueueStatus(
          body.vagaId,
          STATUS_PACIENT_COD.queue_devolutiva,
          STATUS_PACIENT_COD.devolutiva
        );

        break;
      case STATUS_PACIENT_COD.queue_therapy:
      case STATUS_PACIENT_COD.crud_therapy:
      case STATUS_PACIENT_COD.therapy:
        await prisma.vagaTerapiaOnEspecialidade.updateMany({
          data: {
            agendado: true,
            dataAgendado: dataAgendado,
          },
          where: {
            vagaId: body.vagaId,
            especialidadeId: {
              in: body.agendar,
            },
          },
        });

        const now =
          body.statusPacienteCod === STATUS_PACIENT_COD.crud_therapy
            ? STATUS_PACIENT_COD.crud_therapy
            : STATUS_PACIENT_COD.therapy;

        setQueueStatus(body.vagaId, body.statusPacienteCod, now);

        break;
      default:
        break;
    }
  }

  if (body.desagendar.length) {
    switch (body.statusPacienteCod) {
      case STATUS_PACIENT_COD.queue_avaliation:
      case STATUS_PACIENT_COD.avaliation:
        removeEvents(body.pacienteId, body.statusPacienteCod, body.desagendar);

        await prisma.vaga.update({
          data: {
            dataRetorno: dataAgendado,
            naFila: true,
          },
          where: {
            id: body.vagaId,
          },
        });

        await prisma.vagaOnEspecialidade.updateMany({
          data: {
            agendado: false,
          },
          where: {
            vagaId: body.vagaId,
            especialidadeId: {
              in: body.desagendar,
            },
          },
        });

        setQueueStatus(
          body.vagaId,
          STATUS_PACIENT_COD.queue_avaliation,
          STATUS_PACIENT_COD.avaliation
        );

        break;
      case STATUS_PACIENT_COD.queue_devolutiva:
      case STATUS_PACIENT_COD.devolutiva:
        removeEvents(body.pacienteId, body.statusPacienteCod, body.desagendar);

        await prisma.vaga.update({
          data: {
            dataRetorno: dataAgendado,
            naFila: true,
          },
          where: {
            id: body.vagaId,
          },
        });

        await prisma.vagaOnEspecialidade.updateMany({
          data: {
            agendado: false,
          },
          where: {
            vagaId: body.vagaId,
            especialidadeId: {
              in: body.desagendar,
            },
          },
        });

        const isQueue = setQueueStatus(
          body.vagaId,
          STATUS_PACIENT_COD.queue_avaliation,
          STATUS_PACIENT_COD.avaliation
        );

        return isQueue;

      case STATUS_PACIENT_COD.queue_therapy:
      case STATUS_PACIENT_COD.crud_therapy:
      case STATUS_PACIENT_COD.therapy:
        await prisma.vagaTerapia.update({
          data: {
            // dataVoltouAba: dataAgendado,
            naFila: true,
          },
          where: {
            id: body.vagaId,
          },
        });

        await prisma.vagaTerapiaOnEspecialidade.updateMany({
          data: {
            agendado: false,
          },
          where: {
            vagaId: body.vagaId,
            especialidadeId: {
              in: body.desagendar,
            },
          },
        });

        const now =
          body.statusPacienteCod === STATUS_PACIENT_COD.crud_therapy
            ? STATUS_PACIENT_COD.crud_therapy
            : STATUS_PACIENT_COD.queue_therapy;

        const isQueueTherapy = setQueueStatus(
          body.vagaId,
          body.statusPacienteCod,
          now
        );
        return isQueueTherapy;
    }
  }
};

export const tipoSessoesVaga = async () => {
  const responseCount = await prisma.tipoSessao.findMany({
    include: {
      _count: {
        select: {
          paciente: true,
        },
      },
    },
  });

  const labels = responseCount.map((item: any) => item.nome);
  const datasets = responseCount.map((item: any) => item._count.vaga);
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Tipo de sessão por Demanda',
        data: datasets,
        backgroundColor: ['#36531480', '#701a7580', '#1e3a8a80'],
        borderColor: ['#365314', '#701a75', '#1e3a8a'],
        borderWidth: 1,
      },
    ],
  };

  return data;
};

export const statusVaga = async () => {
  const responseCount = await prisma.status.findMany({
    include: {
      _count: {
        select: {
          paciente: true,
        },
      },
    },
  });

  const labels = responseCount.map((item: any) => item.nome);
  const datasets = responseCount.map((item: any) => item._count.vaga);

  const data = {
    labels: labels,
    datasets: [
      {
        label: '',
        data: datasets,
        backgroundColor: ['#38bdf880', '#7f1d1d80', '#312e8180'],
        borderColor: ['#38bdf8', '#7f1d1d', '#312e81'],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return data;
};

export const especialidadesVaga = async () => {
  const responseCount = await prisma.especialidade.findMany({
    include: {
      _count: {
        select: {
          vagas: true,
        },
      },
    },
    orderBy: {
      nome: 'asc',
    },
  });

  const labels = responseCount.map((item: any) => item.nome);
  const datasets = responseCount.map((item: any) => item._count.vagas);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Especialidades por Demanda',
        data: datasets,
        backgroundColor: ['#f6bf2680', '#8e24aa80', '#00000080', '#ef6c0080'],
        borderColor: ['#f6bf2680', '#8e24aa80', '#00000080', '#ef6c0080'],
        borderWidth: 1,
      },
    ],
  };

  return data;
};

export const esperaVaga = async () => {
  const responseCount: any = await prisma.vaga.aggregate({
    _max: {
      diff: true,
    },
    _min: {
      diff: true,
    },
    where: {
      NOT: {
        diff: '',
      },
    },
  });

  const min = getFormat(responseCount._min.diff);
  const max = getFormat(responseCount._max.diff);

  return { data: `min: ${min} ~ max: ${max}` };
};

export const returnVaga = async () => {
  const response: any = await prisma.vaga.aggregate({
    _count: {
      dataRetorno: true,
    },
    where: {
      NOT: {
        dataRetorno: '',
      },
    },
  });

  return { data: response._count.dataRetorno };
};

export const updateReturn = async ({ id, devolutiva }: any) => {
  const dataDevolutiva = formatadataPadraoBD(new Date());
  await prisma.vaga.update({
    data: {
      devolutiva: devolutiva,
      dataDevolutiva,
    },
    where: {
      id: id,
    },
  });

  let statusPacienteCodTemp: string = STATUS_PACIENT_COD.queue_therapy;

  if (!devolutiva) {
    const { statusPacienteCod }: any = await getPatientId(id);
    statusPacienteCodTemp =
      statusPacienteCod === STATUS_PACIENT_COD.queue_therapy
        ? STATUS_PACIENT_COD.queue_avaliation
        : STATUS_PACIENT_COD.queue_therapy;
  }

  await setStatusPaciente(statusPacienteCodTemp, id);
};

export const updateEspecialidadeVaga = async ({
  vagaId,
  especialidadeId,
  statusPacienteCod,
}: AgendarEspecialidadeProps) => {
  const dataAgendado = formatadataPadraoBD(new Date());

  switch (statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      await prisma.vagaOnEspecialidade.updateMany({
        data: {
          agendado: true,
          dataAgendado,
        },
        where: {
          especialidadeId: especialidadeId,
          vagaId: vagaId,
        },
      });

      const isAvaliationQueue = await verifyInFila(
        vagaId,
        dataAgendado,
        statusPacienteCod
      );
      await setStatusPaciente(
        isAvaliationQueue
          ? STATUS_PACIENT_COD.avaliation
          : STATUS_PACIENT_COD.queue_devolutiva,
        vagaId
      );

      return isAvaliationQueue;
    case STATUS_PACIENT_COD.queue_devolutiva:
      await prisma.vagaOnEspecialidade.updateMany({
        data: {
          agendado: true,
          dataAgendado,
        },
        where: {
          especialidadeId: especialidadeId,
          vagaId: vagaId,
        },
      });
      const isReturnQueue = await verifyInFila(
        vagaId,
        dataAgendado,
        statusPacienteCod
      );
      await setStatusPaciente(STATUS_PACIENT_COD.devolutiva, vagaId);
      return isReturnQueue;
    case STATUS_PACIENT_COD.queue_therapy:
      await prisma.vagaTerapiaOnEspecialidade.updateMany({
        data: {
          agendado: true,
          dataAgendado,
        },
        where: {
          especialidadeId: especialidadeId,
          vagaId: vagaId,
        },
      });
      const isTherapyQueue = await verifyInFila(
        vagaId,
        dataAgendado,
        statusPacienteCod
      );
      if (!isTherapyQueue)
        await setStatusPaciente(STATUS_PACIENT_COD.therapy, vagaId);

      return isTherapyQueue;

    case STATUS_PACIENT_COD.crud_therapy:
      await prisma.vagaTerapiaOnEspecialidade.updateMany({
        data: {
          agendado: true,
          dataAgendado,
        },
        where: {
          especialidadeId: especialidadeId,
          vagaId: vagaId,
        },
      });

      verifyInFila(vagaId, dataAgendado, statusPacienteCod);

      return;
  }
};
