import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  FinancialTerapeuta,
  FinancialTerapeutaProps,
} from '../model/financial.model';
import { getFilterFinancialTerapeuta } from './calendario.service';

import {
  getPatientId,
  PatientProps,
  setStatusPaciente,
} from './patient.service';

const prisma = new PrismaClient();

interface FinancialProps {
  terapeutaId: number;
  pacienteId: number;
  datatFim: string;
  datatInicio: string;
}

export const getFinancial = async (body: FinancialProps) => {
  // filtra eventos por terapeuta no peridodo
  // filtra statusEventos cobrados
  // agrupa por paciente
  const { terapeutaId, datatFim, datatInicio } = body;

  const eventos = await getFilterFinancialTerapeuta({
    terapeutaId,
    datatFim,
    datatInicio,
  });
  const relatorio: FinancialTerapeutaProps[] = [];
  let terapeuta;

  eventos.map((evento: any) => {
    const sessao = evento.paciente.vagaTerapia.especialidades.filter(
      (especialidade: any) =>
        especialidade.especialidadeId === evento.especialidade.id
    )[0];
    const comissao = evento.terapeuta.funcoes.filter(
      (funcao: any) => funcao.funcaoId === evento.funcaoId
    )[0];
    const isDevolutiva = evento.modalidade.nome === 'Devolutiva';

    terapeuta = evento.terapeuta.nome;
    const financeiro = new FinancialTerapeuta({
      paciente: evento.paciente.nome,
      terapeuta: evento.terapeuta.nome,
      data: evento.dataInicio,
      sessao: sessao.valor,
      km: sessao.km,
      comissao: comissao.valor,
      tipo: comissao.tipo,
      status: evento.statusEventos.nome,
      devolutiva: isDevolutiva,
    });

    if (isDevolutiva) {
      financeiro.valorSessao = 50;
      financeiro.valorTotal = 50;

      relatorio.push(financeiro);

      return;
    }

    const valorKm = sessao.km * 0.9;
    let valorSessao = 0;

    switch (comissao.tipo) {
      case 'fixo':
        valorSessao = comissao.valor;
        break;
      default:
        valorSessao = sessao.valor * (comissao.valor / 100);
        break;
    }

    financeiro.valorKm = valorKm;
    financeiro.valorSessao = valorSessao;
    financeiro.valorTotal = valorSessao + valorKm;

    relatorio.push(financeiro);

    return;
  });

  const groubyPaciente: any = {};
  const valorTotal = relatorio
    .map((evento: any) => {
      if (groubyPaciente.hasOwnProperty(evento.paciente)) {
        groubyPaciente[evento.paciente].push(evento);
      }

      return evento.valorTotal;
    })
    .reduce((total, valorTotalEvento) => (total += valorTotalEvento));

  return {
    data: Object.keys(groubyPaciente),
    valorTotal,
    terapeuta,
  };
};
