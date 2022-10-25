import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CalendarioProps {
  id: number;
  nome: string;
  ativo: boolean;
}

export const getCalendario = async () => {
  return await prisma.calendario.findMany({
    select: {
      id: true,
      nome: true,
      ativo: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
    },
  });
};

export const getMonth = async (params: any) => {
  return await prisma.calendario.findMany({
    select: {
      id: true,
      nome: true,
      ativo: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
    },
  });
};

export const getWeek = async (params: any) => {
  return await prisma.calendario.findMany({
    select: {
      id: true,
      nome: true,
      ativo: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
    },
  });
};

export const getDay = async (params: any) => {
  return await prisma.calendario.findMany({
    select: {
      id: true,
      nome: true,
      ativo: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
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

export const createCalendario = async (body: CalendarioProps) => {
  return await prisma.calendario.create({
    data: body,
  });
};

export const updateCalendario = async (body: CalendarioProps) => {
  return await prisma.calendario.update({
    data: {
      nome: body.nome,
      ativo: body.ativo,
    },
    where: {
      id: Number(body.id),
    },
  });
};

export const deleteCalendario = async (id: number) => {
  return await prisma.calendario.delete({
    where: {
      id: Number(id),
    },
  });
};
