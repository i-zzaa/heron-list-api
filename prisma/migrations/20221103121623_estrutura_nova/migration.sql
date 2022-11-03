-- CreateTable
CREATE TABLE "Convenio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Convenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "dataNascimento" TEXT NOT NULL,
    "convenioId" INTEGER NOT NULL,
    "statusPacienteId" INTEGER NOT NULL,
    "tipoSessaoId" INTEGER NOT NULL,
    "statusId" INTEGER,
    "emAtendimento" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusPaciente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "StatusPaciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaga" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "dataContato" TEXT NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "observacao" TEXT,
    "naFila" BOOLEAN NOT NULL DEFAULT true,
    "dataSaiuFila" TEXT,
    "devolutiva" BOOLEAN NOT NULL DEFAULT false,
    "dataDevolutiva" TEXT,
    "diff" TEXT,
    "dataRetorno" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VagaOnEspecialidade" (
    "agendado" BOOLEAN NOT NULL DEFAULT false,
    "dataAgendado" TEXT,
    "vagaId" INTEGER NOT NULL,
    "especialidadeId" INTEGER NOT NULL,

    CONSTRAINT "VagaOnEspecialidade_pkey" PRIMARY KEY ("vagaId","especialidadeId")
);

-- CreateTable
CREATE TABLE "VagaTerapia" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "dataVoltouAba" TEXT NOT NULL,
    "observacao" TEXT,
    "naFila" BOOLEAN NOT NULL DEFAULT true,
    "dataSaiuFila" TEXT,
    "diff" TEXT,

    CONSTRAINT "VagaTerapia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VagaTerapiaOnEspecialidade" (
    "especialidadeId" INTEGER NOT NULL,
    "vagaId" INTEGER NOT NULL,
    "agendado" BOOLEAN NOT NULL DEFAULT false,
    "dataAgendado" TEXT,

    CONSTRAINT "VagaTerapiaOnEspecialidade_pkey" PRIMARY KEY ("vagaId","especialidadeId")
);

-- CreateTable
CREATE TABLE "Periodo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Periodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especialidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#000000',

    CONSTRAINT "Especialidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoSessao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoSessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "perfilId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localidade" (
    "id" SERIAL NOT NULL,
    "casa" TEXT NOT NULL,
    "sala" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Localidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusEventos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusEventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frequencia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Frequencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modalidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Modalidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervalo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intervalo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidadeId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Funcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terapeuta" (
    "usuarioId" INTEGER NOT NULL,
    "especialidadeId" INTEGER NOT NULL,
    "fazDevolutiva" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "terapeutaOnFuncao" (
    "terapeutaId" INTEGER NOT NULL,
    "funcaoId" INTEGER NOT NULL,

    CONSTRAINT "terapeutaOnFuncao_pkey" PRIMARY KEY ("terapeutaId","funcaoId")
);

-- CreateTable
CREATE TABLE "Calendario" (
    "id" SERIAL NOT NULL,
    "dataInicio" TEXT NOT NULL,
    "dataFim" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT,
    "diasFrequencia" INTEGER[],
    "ciclo" TEXT NOT NULL,
    "observacao" TEXT,
    "pacienteId" INTEGER NOT NULL,
    "modalidadeId" INTEGER NOT NULL,
    "especialidadeId" INTEGER NOT NULL,
    "terapeutaId" INTEGER NOT NULL,
    "funcaoId" INTEGER NOT NULL,
    "localidadeId" INTEGER NOT NULL,
    "statusEventosId" INTEGER NOT NULL,
    "frequenciaId" INTEGER NOT NULL,
    "intervaloId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calendario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vaga_pacienteId_key" ON "Vaga"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "VagaTerapia_pacienteId_key" ON "VagaTerapia"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_login_key" ON "Usuario"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Terapeuta_usuarioId_key" ON "Terapeuta"("usuarioId");
