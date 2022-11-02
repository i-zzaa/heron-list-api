import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TipoSessaoProps {
  id: number;
  nome: string;
}

export const getTipoSessao = async () => {
  return await prisma.tipoSessao.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });
};

export const searchTipoSessao = async (word: string) => {
  return await prisma.tipoSessao.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      OR: [
        {
          nome: {
            contains: word,
          },
        },
      ],
    },
  });
};

export const createTipoSessao = async (body: TipoSessaoProps) => {
  return await prisma.tipoSessao.create({
    data: body,
  });
};

export const updateTipoSessao = async (body: TipoSessaoProps, id: number) => {
  return await prisma.tipoSessao.update({
    data: {
      nome: body.nome,
    },
    where: {
      id: Number(id),
    },
  });
};

export const getTipoSessaoUnique = async (id: number) => {
  return await prisma.tipoSessao.findUniqueOrThrow({
    select: {
      nome: true,
      id: true,
    },
    where: {
      id: Number(id),
    },
  });
};
