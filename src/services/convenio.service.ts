import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConvenioProps {
  id: number;
  nome: string;
}

export const getConvenio = async () => {
  return await prisma.convenio.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });
};

export const searchConvenio = async (word: string) => {
  return await prisma.convenio.findMany({
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

export const createConvenio = async (body: ConvenioProps) => {
  return await prisma.convenio.create({
    data: body,
  });
};

export const updateConvenio = async (body: ConvenioProps, id: number) => {
  return await prisma.convenio.update({
    data: {
      nome: body.nome,
    },
    where: {
      id: Number(id),
    },
  });
};
