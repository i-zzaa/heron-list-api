import { PrismaClient } from '@prisma/client';
import {
  calculaIdade,
  formatadataPadraoBD,
  formatdate,
} from '../utils/convert-hours';

const prisma = new PrismaClient();
export interface PatientProps {
  id: number;
  nome: string;
  telefone: string;
  responsavel: string;
  dataNascimento: string;
  convenioId: number;
}

interface Props extends PatientProps {
  id: number;
  dataContato: string;
  periodoId: number;
  pacienteId: number;
  tipoSessaoId: number;
  especialidades: any;
  statusId: number;
  observacao: string;
  naFila: boolean;
  disabled?: boolean;
  emAtendimento?: boolean;
}

const formatPatients = (patients: any) => {
  const pacientes: any = [];
  patients.forEach(async (patient: any) => {
    const paciente = { ...patient };
    if (patient.vaga) {
      pacientes.push({
        ...paciente,
        // dataContato: formatdate(patient.vaga.dataContato),
        idade: calculaIdade(patient.dataNascimento),
        // dataNascimento: formatdate(patient.dataNascimento),
      });
    }
  });

  return pacientes;
};

export const getPatients = async (query: any) => {
  const emAtendimento = query.emAtendimento === 'true';
  const patients = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      emAtendimento: true,
      vaga: {
        include: {
          periodo: true,
          tipoSessao: true,
          especialidades: {
            include: {
              especialidade: true,
            },
          },
          status: true,
        },
      },
    },
    where: {
      disabled: false,
      vaga: {
        naFila: true,
        devolutiva: false,
      },
      emAtendimento: emAtendimento,
    },
    orderBy: {
      vaga: {
        dataContato: 'asc',
      },
    },
  });

  if (patients) {
    const pacientes: any = await formatPatients(patients);
    return pacientes;
  }

  return [];
};

export const searchPatients = async (word: string) => {
  const patients = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      vaga: {
        include: {
          periodo: true,
          tipoSessao: true,
          especialidades: true,
          status: true,
        },
      },
    },
    where: {
      OR: [
        {
          nome: {
            contains: word,
          },
        },
        {
          responsavel: { contains: word },
        },
      ],
    },
  });

  const pacientes: any = patients.length ? formatPatients(patients) : patients;
  return pacientes;
};

export const createPatient = async (body: Props) => {
  const paciente: any = await prisma.paciente.create({
    data: {
      nome: body.nome.toUpperCase(),
      telefone: body.telefone,
      responsavel: body.responsavel.toUpperCase(),
      disabled: false,
      convenioId: body.convenioId,
      dataNascimento: formatadataPadraoBD(body.dataNascimento),
      emAtendimento: body.emAtendimento,
      vaga: {
        create: {
          dataContato: formatadataPadraoBD(body.dataContato),
          observacao: body.observacao,
          naFila: body.naFila,
          periodoId: body.periodoId,
          tipoSessaoId: body.tipoSessaoId,
          statusId: body.statusId,
          especialidades: {
            create: [
              ...body.especialidades.map((especialidade: string) => {
                return {
                  especialidadeId: especialidade,
                };
              }),
            ],
          },
        },
      },
    },
  });

  return paciente;
};

export const updatePatient = async (body: any) => {
  const [, , especialidades] = await prisma.$transaction([
    prisma.paciente.update({
      data: {
        nome: body.nome.toUpperCase(),
        telefone: body.telefone,
        responsavel: body.responsavel.toUpperCase(),
        convenioId: body.convenioId,
        dataNascimento: formatadataPadraoBD(body.dataNascimento),
        vaga: {
          update: {
            dataVoltouAba: body.dataVoltouAba,
            periodoId: body.periodoId,
            tipoSessaoId: body.tipoSessaoId,
            statusId: body.statusId,
            observacao: body.observacao,
          },
        },
      },
      where: {
        id: body.id,
      },
    }),
    prisma.vagaOnEspecialidade.deleteMany({
      where: {
        vagaId: body.id,
        agendado: false,
        NOT: {
          especialidadeId: {
            in: body.especialidades,
          },
        },
      },
    }),
    prisma.vagaOnEspecialidade.findMany({
      select: {
        especialidadeId: true,
      },
      where: {
        vagaId: body.id,
      },
    }),
  ]);

  const arrEspecialidade = especialidades.map(
    (especialidade: any) => especialidade.especialidadeId
  );
  const createEspecialidade = body.especialidades.filter(
    (especialidade: number) => !arrEspecialidade.includes(especialidade)
  );

  if (createEspecialidade.length) {
    const data = createEspecialidade.map((especialidadeId: any) => {
      return {
        vagaId: body.id,
        agendado: false,
        especialidadeId: especialidadeId,
      };
    });

    await prisma.vagaOnEspecialidade.createMany({
      data,
    });
  }

  return [];
};

