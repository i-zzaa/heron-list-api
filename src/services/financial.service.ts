import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import {
  FinancialTerapeuta,
  FinancialTerapeutaProps,
} from '../model/financial.model';
import { getFilterFinancialTerapeuta } from './calendario.service';

const prisma = new PrismaClient();

interface FinancialProps {
  terapeutaId: number;
  pacienteId: number;
  datatFim: string;
  dataInicio: string;
}

export const getFinancial = async (body: FinancialProps) => {
  // filtra eventos por terapeuta no peridodo
  // filtra statusEventos cobrados
  // agrupa por paciente
  const { terapeutaId, datatFim, dataInicio } = body;

  const eventos = await getFilterFinancialTerapeuta({
    terapeutaId,
    datatFim,
    dataInicio,
  });

  if (!eventos.length)
    return {
      data: [],
      valorTotal: 0,
      terapeuta: '',
    };

  const relatorio: FinancialTerapeutaProps[] = [];
  let terapeuta;

  eventos.map((evento: any) => {
    const sessao = evento.paciente.vagaTerapia.especialidades.filter(
      (especialidade: any) =>
        especialidade.especialidadeId === evento.especialidade.id
    )[0];

    const comissao = evento.terapeuta.funcoes.filter(
      (funcao: any) => funcao.funcaoId === evento.funcao.id
    )[0];

    const sessaoValor = parseFloat(sessao.valor);
    const comissaoValor = parseFloat(comissao.comissao);

    const isDevolutiva = evento.modalidade.nome === 'Devolutiva';

    terapeuta = evento.terapeuta.usuario.nome;
    const financeiro = new FinancialTerapeuta({
      paciente: evento.paciente.nome,
      terapeuta: terapeuta,
      data: moment(evento.dataInicio).format('DD/MM/YYYY'),
      sessao: sessao.valor,
      km: sessao.km,
      comissao: comissaoValor,
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
        valorSessao = comissaoValor;
        break;
      default:
        valorSessao = sessaoValor * (comissaoValor / 100);
        break;
    }

    financeiro.valorKm = valorKm;
    financeiro.valorSessao = valorSessao;
    financeiro.valorTotal = valorSessao + valorKm;

    relatorio.push({ ...financeiro });

    return;
  });

  // const groubyPaciente: any = {};
  // console.log(relatorio);

  // const valorTotal = relatorio
  //   .map((evento: any) => {
  //     groubyPaciente[evento.paciente].push(evento);

  //     return evento.valorTotal;
  //   })
  //   .reduce((total, valorTotalEvento) => (total += valorTotalEvento));

  return {
    data: relatorio,
    terapeuta,
  };
};
