import { PrismaClient } from '@prisma/client';
import { STATUS_PACIENT_COD } from '../constants/patient';
import { calculaIdade } from '../utils/convert-hours';
import { moneyFormat } from '../utils/util';
import { getTerapeutaEspecialidade } from './user.service';
import moment from 'moment';

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
interface Sessao {
  valor: string;
  especialidadeId: number;
  vagaId: number;
}
interface PatientQueueAvaliationPropsProps extends PatientProps {
  dataContato?: string;
  dataVoltouAba?: string;
  periodoId: number;
  pacienteId: number;
  tipoSessaoId?: number;
  especialidades: any;
  statusId: number;
  observacao: string;
  naFila: boolean;
  sessao: any;
}

const formatPatients = async (patients: any) => {
  try {
    const pacientes = await Promise.all(
      patients.map(async (patient: any) => {
        const paciente = { ...patient };
        const especialidades = paciente.vaga.especialidades;

        const sessao = await Promise.all(
          especialidades.map((especialidade: any) => {
            return {
              especialidade: especialidade.especialidade.nome,
              especialidadeId: especialidade.especialidadeId,
              valor: moneyFormat.format(parseFloat(especialidade.valor)),
            };
          })
        );

        return {
          ...paciente,
          idade: calculaIdade(patient.dataNascimento),
          sessao,
        };
      })
    );

    return pacientes;
  } catch (error) {
    console.log(error);
  }
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

export const getPatientsQueue = async (
  statusPacienteCod: string[],
  naFila?: boolean
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
      tipoSessao: true,
      status: true,
      statusPacienteCod: true,
      carteirinha: true,
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
      // vaga: {
      //   naFila: naFila,
      // },
      disabled: false,
      OR: [
        {
          vaga: null,
        },
        {
          vaga: {
            naFila: naFila,
          },
        },
      ],
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

export const setTipoSessaoTeprapia = async (pacienteId: number) => {
  const paciente: any = await prisma.paciente.update({
    data: {
      tipoSessaoId: 3,
    },
    where: {
      id: pacienteId,
    },
  });

  return paciente;
};

export const getPatientsActived = async () => {
  return await prisma.paciente.findMany({
    select: {
      nome: true,
      telefone: true,
      responsavel: true,
      statusPaciente: {
        select: {
          nome: true,
        },
      },
    },
    where: {
      disabled: false,
    },
    orderBy: {
      nome: 'asc',
    },
  });
};

export const getPatients = async (query: any) => {
  const statusPacienteCod = query.statusPacienteCod;
  switch (statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return getPatientsQueue(
        [STATUS_PACIENT_COD.queue_avaliation, STATUS_PACIENT_COD.avaliation],
        true
      );
    case STATUS_PACIENT_COD.queue_devolutiva:
      return getPatientsQueue([STATUS_PACIENT_COD.queue_devolutiva], false);
    case STATUS_PACIENT_COD.queue_therapy:
      return getPatientsQueue([STATUS_PACIENT_COD.queue_therapy]);
    case STATUS_PACIENT_COD.crud_therapy:
      return getPatientsQueue([
        // STATUS_PACIENT_COD.therapy,
        // STATUS_PACIENT_COD.devolutiva,
        STATUS_PACIENT_COD.crud_therapy,
      ]);
    default:
      break;
  }
};

export const getPatientsEspcialidades = async (query: any) => {
  const vagas: any = await prisma.paciente.findFirstOrThrow({
    select: {
      vaga: {
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
  const especialidades: any = await Promise.all(
    vagas.vaga.especialidades.map(
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
    )
  );

  return especialidades;
};

export const filterSinglePatients = async (body: any) => {
  switch (body.statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
      return filterPatients(
        [STATUS_PACIENT_COD.queue_avaliation, STATUS_PACIENT_COD.avaliation],
        body
      );
    case STATUS_PACIENT_COD.queue_devolutiva:
    case STATUS_PACIENT_COD.devolutiva:
      if (body?.isDevolutiva) {
        return filterPatients([STATUS_PACIENT_COD.devolutiva], body);
      }
      return filterPatients([STATUS_PACIENT_COD.queue_devolutiva], body);
    case STATUS_PACIENT_COD.queue_therapy:
      return filterPatients([STATUS_PACIENT_COD.queue_therapy], body);
    case STATUS_PACIENT_COD.crud_therapy:
      return filterPatients([STATUS_PACIENT_COD.crud_therapy], body);
    default:
      break;
  }
};

export const createPatient = async (body: PatientQueueAvaliationPropsProps) => {
  try {
    const dataContato =
      body?.dataContato ||
      body?.dataVoltouAba ||
      moment(new Date()).format('YYYY-MM-DD');

    const tipoSessaoId = body?.tipoSessaoId || 2;
    const naFila = body.statusPacienteCod !== STATUS_PACIENT_COD.crud_therapy; // CRIAR NA FILA TRUE SEMPRE QUE NAO FOR DA TELA  CADASTRO DO PACIENTE

    const paciente: any = await prisma.paciente.create({
      data: {
        nome: body.nome.toUpperCase(),
        telefone: body.telefone,
        responsavel: body.responsavel.toUpperCase(),
        disabled: false,
        convenioId: body.convenioId,
        dataNascimento: body.dataNascimento,
        statusPacienteCod: body.statusPacienteCod,
        statusId: body?.statusId,
        tipoSessaoId: tipoSessaoId,
        carteirinha: body.carteirinha,
        vaga: {
          create: {
            dataContato: dataContato,
            observacao: body?.observacao,
            naFila: naFila,
            periodoId: body.periodoId,
            especialidades: {
              create: [
                ...body.sessao.map((sessao: any) => {
                  return {
                    especialidadeId: sessao.especialidadeId,
                    valor: sessao.valor.split('R$ ')[1],
                    km: sessao.km.toString(),
                    agendado: false, // se for 2, é para cadastrar como nao agendado
                    dataAgendado: '',
                  };
                }),
              ],
            },
          },
        },
      },
    });
    return paciente;
  } catch (error) {
    console.log(error);
  }
};

const updatePatient = async (body: any) => {
  try {
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
          vagaId: body.vagaId,
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

    await Promise.all(
      body.sessao.map(async (especialidade: Sessao) => {
        const formatSessao =
          typeof especialidade.valor === 'string'
            ? especialidade.valor.split('R$')[1]
            : especialidade.valor;

        if (!arrEspecialidade.includes(especialidade.especialidadeId)) {
          await prisma.vagaOnEspecialidade.create({
            data: {
              vagaId: body.vagaId,
              agendado: false,
              especialidadeId: especialidade.especialidadeId,
              valor: formatSessao,
            },
          });
        } else {
          await prisma.vagaOnEspecialidade.updateMany({
            data: {
              vagaId: body.vagaId,
              agendado: false,
              valor: formatSessao,
            },
            where: {
              vagaId: body.vagaId,
              especialidadeId: especialidade.especialidadeId,
            },
          });
        }
      })
    );

    return [];
  } catch (error) {
    console.log(error);
  }
};

export const update = async (body: any) => {
  switch (body.statusPacienteCod) {
    case STATUS_PACIENT_COD.queue_avaliation:
    case STATUS_PACIENT_COD.queue_therapy:
    case STATUS_PACIENT_COD.crud_therapy:
      return updatePatient(body);
    case STATUS_PACIENT_COD.devolutiva:
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

export const filterPatients = async (
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
  await Promise.all([
    prisma.vagaOnEspecialidade.deleteMany({
      where: {
        vagaId: id,
      },
    }),

    prisma.vaga.deleteMany({
      where: {
        id: id,
      },
    }),

    prisma.paciente.delete({
      where: {
        id: id,
      },
    }),
  ]);
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
