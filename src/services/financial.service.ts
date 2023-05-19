import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { especialidadeController } from '../controllers/especialidade.controller';
import {
  FinancialPaciente,
  FinancialPacienteProps,
  FinancialTerapeuta,
  FinancialTerapeutaProps,
} from '../model/financial.model';
import {
  formatDateTime,
  formaTime,
  getDatesWhiteEvents,
} from '../utils/convert-hours';
import {
  getFilterFinancialPaciente,
  getFilterFinancialTerapeuta,
} from './calendario.service';

interface FinancialProps {
  terapeutaId: number;
  pacienteId: number;
  statusEventosId: number;
  datatFim: string;
  dataInicio: string;
}

const dateBetween = (
  dateAtual: string,
  datatPesquisaFim: string,
  dataPesquisaInicio: string
) => {
  const date = moment(dateAtual).format('YYYY-MM-DD');

  const inicioDoMes = moment(dataPesquisaInicio).format('YYYY-MM-DD');
  const fimDoMes = moment(datatPesquisaFim).format('YYYY-MM-DD');

  return date >= inicioDoMes && date <= fimDoMes;
};

export const getFinancialPaciente = async (body: FinancialProps) => {
  // filtra eventos por terapeuta no peridodo
  // filtra statusEventos cobrados
  // agrupa por paciente

  try {
    const { pacienteId, datatFim, dataInicio, statusEventosId } = body;

    const eventosBrutos = await getFilterFinancialPaciente({
      pacienteId,
      datatFim,
      dataInicio,
    });

    if (!eventosBrutos.length)
      return {
        data: [],
        valorTotal: 0,
        paciente: '',
        valorKm: 0,
      };

    const eventos: any = [];
    await Promise.all(
      eventosBrutos.map((event: any) => {
        const dataFimParam = event?.dataFim || datatFim;

        const newEvents = getDatesWhiteEvents(
          event?.diasFrequencia.split(','),
          event.dataInicio,
          dataFimParam,
          event.intervalo.id,
          event
        );

        eventos.push(...newEvents);
      })
    );

    if (!eventos.length)
      return {
        data: [],
        valorTotal: 0,
        paciente: '',
        valorKm: 0,
      };

    const relatorio: FinancialPacienteProps[] = [];
    let paciente;

    let valorTotal = 0;
    let valorKm = 0;
    let horas = moment.duration(0);

    const especialidadeTimeSessions: any = {};

    await Promise.all(
      eventos.map((evento: any) => {
        const exdate = evento?.exdate ? evento.exdate.split(',') : [];

        if (
          exdate.includes(evento.dataInicio) ||
          !dateBetween(evento.dataInicio, datatFim, dataInicio) ||
          (statusEventosId && evento.statusEventos.id != statusEventosId)
        ) {
          return;
        }

        // console.log(evento);

        const sessao = evento.paciente?.vaga.especialidades.filter(
          (especialidadePaciente: any) =>
            especialidadePaciente.especialidadeId === evento.especialidade.id
        )[0];

        if (!sessao) {
          return;
        }

        paciente = evento.paciente.nome;

        const start = formatDateTime(evento.start, evento.dataInicio);
        const end = formatDateTime(evento.end, evento.dataInicio);

        let diff = moment(end, 'YYYY-MM-DD HH:mm').diff(
          moment(start, 'YYYY-MM-DD HH:mm')
        );

        let duracaoTotal = moment.duration(
          especialidadeTimeSessions[evento.especialidade.nome] || 0
        );
        const duracaoEspecialidadeSessaoTotal = duracaoTotal.add(
          moment.duration(diff)
        );

        especialidadeTimeSessions[evento.especialidade.nome] =
          evento.statusEventos.cobrar &&
          formaTime(duracaoEspecialidadeSessaoTotal);

        console.log(evento.km);

        const financeiro = new FinancialPaciente({
          paciente: evento.paciente.nome,
          terapeuta: evento.terapeuta.usuario.nome,
          data: moment(evento.dataInicio).format('DD/MM/YYYY'),
          sessao: evento.statusEventos.cobrar ? parseFloat(sessao.valor) : 0,
          km: !!evento.km ? parseFloat(evento.km) : 0,
          status: evento.statusEventos.nome,
          valorSessao: evento.statusEventos.cobrar
            ? parseFloat(sessao.valor)
            : 0,
          funcao: evento.funcao.nome,
          valorTotal: evento.statusEventos.cobrar
            ? parseFloat(sessao.valor)
            : 0,
          horas: formaTime(moment.duration(diff)),
          especialidade: evento.especialidade.nome,
        });

        if (!evento.statusEventos.cobrar) {
          relatorio.push(financeiro);
          return;
        }

        relatorio.push({ ...financeiro });

        // valorTotal += parseFloat(sessao.valor);

        valorTotal += financeiro.valorTotal;
        horas = horas.add(financeiro.horas);
        valorKm += financeiro.km;

        return;
      })
    );

    const terapeutasAgrupados: any = {};
    await Promise.all(
      relatorio.map((item: FinancialPacienteProps) => {
        if (!terapeutasAgrupados[item.terapeuta]) {
          terapeutasAgrupados[item.terapeuta] = [];
        }
        terapeutasAgrupados[item.terapeuta].push(item);
      })
    );

    return {
      data: terapeutasAgrupados,
      nome: paciente,
      geral: {
        nome: paciente,
        valorTotal: valorTotal,
        horas: formaTime(horas),
        valorKm: valorKm,
        especialidadeSessoes: especialidadeTimeSessions,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

export const getFinancial = async (body: FinancialProps) => {
  try {
    const { terapeutaId, datatFim, dataInicio, statusEventosId } = body;

    const eventosBrutos = await getFilterFinancialTerapeuta({
      terapeutaId,
      datatFim,
      dataInicio,
    });

    if (!eventosBrutos.length)
      return {
        data: [],
        valorTotal: 0,
        terapeuta: '',
      };

    // console.log(eventosBrutos);

    const eventos: any = [];
    await Promise.all(
      eventosBrutos.map((event: any) => {
        const dataFimParam = event?.dataFim || datatFim;

        const newEvents = getDatesWhiteEvents(
          event?.diasFrequencia.split(','),
          event.dataInicio,
          dataFimParam,
          event.intervalo.id,
          event
        );

        eventos.push(...newEvents);
      })
    );

    if (!eventos.length)
      return {
        data: [],
        valorTotal: 0,
        terapeuta: '',
      };

    const relatorio: FinancialTerapeutaProps[] = [];
    let terapeuta;
    let valorTotal = 0;
    let valorKm = 0;
    let horas = moment.duration(0);
    let especialidade = '';

    await Promise.all(
      eventos.map((evento: any) => {
        const exdate = evento?.exdate ? evento.exdate.split(',') : [];
        if (
          exdate.includes(evento.dataInicio) ||
          !dateBetween(evento.dataInicio, datatFim, dataInicio) ||
          (statusEventosId && evento.statusEventos.id != statusEventosId)
        ) {
          return;
        }

        const sessao = evento.paciente?.vaga.especialidades.filter(
          (especialidadePaciente: any) =>
            especialidadePaciente.especialidadeId === evento.especialidade.id
        )[0];

        if (!sessao) {
          return;
        }
        const comissao = evento.terapeuta.funcoes.filter(
          (funcao: any) => funcao.funcaoId === evento.funcao.id
        )[0];

        const sessaoValor = parseFloat(sessao.valor);
        const comissaoValor = parseFloat(comissao.comissao);

        const isDevolutiva = evento.modalidade.nome === 'Devolutiva';

        const start = formatDateTime(evento.start, evento.dataInicio);
        const end = formatDateTime(evento.end, evento.dataInicio);

        var diff = moment(end, 'YYYY-MM-DD HH:mm').diff(
          moment(start, 'YYYY-MM-DD HH:mm')
        );

        terapeuta = evento.terapeuta.usuario.nome;
        especialidade = evento.especialidade.nome;
        const financeiro = new FinancialTerapeuta({
          paciente: evento.paciente.nome,
          terapeuta: terapeuta,
          data: moment(evento.dataInicio).format('DD/MM/YYYY'),
          sessao: sessaoValor,
          km: Number(evento.km),
          comissao: comissaoValor,
          tipo: comissao.tipo,
          status: evento.statusEventos.nome,
          devolutiva: isDevolutiva,
          horas: formaTime(moment.duration(diff)),
        });

        if (!evento.statusEventos.cobrar) {
          financeiro.comissao = 0;
          financeiro.valorSessao = 0;
          financeiro.valorTotal = 0;
          financeiro.km = 0;

          relatorio.push(financeiro);
          return;
        }

        if (isDevolutiva) {
          financeiro.valorSessao = 50;
          financeiro.valorTotal = 50;

          valorTotal += financeiro.valorTotal;
          horas = horas.add(financeiro.horas);

          relatorio.push(financeiro);

          return;
        }

        const valorKmEvento = Number(evento.km) * 0.9;
        let valorSessao = 0;

        switch (comissao.tipo.toLowerCase()) {
          case 'fixo':
            valorSessao = comissaoValor;
            break;
          default:
            valorSessao = sessaoValor * (comissaoValor / 100);
            break;
        }

        financeiro.valorKm = valorKmEvento;
        financeiro.valorSessao = valorSessao;
        financeiro.valorTotal = valorSessao + valorKmEvento;

        valorTotal += financeiro.valorTotal;
        valorKm += financeiro.valorKm;
        horas = horas.add(financeiro.horas);

        relatorio.push({ ...financeiro });

        return;
      })
    );

    const pacientesAgrupados: any = {};
    await Promise.all(
      relatorio.map((item: FinancialTerapeutaProps) => {
        if (!pacientesAgrupados[item.paciente]) {
          pacientesAgrupados[item.paciente] = [];
        }
        pacientesAgrupados[item.paciente].push(item);
      })
    );

    return {
      data: pacientesAgrupados,
      nome: terapeuta,
      geral: {
        nome: terapeuta,
        valorTotal: valorTotal,
        horas: formaTime(horas),
        valorKm: valorKm,
        especialidade: especialidade,
      },
    };
  } catch (error) {
    console.log(error);
  }
};
