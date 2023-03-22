import { PrismaClient } from '@prisma/client';
import { STATUS_PACIENT_COD, STATUS_PACIENT_ID } from '../constants/patient';
import { calculaIdade, formatadataPadraoBD } from '../utils/convert-hours';
import { moneyFormat } from '../utils/util';
import { getStatusUnique } from './statusEventos.service';
import { getTerapeutaEspecialidade } from './user.service';

const prisma = new PrismaClient();
export interface PatientProps {
  id: number;
  nome: string;
  carteirinha: string;
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
  especialidadeId: number;
  vagaId: number;
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
    console.log('paciente', patient.id);

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

      const sessao: any[] = [];
      if (
        patient.statusPacienteCod === STATUS_PACIENT_COD.crud_therapy ||
        patient.statusPacienteCod === STATUS_PACIENT_COD.therapy
      ) {
        vaga.especialidades.map((especialidade: any) => {
          sessao.push({
            especialidade: especialidade.especialidade.nome,
            especialidadeId: especialidade.especialidadeId,
            km: especialidade.km,
            valor: moneyFormat.format(parseFloat(especialidade.valor)),
          });
        });
      }

      pacientes.push({
        ...paciente,
        // dataContato: formatdate(patient.vaga.dataContato),
        idade: calculaIdade(patient.dataNascimento),
        vaga: vaga,
        sessao,
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
      carteirinha: true,
    },
    where: {
      id,
    },
  });
};

export const getPatientsQueueTherapy = async (statusPacienteCod: string[]) => {
  console.log(statusPacienteCod);

  let filter = {};

  if (statusPacienteCod.includes(STATUS_PACIENT_COD.queue_therapy)) {
    filter = {
      OR: [
        {
          vagaTerapia: null,
        },
        {
          vagaTerapia: {
            naFila: true,
          },
        },
      ],
    };
  }

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
      carteirinha: true,
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
      statusPacienteCod: {
        in: statusPacienteCod,
      },
      disabled: false,

      ...filter,
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
      carteirinha: true,
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
        [STATUS_PACIENT_COD.queue_devolutiva],
        false
      );
    case STATUS_PACIENT_COD.queue_therapy:
      return getPatientsQueueTherapy([STATUS_PACIENT_COD.queue_therapy]);
    case STATUS_PACIENT_COD.crud_therapy:
      console.log('here');

      return getPatientsQueueTherapy([
        STATUS_PACIENT_COD.therapy,
        STATUS_PACIENT_COD.devolutiva,
        STATUS_PACIENT_COD.crud_therapy,
      ]);
    default:
      break;
  }
};
export const getPatientsEspcialidades = async (query: any) => {
  const vaga =
    query.statusPacienteCod === STATUS_PACIENT_COD.queue_avaliation ||
    query.statusPacienteCod === STATUS_PACIENT_COD.queue_devolutiva
      ? 'vaga'
      : 'vagaTerapia';

  const vagas: any = await prisma.paciente.findFirstOrThrow({
    select: {
      [vaga]: {
        include: {
          especialidades: {
            include: {
              especialidade: true,
            },
            where: {
              agendado:
                query.statusPacienteCod === STATUS_PACIENT_COD.queue_devolutiva,
            },
          },
        },
      },
    },
    where: {
      id: Number(query.pacienteId),
    },
  });

  const terapeutasAll = await getTerapeutaEspecialidade();
  const especialidades: any[] = vagas[vaga].especialidades.map(
    ({ especialidade: { id, cor, nome } }: any) => {
      const terapeutas = terapeutasAll.filter((terapeuta: any) => {
        if (terapeuta.especialidadeId === id) {
          return {
            nome: terapeuta.nome,
            id: terapeuta.id,
          };
        }
      });

      return {
        especialidade: {
          id,
          nome,
          cor,
        },
        terapeutas,
      };
    }
  );

  return especialidades;
};

