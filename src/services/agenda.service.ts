import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const getMes = async (current: string) => {
  return[
    { title: 'event 1', date: '2022-10-01T14:30:00' },
    { title: 'event 2', date: '2022-10-01T15:30:00' },
    { title: 'event 3', date: '2022-10-01T16:30:00' },
    { title: 'event 4', date: '2022-10-01T17:30:00' },
    { title: 'event 5', date: '2022-10-01T18:30:00' },
    { title: 'event 6', date: '2022-10-01T19:30:00' },
    { title: 'event 2', date: '2022-10-02' }
  ];
};

export const getDia = async (current: string) => {
  return[
    { title: 'event 1', date: '2022-10-01T14:30:00' },
    { title: 'event 2', date: '2022-10-01T15:30:00' },
    { title: 'event 3', date: '2022-10-01T16:30:00' },
    { title: 'event 4', date: '2022-10-01T17:30:00' },
    { title: 'event 5', date: '2022-10-01T18:30:00' },
    { title: 'event 6', date: '2022-10-01T19:30:00' },
    { title: 'event 2', date: '2022-10-02' }
  ];
};

export const createAgenda = async (body: any) => {
  return [];
};

export const updateAgenda = async (body: any) => {
  return [];
};