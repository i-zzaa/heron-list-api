import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LocalidadeProps {
  id: number;
  casa: string;
  sala: string;
  ativo: boolean;
}

export const formatLocalidade = (item: any) => {
  return `${item.casa} - ${item.sala}`;
};
export const getLocalidade = async () => {
  return await prisma.localidade.findMany({
    select: {
      id: true,
      casa: true,
      sala: true,
      ativo: true,
    },
    orderBy: {
      casa: 'asc',
    },
    where: {
      ativo: true,
    },
  });
};

export const searchLocalidade = async (word: string) => {
  return await prisma.localidade.findMany({
    select: {
      id: true,
      casa: true,
      sala: true,
      ativo: true,
    },
    orderBy: {
      casa: 'asc',
    },
    where: {
      ativo: true,
      OR: [
        {
          casa: {
            contains: word,
          },
        },
        {
          sala: {
            contains: word,
          },
        },
      ],
    },
  });
};

export const createLocalidade = async (body: LocalidadeProps) => {
  return await prisma.localidade.create({
    data: body,
  });
};

export const updateLocalidade = async (body: LocalidadeProps) => {
  return await prisma.localidade.update({
    data: {
      casa: body.casa,
      sala: body.sala,
      ativo: body.ativo,
    },
    where: {
      id: Number(body.id),
    },
  });
};

export const deleteLocalidade = async (id: number) => {
  return await prisma.localidade.delete({
    where: {
      id: Number(id),
    },
  });
};
