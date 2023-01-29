import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import { ERROR_CREATE } from '../utils/message.response';
import { PerfilProps } from './perfil.service';

const prisma = new PrismaClient();

export interface UserRequestProps {
  id: number;
  nome: string;
  login: string;
  senha: string;
  ativo: boolean;
  perfilId: number;

  permissoesId: number[];

  especialidadeId?: number;
  funcoesId?: any[];
  fazDevolutiva?: boolean;
  cargaHoraria?: any[];
}

export interface UserProps {
  id?: number;
  nome: string;
  login: string;
  senha?: string;
  perfil?: PerfilProps;
  ativo?: boolean;
  permissoes?: any;
}

export const getUsers = async () => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      login: true,
      perfil: true,
      ativo: true,
      permissoes: {
        include: {
          permissao: true,
        },
      },
      terapeuta: {
        include: {
          especialidade: {
            select: {
              nome: true,
              id: true,
            },
          },
          funcoes: {
            include: {
              funcao: true,
            },
          },
        },
      },
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
      NOT: {
        perfil: {
          nome: {
            in: ['developer', 'Developer'],
          },
        },
      },
    },
  });

  const format = usuarios.map((usuario: any) => {
    const funcoesId = usuario?.terapeuta?.funcoes.map((funcao: any) => {
      return {
        nome: funcao.funcao.nome,
        id: funcao.funcao.id,
      };
    });

    const permissoesId = usuario?.permissoes.map(
      ({ permissao }: any) => permissao.id
    );

    delete usuario.permissoes;

    return {
      ...usuario,
      especialidadeId: usuario?.terapeuta?.especialidade,
      permissoesId: permissoesId,
      funcoesId: funcoesId,
    };
  });

  return format || [];
};

export const getUser = async (login: string) => {
  return await prisma.usuario.findUniqueOrThrow({
    select: {
      id: true,
      nome: true,
      login: true,
      perfil: true,
      ativo: true,
      permissoes: {
        select: {
          permissao: true,
        },
      },
    },
    where: {
      login: login,
    },
  });
};

export const getTerapeuta = async () => {
  const user = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      login: true,
      perfil: true,
      ativo: true,
      terapeuta: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
      AND: {
        perfil: {
          nome: 'Terapeuta',
        },
      },
    },
  });

  return user;
};

export const searchUsers = async (word: string) => {
  return await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      login: true,
      perfil: true,
      permissoes: {
        select: {
          permissaoId: true,
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
          login: { contains: word },
        },
      ],
      NOT: {
        perfil: {
          nome: {
            in: ['developer', 'Developer'],
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

export const createUser = async (body: any) => {
  body.senha = bcrypt.hashSync('12345678', 8);

  const user: UserProps = await prisma.usuario.create({
    select: {
      nome: true,
      login: true,
      id: true,
      perfil: true,
    },
    data: {
      nome: body.nome.toUpperCase(),
      login: body.login.toLowerCase(),
      perfilId: body.perfilId,
      senha: body.senha,
      permissoes: {
        create: [
          ...body.permissoesId.map((id: number) => {
            return {
              permissaoId: id,
            };
          }),
        ],
      },
    },
  });

  console.log(body);

  // await prisma.usuarioOnPermissao.createMany({
  //   data: [
  //     ...body.permissoesId.map((id: number) => {
  //       return {
  //         usuarioId: user.id,
  //         permissaoId: id,
  //       };
  //     }),
  //   ],
  // });

  if (user.perfil?.nome === 'Terapeuta') {
    await prisma.terapeuta.create({
      data: {
        usuarioId: user.id,
        especialidadeId: body.especialidadeId,
        fazDevolutiva: body.devolutiva,
        cargaHoraria: JSON.stringify(body.cargaHoraria),
        // funcoes: {
        //   create: [
        //     ...body.comissao.map((comissao: any) => {
        //       return {
        //         terapeutaId: user.id,
        //         funcaoId: comissao.funcaoId,
        //         comissao: comissao.valor.toString(),
        //         tipo: comissao.tipo,
        //       };
        //     }),
        //   ],
        // },
      },
    });

    await prisma.terapeutaOnFuncao.createMany({
      data: [
        ...body.comissao.map((comissao: any) => {
          return {
            terapeutaId: user.id,
            funcaoId: comissao.funcaoId,
            comissao: comissao.valor.toString(),
            tipo: comissao.tipo,
          };
        }),
      ],
    });
  }

  if (!user) throw createError(500, ERROR_CREATE);
  delete user.senha;
  return user;
};

export const updateUser = async (body: any) => {
  if (!body.ativo) {
    return await prisma.usuario.update({
      data: {
        ativo: false,
      },
      where: {
        id: body.id,
      },
    });
  }

  await prisma.usuarioOnPermissao.deleteMany({
    where: {
      usuarioId: body.id,
    },
  });

  await prisma.usuarioOnPermissao.createMany({
    data: [
      ...body.permissoesId.map((permissao: number) => {
        return {
          permissaoId: permissao,
          usuarioId: body.id,
        };
      }),
    ],
  });

  if (body.perfilId === 6) {
    //Terapeuta

    if (body?.comissao?.length) {
      await prisma.terapeutaOnFuncao.deleteMany({
        where: {
          terapeutaId: body.id,
        },
      });

      await prisma.terapeutaOnFuncao.createMany({
        data: [
          ...body.comissao.map((comissao: any) => {
            return {
              funcaoId: comissao.funcaoId,
              terapeutaId: body.id,
              valor: comissao.valor,
              tipo: comissao.tipo,
            };
          }),
        ],
      });
    }

    await prisma.terapeuta.update({
      data: {
        especialidadeId: body.especialidadeId,
        fazDevolutiva: body.fazDevolutiva,
        cargaHoraria: body.cargaHoraria,
      },
      where: {
        usuarioId: body.id,
      },
    });
  }

  const user = await prisma.usuario.update({
    select: {
      nome: true,
      login: true,
      perfil: true,
      ativo: true,
    },
    data: {
      nome: body.nome,
      login: body.login,
      perfilId: Number(body.perfilId),
      ativo: body.ativo,
    },
    where: {
      id: body.id,
    },
  });

  // if (!user) throw createError(500, ERROR_CREATE);

  return user;
};

export const updatePassword = async (userId: number) => {
  const senha = bcrypt.hashSync('12345678', 8);
  const user = await prisma.usuario.update({
    data: {
      senha: senha,
    },
    where: {
      id: Number(userId),
    },
  });

  return user;
};

export const updatePasswordLogin = async (login: string, data: any) => {
  const senha = bcrypt.hashSync(data.senha.toString(), 8);

  const user = await prisma.usuario.update({
    data: {
      senha: senha,
    },
    where: {
      login,
    },
  });

  return user;
};
