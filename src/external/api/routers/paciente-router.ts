import express, { Router } from "express";
import { PacienteRepositoryImpl } from "../../data-sources/mongodb/paciente-respository-mongo";
import { PacienteController } from "../../../operation/controllers/paciente-controller";
import { PacienteUseCase as PacienteUseCase } from "../../../core/usercases/paciente-use-case";
import { PasswordHasher } from "../../../operation/controllers/password-hasher-controller";
import { RabbitMQ } from "../../mq/mq";

const mq = new RabbitMQ();
const repository = new PacienteRepositoryImpl();
const passwordHasher = new PasswordHasher();
const useCase = new PacienteUseCase(repository, passwordHasher, mq);
const controller = new PacienteController(useCase);

export const pacienteRouter = Router();

pacienteRouter.use(express.json());

pacienteRouter.post('/', async (req, res) => {
    /*  #swagger.tags = ['Paciente']
        #swagger.summary = 'Create'
        #swagger.description = 'Endpoint to create a doctor' */
    const order = await controller.create(req, res);
});

pacienteRouter.get('/listDoctors/', async (req, res) => {
    /*  #swagger.tags = ['Paciente']
    #swagger.summary = 'list doctors'
    #swagger.description = 'Endpoint to list all doctors' */
    const order = await controller.listDoctors(req,res);
});

pacienteRouter.post('/reserve/', async (req, res) => {
    /*  #swagger.tags = ['Doctor']
    #swagger.summary = 'schedule'
    #swagger.description = 'Endpoint to schedule an appointment' */
    const order = await controller.reserve(req,res);
});

pacienteRouter.get('/appointments/:id', async (req, res) => {
    /*  #swagger.tags = ['Paciente']
    #swagger.summary = 'schedule'
    #swagger.description = 'Endpoint to list appointments by a doctor' */
    const order = await controller.listAppointments(req,res);
});
