-- CreateTable
CREATE TABLE `Convenio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paciente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `responsavel` VARCHAR(191) NOT NULL,
    `dataNascimento` VARCHAR(191) NOT NULL,
    `convenioId` INTEGER NOT NULL,
    `statusPacienteId` INTEGER NOT NULL,
    `tipoSessaoId` INTEGER NOT NULL,
    `statusId` INTEGER NULL,
    `emAtendimento` BOOLEAN NOT NULL DEFAULT false,
    `disabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusPaciente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vaga` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pacienteId` INTEGER NOT NULL,
    `dataContato` VARCHAR(191) NOT NULL,
    `periodoId` INTEGER NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `naFila` BOOLEAN NOT NULL DEFAULT true,
    `dataSaiuFila` VARCHAR(191) NULL,
    `devolutiva` BOOLEAN NOT NULL DEFAULT false,
    `dataDevolutiva` VARCHAR(191) NULL,
    `diff` VARCHAR(191) NULL,
    `dataRetorno` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Vaga_pacienteId_key`(`pacienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VagaOnEspecialidade` (
    `agendado` BOOLEAN NOT NULL DEFAULT false,
    `dataAgendado` VARCHAR(191) NULL,
    `vagaId` INTEGER NOT NULL,
    `especialidadeId` INTEGER NOT NULL,

    PRIMARY KEY (`vagaId`, `especialidadeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VagaTerapia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pacienteId` INTEGER NOT NULL,
    `periodoId` INTEGER NOT NULL,
    `dataVoltouAba` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `naFila` BOOLEAN NOT NULL DEFAULT true,
    `dataSaiuFila` VARCHAR(191) NULL,
    `diff` VARCHAR(191) NULL,

    UNIQUE INDEX `VagaTerapia_pacienteId_key`(`pacienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VagaTerapiaOnEspecialidade` (
    `especialidadeId` INTEGER NOT NULL,
    `vagaId` INTEGER NOT NULL,
    `agendado` BOOLEAN NOT NULL DEFAULT false,
    `dataAgendado` VARCHAR(191) NULL,

    PRIMARY KEY (`vagaId`, `especialidadeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Periodo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Especialidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cor` VARCHAR(191) NOT NULL DEFAULT '#000000',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoSessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `perfilId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_login_key`(`login`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Perfil` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Localidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `casa` VARCHAR(191) NOT NULL,
    `sala` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusEventos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Frequencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modalidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Intervalo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Funcao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `especialidadeId` INTEGER NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Terapeuta` (
    `usuarioId` INTEGER NOT NULL,
    `especialidadeId` INTEGER NOT NULL,
    `fazDevolutiva` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Terapeuta_usuarioId_key`(`usuarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeutaOnFuncao` (
    `terapeutaId` INTEGER NOT NULL,
    `funcaoId` INTEGER NOT NULL,

    PRIMARY KEY (`terapeutaId`, `funcaoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Calendario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` INTEGER NOT NULL,
    `dataInicio` VARCHAR(191) NOT NULL,
    `dataFim` VARCHAR(191) NOT NULL,
    `start` VARCHAR(191) NOT NULL,
    `end` VARCHAR(191) NULL,
    `diasFrequencia` VARCHAR(191) NOT NULL,
    `exdate` VARCHAR(191) NOT NULL DEFAULT '[]',
    `ciclo` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `pacienteId` INTEGER NOT NULL,
    `modalidadeId` INTEGER NOT NULL,
    `especialidadeId` INTEGER NOT NULL,
    `terapeutaId` INTEGER NOT NULL,
    `funcaoId` INTEGER NOT NULL,
    `localidadeId` INTEGER NOT NULL,
    `statusEventosId` INTEGER NOT NULL,
    `frequenciaId` INTEGER NOT NULL,
    `intervaloId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permissao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cod` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsuarioOnPermissao` (
    `permissaoId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    PRIMARY KEY (`permissaoId`, `usuarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
