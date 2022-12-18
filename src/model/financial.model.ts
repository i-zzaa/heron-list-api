export interface FinancialTerapeutaProps {
  paciente: string;
  terapeuta: string;
  comissao: number;
  tipo: string;
  status: string;
  sessao: number;
  km: number;
  devolutiva: boolean;
  data: string;
}

export class FinancialTerapeuta {
  paciente: string;
  terapeuta: string;
  comissao: number;
  tipo: string;
  status: string;
  data: string;
  sessao: number;
  km: number;
  devolutiva: boolean;
  valorKm: number = 0;
  valorSessao: number = 0;
  valorTotal: number = 0;

  constructor({
    paciente,
    terapeuta,
    data,
    comissao,
    tipo,
    status,
    sessao,
    km,
    devolutiva,
  }: FinancialTerapeutaProps) {
    this.paciente = paciente;
    this.terapeuta = terapeuta;
    this.comissao = comissao;
    this.tipo = tipo;
    this.sessao = sessao;
    this.km = km;
    this.devolutiva = devolutiva;
    this.status = status;
    this.data = data;
  }
}
