import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ModalidadeProps {
  id: number;
  nome: string;
  ativo: boolean;
}

export const getModalidade = async () => {
  return await prisma.modalidade.findMany({
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

export const searchModalidade = async (word: string) => {
  return await prisma.modalidade.findMany({
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

export const createModalidade = async (body: ModalidadeProps) => {
  return await prisma.modalidade.create({
    data: body,
  });
};

export const updateModalidade = async (body: ModalidadeProps) => {
  return await prisma.modalidade.update({
    data: {
      nome: body.nome,
      ativo: body.ativo,
    },
    where: {
      id: Number(body.id),
    },
  });
};

export const deleteModalidade = async (id: number) => {
  return await prisma.modalidade.delete({
    where: {
      id: Number(id),
    },
  });
};
