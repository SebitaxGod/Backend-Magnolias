-- CreateEnum
CREATE TYPE "EstadoEmpresa" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoPostulante" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('FULL_TIME', 'PART_TIME', 'PRACTICA', 'FREELANCE');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'REMOTO', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "EstadoCargo" AS ENUM ('ACTIVA', 'CERRADA', 'EN_PROCESO');

-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('PENDIENTE', 'EVALUADO', 'RECHAZADO', 'SELECCIONADO', 'EN_REVISION');

-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contrasenaHash" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "logoUrl" VARCHAR(255),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoEmpresa" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postulantes" (
    "id" SERIAL NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contrasenaHash" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "cvUrl" VARCHAR(500),
    "linkedinUrl" VARCHAR(255),
    "skillsJson" JSONB,
    "experienciaAnios" INTEGER,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPostulante" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "postulantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" SERIAL NOT NULL,
    "idEmpresa" INTEGER NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipoContrato" "TipoContrato" NOT NULL,
    "ubicacion" VARCHAR(150) NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "salarioEstimado" DECIMAL(12,2),
    "preguntasJson" JSONB,
    "requisitos" TEXT,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "estado" "EstadoCargo" NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postulaciones" (
    "id" SERIAL NOT NULL,
    "idPostulante" INTEGER NOT NULL,
    "idCargo" INTEGER NOT NULL,
    "respuestasJson" JSONB,
    "puntajeIa" DECIMAL(5,2),
    "feedbackIa" TEXT,
    "estado" "EstadoPostulacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaPostulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rut_key" ON "empresas"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_correo_key" ON "empresas"("correo");

-- CreateIndex
CREATE INDEX "empresas_correo_idx" ON "empresas"("correo");

-- CreateIndex
CREATE INDEX "empresas_rut_idx" ON "empresas"("rut");

-- CreateIndex
CREATE INDEX "empresas_estado_idx" ON "empresas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "postulantes_rut_key" ON "postulantes"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "postulantes_correo_key" ON "postulantes"("correo");

-- CreateIndex
CREATE INDEX "postulantes_correo_idx" ON "postulantes"("correo");

-- CreateIndex
CREATE INDEX "postulantes_rut_idx" ON "postulantes"("rut");

-- CreateIndex
CREATE INDEX "postulantes_estado_idx" ON "postulantes"("estado");

-- CreateIndex
CREATE INDEX "cargos_idEmpresa_idx" ON "cargos"("idEmpresa");

-- CreateIndex
CREATE INDEX "cargos_estado_idx" ON "cargos"("estado");

-- CreateIndex
CREATE INDEX "cargos_fechaPublicacion_idx" ON "cargos"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "postulaciones_idPostulante_idx" ON "postulaciones"("idPostulante");

-- CreateIndex
CREATE INDEX "postulaciones_idCargo_idx" ON "postulaciones"("idCargo");

-- CreateIndex
CREATE INDEX "postulaciones_estado_idx" ON "postulaciones"("estado");

-- CreateIndex
CREATE INDEX "postulaciones_fechaPostulacion_idx" ON "postulaciones"("fechaPostulacion");

-- CreateIndex
CREATE UNIQUE INDEX "postulaciones_idPostulante_idCargo_key" ON "postulaciones"("idPostulante", "idCargo");

-- AddForeignKey
ALTER TABLE "cargos" ADD CONSTRAINT "cargos_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_idPostulante_fkey" FOREIGN KEY ("idPostulante") REFERENCES "postulantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_idCargo_fkey" FOREIGN KEY ("idCargo") REFERENCES "cargos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
