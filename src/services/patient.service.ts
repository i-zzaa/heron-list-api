import { PrismaClient } from '@prisma/client';
import { calculaIdade, formatadataPadraoBD } from '../utils/convert-hours';
import { getStatusUnique } from './statusEventos.service';

const prisma = new PrismaClient();
export interface PatientProps {
  id: number;
  nome: string;
  telefone: string;
  responsavel: string;
  dataNascimento: string;
  convenioId: number;
  statusId: number;
  statusPacienteId: number;
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
  dataVoltouAba?: string;
}
interface PatientQueueTherapyPropsProps extends PatientProps {
  dataVoltouAba: string;
  periodoId: number;
  pacienteId: number;
  especialidades: any;
  observacao: string;
  naFila: boolean;
}
interface PatientQueueAvaliationPropsProps extends PatientProps {
  dataContato: string;
  periodoId: number;
  pacienteId: number;
  tipoSessaoId: number;
  especialidades: any;
  statusId: number;
  observacao: string;
  naFila: boolean;
}

const formatPatients = (patients: any) => {
  const pacientes: any = [];
  patients.forEach(async (patient: any) => {
    const paciente = { ...patient };
    if (patient?.vaga) {
      pacientes.push({
        ...paciente,
        // dataContato: formatdate(patient.vaga.dataContato),
        idade: calculaIdade(patient.dataNascimento),
        // dataNascimento: formatdate(patient.dataNascimento),
      });
    } else if (patient?.vagaTerapia) {
      const vaga = Object.assign({}, paciente?.vagaTerapia);
      vaga.dataInicio = vaga.dataVoltouAba;
      delete paciente.vagaTerapia;

      pacientes.push({
        ...paciente,
        // dataContato: formatdate(patient.vaga.dataContato),
        idade: calculaIdade(patient.dataNascimento),
        vaga: vaga,
      });
    }
  });

  return pacientes;
};

export const getPatientsQueueTherapy = async () => {
  const patients = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      tipoSessao: true,
      status: true,
      statusPacienteId: true,
      vagaTerapia: {
        include: {
          periodo: true,
          especialidades: {
            include: {
              especialidade: true,
            },
          },
        },
      },
    },
    where: {
      statusPacienteId: 2,
      disabled: false,
      vagaTerapia: {
        naFila: true,
      },
    },
    orderBy: {
      vagaTerapia: {
        dataVoltouAba: 'asc',
      },
    },
  });

  if (patients) {
    const pacientes: any = await formatPatients(patients);
    return pacientes;
  }

  return [];
};

export const getPatientsAvaliation = async () => {
  const patients = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      statusPacienteId: true,
      tipoSessao: true,
      status: true,
      vaga: {
        include: {
          periodo: true,
          especialidades: {
            include: {
              especialidade: true,
            },
          },
        },
      },
    },
    where: {
      statusPacienteId: 1,
      disabled: false,
      vaga: {
        naFila: true,
        devolutiva: false,
      },
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

export const setStatusPaciente = async (
  statusPacienteId: number,
  pacienteId: number
) => {
  const paciente: any = await prisma.paciente.update({
    data: {
      statusPacienteId: statusPacienteId,
    },
    where: {
      id: pacienteId,
    },
  });

  return paciente;
};

export const getPatients = async (query: any) => {
  switch (Number(query.statusPacienteId)) {
    case 1:
      return getPatientsAvaliation();
    case 2:
      return getPatientsQueueTherapy();
    default:
      break;
  }
};

export const filterSinglePatients = async (body: any) => {
  switch (Number(body.statusPacienteId)) {
    case 1:
      return filterPatientsAvaliaton(body);
    case 2:
      return filterPatientsQueueTherapy(body);
    default:
      break;
  }
};

export const createPatientAvaliation = async (
  body: PatientQueueAvaliationPropsProps
) => {
  const paciente: any = await prisma.paciente.create({
    data: {
      nome: body.nome.toUpperCase(),
      telefone: body.telefone,
      responsavel: body.responsavel.toUpperCase(),
      disabled: false,
      convenioId: body.convenioId,
      dataNascimento: formatadataPadraoBD(body.dataNascimento),
      statusPacienteId: body.statusPacienteId,
      statusId: body.statusId,
      tipoSessaoId: body.tipoSessaoId,
      vaga: {
        create: {
          dataContato: formatadataPadraoBD(body.dataContato),
          observacao: body.observacao,
          naFila: body.naFila,
          periodoId: body.periodoId,
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

export const createPatientQueueTherapy = async (
  body: PatientQueueTherapyPropsProps
) => {
  const paciente: any = await prisma.paciente.create({
    data: {
      nome: body.nome.toUpperCase(),
      telefone: body.telefone,
      responsavel: body.responsavel.toUpperCase(),
      disabled: false,
      convenioId: body.convenioId,
      dataNascimento: formatadataPadraoBD(body.dataNascimento),
      statusPacienteId: body.statusPacienteId,
      statusId: body.statusId,
      tipoSessaoId: 2,
      vagaTerapia: {
        create: {
          dataVoltouAba: formatadataPadraoBD(body.dataVoltouAba),
          observacao: body.observacao,
          naFila: true,
          periodoId: body.periodoId,
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

export const createPatient = async (body: any) => {
  switch (body.statusPacienteId) {
    case 1:
      return createPatientAvaliation(body);
    case 2:
      return createPatientQueueTherapy(body);
    default:
      break;
  }
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
        tipoSessaoId: body.tipoSessaoId,
        statusId: body.statusId,
        vaga: {
          update: {
            periodoId: body.periodoId,
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

export const filterPatientsQueueTherapy = async (body: any) => {
  const filter = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      tipoSessao: true,
      statusPacienteId: true,
      status: true,
      vagaTerapia: {
        include: {
          periodo: true,
          especialidades: {
            include: {
              especialidade: true,
            },
          },
        },
      },
    },
    where: {
      statusPacienteId: 2,
      disabled: body.disabled,
      convenioId: body.convenios,
      tipoSessaoId: body.tipoSessoes,
      statusId: body.status,
      vagaTerapia: {
        pacienteId: body.pacientes,
        periodoId: body.periodos,
        naFila: body.naFila,
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

export const filterPatientsAvaliaton = async (body: any) => {
  const filter = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      statusPacienteId: true,
      tipoSessao: true,
      status: true,
      vaga: {
        include: {
          periodo: true,
          especialidades: {
            include: {
              especialidade: true,
            },
          },
        },
      },
    },
    where: {
      statusPacienteId: body.statusPacienteId,
      disabled: body.disabled,
      convenioId: body.convenios,
      tipoSessaoId: body.tipoSessoes,
      statusId: body.status,
      vaga: {
        pacienteId: body.pacientes,
        periodoId: body.periodos,
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
