import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  calculaData,
  formatadataPadraoBD,
  getFormat,
} from '../utils/convert-hours';
import { setStatusPaciente } from './patient.service';

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

export interface FilaProps {
  vagaId: number;
  dataAgendado: string;
}

export interface AgendarEspecialidadeProps {
  vagaId: number;
  especialidadeId: number;
  statusPacienteId: number;
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

const verifyInFila = async (vagaId: number, dataAgendado: string) => {
  const vagaOnEspecialidade: any = await prisma.vagaOnEspecialidade.aggregate({
    _count: {
      especialidadeId: true,
    },
    where: {
      vagaId: vagaId,
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

  return naFila;
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

  const isFila = verifyInFila(body.vagaId, dataAgendado);
  return isFila;
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

  await setStatusPaciente(2, id);
};

export const updateEspecialidadeVaga = async ({
  vagaId,
  especialidadeId,
  statusPacienteId,
}: AgendarEspecialidadeProps) => {
  const dataAgendado = formatadataPadraoBD(new Date());
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

  const isFila = await verifyInFila(vagaId, dataAgendado);
  if (isFila) await setStatusPaciente(statusPacienteId === 1 ? 4 : 3, vagaId);

  return isFila;
};
