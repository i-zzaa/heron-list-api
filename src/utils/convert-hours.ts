import moment from 'moment';
moment.locale('pt-BR');

export const formatadataPadraoBD = (date: any) => {
  const _date = new Date(date);
  return moment(_date).format('YYYY-MM-DD');
};

export const formatdate = (date: any) => {
  const _date = new Date(date);
  const format = moment(_date).add(1, 'days');
  return moment(format).format('DD/MM/YYYY');
};

export const calculaIdade = (dataNascimento: Date) => {
  const idade = moment(dataNascimento, 'YYYYMMDD').fromNow();
  return idade.replace('há', '');
};

export const calculaData = (data1: any, data2: any) => {
  const dataAtual = moment(data1);
  const dataPassada = moment(data2);
  const diff = moment.duration(dataAtual.diff(dataPassada));

  return diff.asDays();
};

export const getFormat = (dias: number) => {
  if (!dias) return 0;

  const mes = Number((moment.duration(dias).asMonths() + 1).toFixed());
  const anos = Number((moment.duration(dias).asYears() + 1).toFixed());
  const quebraDias = dias % 30;
  const meses = dias % 365;

  let result = '';

  switch (true) {
    case dias < 30:
      return `${dias} dias`;
    case dias < 365:
      result = `${mes} mes(es)`;
      if (quebraDias !== 0) result = `${result} e ${quebraDias} dia(s)`;
      return result;
    case dias >= 365:
      result = `${anos} ano(s)`;

      if (meses !== 0) `${result} e ${meses} mes(es)`;
      if (quebraDias !== 0 && meses !== 0)
        result = `${result}, ${meses} mes(es) e ${quebraDias} dia(s)`;
      if (quebraDias !== 0 && mes === 0)
        result = `${result} e ${quebraDias} dia(s)`;
      return result;
  }
};
