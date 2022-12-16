-- AlterTable
ALTER TABLE `calendario` MODIFY `exdate` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `Comissao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `terapeutaId` INTEGER NULL,
    `especialidadeId` INTEGER NULL,
    `comissao` VARCHAR(191) NOT NULL DEFAULT '80',
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'fixo',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pacienteId` INTEGER NULL,
    `especialidadeId` INTEGER NULL,
    `valor` VARCHAR(191) NOT NULL DEFAULT '200',
    `km` VARCHAR(191) NOT NULL DEFAULT '0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