export const filterSinglePatients = async (body: any) => {
  switch (body.statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return filterPatientsAvaliaton(
        [STATUS_PACIENT_COD.queue_avaliation, STATUS_PACIENT_COD.avaliation],
        body
      );
    case STATUS_PACIENT_COD.queue_devolutiva:
    case STATUS_PACIENT_COD.devolutiva:
      return filterPatientsAvaliaton(
        [STATUS_PACIENT_COD.queue_devolutiva, STATUS_PACIENT_COD.devolutiva],
        body
      );
    case STATUS_PACIENT_COD.queue_therapy:
      return filterPatientsQueueTherapy(
        [STATUS_PACIENT_COD.queue_therapy],
        body
      );
    case STATUS_PACIENT_COD.crud_therapy:
      return filterPatientsQueueTherapy(
        [STATUS_PACIENT_COD.crud_therapy],
        body
      );
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
      carteirinha: body.carteirinha,
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
      carteirinha: body.carteirinha,
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

const updatePatientAvaliation = async (body: any) => {
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
        carteirinha: body.carteirinha,
        vaga: {
          update: {
            periodoId: body.periodoId,
            observacao: body.observacao,
            dataContato: body.dataContato ? body.dataContato : '',
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

const updatePatientQueueTherapy = async (body: any) => {
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
        carteirinha: body.carteirinha,
        vagaTerapia: {
          update: {
            periodoId: body.periodoId,
            observacao: body.observacao,
            dataVoltouAba: body.dataVoltouAba ? body.dataVoltouAba : '',
          },
        },
      },
      where: {
        id: body.id,
      },
    }),
    prisma.vagaTerapiaOnEspecialidade.deleteMany({
      where: {
        vagaId: body.vagaId,
        agendado: false,
        NOT: {
          especialidadeId: {
            in: body.especialidades,
          },
        },
      },
    }),
    prisma.vagaTerapiaOnEspecialidade.findMany({
      select: {
        especialidadeId: true,
        valor: true,
        km: true,
      },
      where: {
        vagaId: body.vagaId,
      },
    }),
  ]);

  const arrEspecialidade = especialidades.map(
    (especialidade: any) => especialidade.especialidadeId
  );

  const createEspecialidade = body.especialidades.filter(
    (especialidade: number) => !arrEspecialidade.includes(especialidade)
  );

  if (STATUS_PACIENT_COD.crud_therapy === body.statusPacienteCod) {
    body.sessao.map(async (especialidade: Sessao) => {
      const formatSessao =
        typeof especialidade.valor === 'string'
          ? especialidade.valor.split('R$')[1]
          : especialidade.valor;

      if (!arrEspecialidade.includes(especialidade.especialidadeId)) {
        await prisma.vagaTerapiaOnEspecialidade.create({
          data: {
            vagaId: body.vagaId,
            agendado: false,
            especialidadeId: especialidade.especialidadeId,
            valor: formatSessao,
            km: especialidade.km.toString(),
          },
        });
      } else {
        await prisma.vagaTerapiaOnEspecialidade.updateMany({
          data: {
            vagaId: body.vagaId,
            agendado: false,
            valor: formatSessao,
            km: especialidade.km.toString(),
          },
          where: {
            vagaId: body.vagaId,
            especialidadeId: especialidade.especialidadeId,
          },
        });
      }
    });
  } else {
    if (createEspecialidade.length) {
      const data = createEspecialidade.map((especialidade: any) => {
        return {
          vagaId: body.id,
          agendado: false,
          especialidadeId: especialidade.especialidadeId,
        };
      });

      await prisma.vagaTerapiaOnEspecialidade.createMany({
        data,
      });
    }
  }

  return [];
};

export const updatePatient = async (body: any) => {
  switch (body.statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return updatePatientAvaliation(body);
    case STATUS_PACIENT_COD.queue_therapy:
    case STATUS_PACIENT_COD.crud_therapy:
      return updatePatientQueueTherapy(body);
    default:
      break;
  }
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

export const filterPatientsQueueTherapy = async (
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
      tipoSessao: true,
      statusPacienteCod: true,
      carteirinha: true,
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
      statusPacienteCod: {
        in: statusPacienteCod,
      },
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
      carteirinha: true,
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
        // naFila: body.naFila,
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
