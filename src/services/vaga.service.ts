import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  calculaData,
  formatadataPadraoBD,
  getFormat,
} from '../utils/convert-hours';

const prisma = new PrismaClient();

interface VagaEspecialidadeProps {
  especialidades: Array<number>;
  nome: string;
  vagaId: number;
  agendar: number[];
  desagendar: number[];
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

export const updateVaga = async (body: VagaEspecialidadeProps) => {
  const dataAgendado = formatadataPadraoBD(new Date());

  if (body.agendar.length) {
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
  }

  if (body.desagendar.length) {
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
  }

  const vagaOnEspecialidade: any = await prisma.vagaOnEspecialidade.aggregate({
    _count: {
      especialidadeId: true,
    },
    where: {
      vagaId: body.vagaId,
      agendado: false,
    },
  });

  const naFila: boolean = vagaOnEspecialidade._count.especialidadeId > 0;

  if (!naFila) {
    const { dataContato }: any = await prisma.vaga.findUniqueOrThrow({
      select: {
        dataContato: true,
      },
      where: {
        id: body.vagaId,
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
        id: body.vagaId,
      },
    });
  }
  return naFila;
};

export const tipoSessoesVaga = async () => {
  const responseCount = await prisma.tipoSessao.findMany({
    include: {
      _count: {
        select: {
          vaga: true,
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
        backgroundColor: [
          'rgba(0, 0, 0, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(0, 0, 0, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
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
          vaga: true,
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
        backgroundColor: [
          'rgba(0, 0, 0, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(0, 0, 0, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
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
  });

  const labels = responseCount.map((item: any) => item.nome);
  const datasets = responseCount.map((item: any) => item._count.vagas);
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Especialidades por Demanda',
        data: datasets,
        backgroundColor: [
          'rgba(0, 0, 0, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(0, 0, 0, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
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
};
