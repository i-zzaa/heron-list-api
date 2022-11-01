import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import { ERROR_CREATE } from '../utils/message.response';
import { PerfilProps } from './perfil.service';

const prisma = new PrismaClient();

export interface UserRequestProps {
  id?: number;
  nome: string;
  login: string;
  senha: string;
  ativo: boolean;
  perfilId: number;

  especialidadeId: number;
  funcaoId: number;
  fazDevolutiva: boolean;
}

export interface UserProps {
  id?: number;
  nome: string;
  login: string;
  senha?: string;
  perfil?: PerfilProps;
  ativo?: boolean;
}

export const getUsers = async () => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      login: true,
      perfil: true,
      ativo: true,
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

  // return usuarios;

  const format = usuarios.map((usuario: any) => {
    const funcoes = usuario?.terapeuta?.funcoes.map((funcao: any) => {
      return {
        nome: funcao.funcao.nome,
        id: funcao.funcao.id,
      };
    });

    return {
      ...usuario,
      especialidadeId: usuario?.terapeuta?.especialidade,
      funcoes: funcoes,
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
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
      // AND: {
      //   perfil: {
      //     nome: 'Terapeuta',
      //   },
      // },
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
    },
  });

  if (user?.perfil?.nome === 'Terapeuta') {
    await prisma.terapeuta.create({
      data: {
        usuarioId: Number(user.id),
        especialidadeId: body.especialidadeId,
        fazDevolutiva: body.fazDevolutiva,
        funcoes: {
          create: [
            ...body.funcoes.map((funcao: number) => {
              return {
                funcaoId: funcao,
              };
            }),
          ],
        },
      },
    });
  }

  if (!user) throw createError(500, ERROR_CREATE);
  delete user.senha;
  return user;
};

export const updateUser = async (body: UserRequestProps) => {
  const user: UserProps = await prisma.usuario.update({
    include: {
      perfil: true,
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

  if (!user) throw createError(500, ERROR_CREATE);
  delete user.senha;
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