export const filterPatients = async (body: any) => {
  const filter: any = {};
  const emAtendimento = Boolean(body.emAtendimento);

  if (body.pacientes && body.pacientes.length)
    filter['pacienteId'] = { in: body.pacientes };
  if (body.tipoSessoes && body.tipoSessoes.length)
    filter['tipoSessaoId'] = { in: body.tipoSessoes };
  if (body.periodos && body.periodos.length)
    filter['periodoId'] = { in: body.periodos };
  if (body.status && body.status.length)
    filter['statusId'] = { in: body.status };
  // if (body.especialidades && body.especialidades.length) filter['especialidadeId'] = { in: body.especialidades };

  const response = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      emAtendimento: true,
      convenio: true,
      vaga: {
        select: {
          naFila: true,
          dataVoltouAba: true,
        },
        include: {
          periodo: true,
          tipoSessao: true,
          especialidades: {
            include: {
              especialidade: true,
            },
          },
          status: true,
        },
      },
    },
    where: {
      emAtendimento: emAtendimento,
      vaga: {
        ...filter,
        naFila: body.naFila,
      },
    },
    orderBy: {
      vaga: {
        dataContato: 'asc',
      },
    },
  });

  const filtro: any = [];
  if (body.especialidades && body.especialidades.length) {
    response.map((list: any) => {
      list.vaga.especialidades.filter((especialidade: any) => {
        if (body.especialidades.includes(especialidade.especialidadeId)) {
          filtro.push(list);
        }
      });
    });
  }

  const reultadoFiltrado = filtro.length ? filtro : response;
  const pacientes: any = reultadoFiltrado.length
    ? formatPatients(reultadoFiltrado)
    : reultadoFiltrado;

  return pacientes;
};

export const setPacienteEmAtendimento = async (
  emAtendimento: boolean,
  id: number
) => {
  await prisma.paciente.update({
    data: {
      emAtendimento,
    },
    where: {
      id,
    },
  });
};

export const filterSinglePatients = async (body: any) => {
  const filter = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      emAtendimento: true,
      vaga: {
        include: {
          periodo: true,
          tipoSessao: true,
          especialidades: {
            include: {
              especialidade: true,
            },
          },
          status: true,
        },
      },
    },
    where: {
      emAtendimento: body.emAtendimento,
      disabled: body.disabled,
      convenioId: body.convenios,
      vaga: {
        pacienteId: body.pacientes,
        statusId: body.status,
        periodoId: body.periodos,
        tipoSessaoId: body.tipoSessoes,
        naFila: body.naFila,
        devolutiva: body.devolutiva,
        especialidades: {
          some: {
            especialidadeId: body.especialidades,
          },
        },
      },
    },
    orderBy: {
      vaga: {
        dataContato: 'asc',
      },
    },
  });
  const pacientes: any = filter.length ? formatPatients(filter) : filter;
  return pacientes;
};

export const deletePatient = async (id: number) => {
  await prisma.vagaOnEspecialidade.deleteMany({
    where: {
      vagaId: id,
    },
  });

  await prisma.vaga.deleteMany({
    where: {
      id: id,
    },
  });

  await prisma.paciente.delete({
    where: {
      id: id,
    },
  });
};
export const updateDisabled = async ({ id, disabled }: any) => {
  await prisma.paciente.update({
    data: {
      disabled: disabled,
    },
    where: {
      id: id,
    },
  });
};
