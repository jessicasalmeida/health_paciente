
import { Request, Response } from 'express';
import { PacienteController } from '../../src/operation/controllers/paciente-controller';
import { PacienteUseCase } from '../../src/core/usercases/paciente-use-case';
import { Gateway } from '../../src/operation/gateway/gateway';
import { PacienteRepositoryImpl } from '../../src/external/data-sources/mongodb/paciente-respository-mongo';
import { Presenter } from '../../src/operation/presenters/presenter';
import { PasswordHasher } from '../../src/operation/controllers/password-hasher-controller';
import { RabbitMQ } from '../../src/external/mq/mq';
import { Cognito } from '../../src/external/cognito/new_user';

// Mock dependencies
jest.mock('../../src/core/usercases/paciente-use-case');
jest.mock('../../src/operation/presenters/presenter');
jest.mock('../../src/operation/gateway/gateway');
jest.mock('../../src/external/data-sources/mongodb/paciente-respository-mongo');
jest.mock('../../src/operation/controllers/password-hasher-controller');
jest.mock('../../src/external/mq/mq');

describe('PacienteController', () => {
    let pacienteController: PacienteController;
    let repository: PacienteRepositoryImpl;
    let pacienteUseCase: jest.Mocked<PacienteUseCase>;
    let gateway: jest.Mocked<Gateway>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let passwordHasher: jest.Mocked<PasswordHasher>;
    let mq: jest.Mocked<RabbitMQ>;
    let cognito: jest.Mocked<Cognito>;

    beforeEach(() => {

        passwordHasher = new PasswordHasher() as jest.Mocked<PasswordHasher>;
        mq = new RabbitMQ() as jest.Mocked<RabbitMQ>;
        cognito = new Cognito() as jest.Mocked<Cognito>;
        repository = new PacienteRepositoryImpl() as jest.Mocked<PacienteRepositoryImpl>;
        gateway = new Gateway(repository) as jest.Mocked<Gateway>;
        pacienteUseCase = new PacienteUseCase(gateway, passwordHasher, mq, cognito) as jest.Mocked<PacienteUseCase>;
        pacienteController = new PacienteController(pacienteUseCase);


        // Mock response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock request object
        req = {
            body: {},
            query: {},
            params: {}
        };
    });

    describe('create', () => {
        it('should create a patient and return 201', async () => {
            const mockPaciente = { _id: '1', name: 'Test Paciente', cpf: '', password: '', email: '', idAws: '' };
            pacienteUseCase.create.mockResolvedValue(mockPaciente);
            Presenter.toDTO = jest.fn().mockReturnValue(mockPaciente);

            req.body = { name: 'Test Paciente', email: 'test@example.com', password: 'password', cpf: '12345678900' };

            await pacienteController.create(req as Request, res as Response);

            expect(pacienteUseCase.create).toHaveBeenCalledWith(req.body);
            expect(Presenter.toDTO).toHaveBeenCalledWith(mockPaciente);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockPaciente);
        });

        it('should return 400 if create throws an error', async () => {
            const error = new Error('Create failed');
            pacienteUseCase.create.mockRejectedValue(error);

            await pacienteController.create(req as Request, res as Response);

            expect(pacienteUseCase.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('listDoctors', () => {
        it('should return a list of doctors with status 200', async () => {
            const mockDoctors = [{
                _id: '001',
                name: 'Doctor Name',
                cpf: '12345678901',
                crm: 'CRM1234',
                email: 'doctor@example.com',
                password: 'password123',
                idAws: 'idAws'
            }];
            pacienteUseCase.findDoctors.mockResolvedValue(mockDoctors);

            await pacienteController.listDoctors(req as Request, res as Response);

            expect(pacienteUseCase.findDoctors).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDoctors);
        });

        it('should return 400 if findDoctors throws an error', async () => {
            const error = new Error('Error fetching doctors');
            pacienteUseCase.findDoctors.mockRejectedValue(error);

            await pacienteController.listDoctors(req as Request, res as Response);

            expect(pacienteUseCase.findDoctors).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('reserve', () => {
        it('should return "Agendado com sucesso" when reservation succeeds', async () => {
            pacienteUseCase.reserve.mockResolvedValue(true);

            req.query = { idPaciente: '1', idAppointment: 'appointment_id' };

            await pacienteController.reserve(req as Request, res as Response);

            expect(pacienteUseCase.reserve).toHaveBeenCalledWith('1', 'appointment_id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith('Agendado com sucesso');
        });

        it('should return "Reserva não agendada" when reservation fails', async () => {
            pacienteUseCase.reserve.mockResolvedValue(false);

            req.query = { idPaciente: '1', idAppointment: 'appointment_id' };

            await pacienteController.reserve(req as Request, res as Response);

            expect(pacienteUseCase.reserve).toHaveBeenCalledWith('1', 'appointment_id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith('Reserva não agendada');
        });

        it('should return 400 if reserve throws an error', async () => {
            const error = new Error('Reserve failed');
            pacienteUseCase.reserve.mockRejectedValue(error);

            req.query = { idPaciente: '1', idAppointment: 'appointment_id' };

            await pacienteController.reserve(req as Request, res as Response);

            expect(pacienteUseCase.reserve).toHaveBeenCalledWith('1', 'appointment_id');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });

    describe('listAppointments', () => {
        it('should return a list of appointments with status 200', async () => {
            const mockAppointments = 'Appointment details';
            pacienteUseCase.listAppointments.mockResolvedValue(mockAppointments);

            req.params = { id: '1' };

            await pacienteController.listAppointments(req as Request, res as Response);

            expect(pacienteUseCase.listAppointments).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAppointments);
        });

        it('should return 400 if listAppointments throws an error', async () => {
            const error = new Error('Error fetching appointments');
            pacienteUseCase.listAppointments.mockRejectedValue(error);

            req.params = { id: '1' };

            await pacienteController.listAppointments(req as Request, res as Response);

            expect(pacienteUseCase.listAppointments).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        });
    });
});
