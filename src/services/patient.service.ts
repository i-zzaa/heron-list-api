import { PrismaClient } from '@prisma/client';
import { STATUS_PACIENT_COD, STATUS_PACIENT_ID } from '../constants/patient';
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
  statusPacienteCod: string;
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
interface Sessao {
  valor: string;
  km: string;
}
interface PatientQueueTherapyPropsProps extends PatientProps {
  dataVoltouAba: string;
  periodoId: number;
  pacienteId: number;
  especialidades: any;
  observacao: string;
  naFila: boolean;
  sessao: any;
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

      switch (true) {
        case vaga?.dataVoltouAba === 'Invalid date':
          vaga.dataVoltouAba = null;
          vaga.dataContato = null;
          break;
        case vaga?.dataVoltouAba !== null &&
          vaga.dataVoltouAba !== 'Invalid date':
          vaga.dataContato = vaga.dataVoltouAba;
          break;
      }

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

export const getPatientId = async (id: number) => {
  return await prisma.paciente.findFirstOrThrow({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenioId: true,
      statusId: true,
      statusPacienteCod: true,
    },
    where: {
      id,
    },
  });
};

export const getPatientsQueueTherapy = async (statusPacienteCod: string) => {
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
      statusPacienteCod: true,
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
      statusPacienteCod: statusPacienteCod,
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

export const getPatientsAvaliation = async (
  statusPacienteCod: string[],
  naFila: boolean
) => {
  const patients = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      statusPacienteCod: true,
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
      statusPacienteCod: {
        in: statusPacienteCod,
      },
      disabled: false,
      vaga: {
        naFila: naFila,
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
  statusPacienteCod: string,
  pacienteId: number
) => {
  const paciente: any = await prisma.paciente.update({
    data: {
      statusPacienteCod: statusPacienteCod,
    },
    where: {
      id: pacienteId,
    },
  });

  return paciente;
};

export const getPatients = async (query: any) => {
  const statusPacienteCod = query.statusPacienteCod;
  switch (statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return getPatientsAvaliation(
        [STATUS_PACIENT_COD.queue_avaliation, STATUS_PACIENT_COD.avaliation],
        true
      );
    case STATUS_PACIENT_COD.queue_devolutiva:
      return getPatientsAvaliation(
        [STATUS_PACIENT_COD.queue_devolutiva, STATUS_PACIENT_COD.devolutiva],
        false
      );
    case STATUS_PACIENT_COD.queue_therapy:
    case STATUS_PACIENT_COD.crud_therapy:
      return getPatientsQueueTherapy(statusPacienteCod);
    default:
      break;
  }
};

export const filterSinglePatients = async (body: any) => {
  switch (body.statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return filterPatientsAvaliaton(
        [STATUS_PACIENT_COD.queue_avaliation, STATUS_PACIENT_COD.avaliation],
        body
      );
    case STATUS_PACIENT_COD.queue_devolutiva:
      return filterPatientsAvaliaton(
        [STATUS_PACIENT_COD.queue_devolutiva, STATUS_PACIENT_COD.devolutiva],
        body
      );
    case STATUS_PACIENT_COD.queue_therapy:
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
      dataNascimento: body.dataNascimento,
      statusPacienteCod: body.statusPacienteCod,
      statusId: body.statusId,
      tipoSessaoId: body.tipoSessaoId,
      vaga: {
        create: {
          dataContato: body.dataContato,
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
    include: {
      vagaTerapia: true,
    },
    data: {
      nome: body.nome.toUpperCase(),
      telefone: body.telefone,
      responsavel: body.responsavel.toUpperCase(),
      disabled: false,
      emAtendimento: true,
      convenioId: body.convenioId,
      dataNascimento: body.dataNascimento,
      statusPacienteCod: body.statusPacienteCod,
      statusId: body.statusId,
      tipoSessaoId: 3, // Terapia ABA
      vagaTerapia: {
        create: {
          dataVoltouAba: body.dataVoltouAba ? body.dataVoltouAba : '', //body.dataVoltouAba),
          observacao: body.observacao,
          naFila: true,
          periodoId: body.periodoId,
          especialidades: {
            create: [
              ...body.sessao.map((sessao: any) => {
                return {
                  especialidadeId: sessao.especialidadeId,
                  valor: sessao.valor.split('R$ ')[1],
                  km: sessao.km.toString(),
                  agendado: false, // se for 2, é para cadastrar como nao agendado
                  dataAgendado: sessao.dataContato
                    ? sessao.dataContato
                    : new Date(),
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
  switch (body.statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return createPatientAvaliation(body);
    case STATUS_PACIENT_COD.queue_therapy:
    case STATUS_PACIENT_COD.crud_therapy:
      return createPatientQueueTherapy(body);
    default:
      break;
  }
};

export const updatePatient = async (body: any) => {
  let vaga = {};
  switch (body.statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      vaga = {
        vaga: {
          update: {
            periodoId: body.periodoId,
            observacao: body.observacao,
            dataContato: body.dataContato ? body.dataContato : '',
          },
        },
      };
      break;
    case STATUS_PACIENT_COD.queue_therapy:
    case STATUS_PACIENT_COD.crud_therapy:
      vaga = {
        vagaTerapia: {
          update: {
            periodoId: body.periodoId,
            observacao: body.observacao,
            dataVoltouAba: body.dataVoltouAba ? body.dataVoltouAba : '',
          },
        },
      };
      break;
    default:
      break;
  }

  const [, , especialidades] = await prisma.$transaction([
    prisma.paciente.update({
      data: {
        nome: body.nome.toUpperCase(),
        telefone: body.telefone,
        responsavel: body.responsavel.toUpperCase(),
        convenioId: body.convenioId,
        dataNascimento: body.dataNascimento,
        tipoSessaoId: body.tipoSessaoId,
        statusId: body.statusId,
        ...vaga,
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
      statusPacienteCod: true,
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
      statusPacienteCod: STATUS_PACIENT_COD.queue_therapy,
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

export const filterPatientsAvaliaton = async (
  statusPacienteCod: string[],
  body: any
) => {
  const filter = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      telefone: true,
      responsavel: true,
      dataNascimento: true,
      convenio: true,
      disabled: true,
      statusPacienteCod: true,
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
      statusPacienteCod: {
        in: statusPacienteCod,
      },
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
