import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface permissaoProps {
  id: number;
  cod: string;
  descricao: string;
}

export const getPermissao = async () => {
  return await prisma.permissao.findMany({
    select: {
      id: true,
      cod: true,
      descricao: true,
    },
    orderBy: {
      cod: 'asc',
    },
  });
};

export const searchPermissao = async (word: string) => {
  return await prisma.permissao.findMany({
    select: {
      cod: true,
      descricao: true,
    },
    orderBy: {
      cod: 'asc',
    },
    where: {
      OR: [
        {
          cod: {
            contains: word,
          },
        },
        {
          descricao: {
            contains: word,
          },
        },
      ],
    },
  });
};

export const createPermissao = async (body: permissaoProps) => {
  return await prisma.permissao.create({
    data: body,
  });
};

export const updatePermissao = async (body: permissaoProps, id: number) => {
  return await prisma.permissao.update({
    data: {
      cod: body.cod,
      descricao: body.descricao,
    },
    where: {
      id: Number(id),
    },
  });
};
