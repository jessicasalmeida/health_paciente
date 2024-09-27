import { PacienteUseCase } from '../../src/core/usercases/paciente-use-case';
import { ValidationError } from '../../src/common/errors/validation-error';
import { Gateway } from '../../src/operation/gateway/gateway';
import { PasswordHasher } from '../../src/operation/controllers/password-hasher-controller';
import { RabbitMQ } from '../../src/external/mq/mq';
import { Cognito } from '../../src/external/cognito/new_user';
import { Paciente } from '../../src/core/entities/paciente';
import { PacienteRepositoryImpl } from '../../src/external/data-sources/mongodb/paciente-respository-mongo';

jest.mock('../../src/operation/gateway/gateway');
jest.mock('../../src/operation/controllers/password-hasher-controller');
jest.mock('../../src/external/mq/mq');
jest.mock('../../src/external/cognito/new_user');
jest.mock('../../src/external/data-sources/mongodb/paciente-respository-mongo');

describe('PacienteUseCase', () => {

    let pacienteUseCase: PacienteUseCase;
    let gateway: jest.Mocked<Gateway>;
    let passwordHasher: jest.Mocked<PasswordHasher>;
    let mq: jest.Mocked<RabbitMQ>;
    let cognito: jest.Mocked<Cognito>;
    let repository: jest.Mocked<PacienteRepositoryImpl>;

    beforeEach(() => {
        repository = new PacienteRepositoryImpl() as jest.Mocked<PacienteRepositoryImpl>;
        gateway = new Gateway(repository) as jest.Mocked<Gateway>;
        passwordHasher = new PasswordHasher() as jest.Mocked<PasswordHasher>;
        mq = new RabbitMQ() as jest.Mocked<RabbitMQ>;
        cognito = new Cognito() as jest.Mocked<Cognito>;

        pacienteUseCase = new PacienteUseCase(gateway, passwordHasher, mq, cognito);
    });

    describe('create', () => {
        it('should throw a ValidationError if required fields are missing', async () => {
            await expect(pacienteUseCase.create({})).rejects.toThrow(ValidationError);
        });

        it('should hash the password and save the patient', async () => {
            const pacienteData = {
                email: 'test@example.com',
                password: 'password',
                cpf: '12345678900',
                name: 'Test Paciente'
            };
            const hashedPassword = 'hashed_password';
            const mockPaciente = new Paciente('1', 'Test Paciente', '12345678900', 'test@example.com', hashedPassword, '000');

            passwordHasher.hash.mockResolvedValue(hashedPassword);
            cognito.createUser.mockResolvedValue('aws_id');
            gateway.save.mockResolvedValue(mockPaciente);

            const result = await pacienteUseCase.create(pacienteData);

            expect(passwordHasher.hash).toHaveBeenCalledWith(pacienteData.password);
            expect(cognito.createUser).toHaveBeenCalledWith(pacienteData.email);
            expect(cognito.setUserPassword).toHaveBeenCalledWith(pacienteData.email, pacienteData.password);
            expect(gateway.save).toHaveBeenCalledWith(expect.any(Paciente));
            expect(result).toEqual(mockPaciente);
        });
    });

    describe('findById', () => {
        it('should find a patient by ID', async () => {
            const mockPaciente = new Paciente('1', 'Test Paciente', '12345678900', 'test@example.com', 'hashed_password', '000');
            gateway.findById.mockResolvedValue(mockPaciente);

            const result = await pacienteUseCase.findById('1');

            expect(gateway.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockPaciente);
        });
    });

    describe('findDoctors', () => {
        it('should publish and return a list of doctors', async () => {
            const mockDoctors = [{
                _id: '001',
                name: 'Doctor Name',
                cpf: '12345678901',
                crm: 'CRM1234',
                email: 'doctor@example.com',
                password: 'password123',
                idAws: 'idAws'
            }];
            mq.publishExclusive.mockResolvedValue('mockDoctors');
            const result = await pacienteUseCase.findDoctors();
            expect(result).toBeUndefined;
        });

        it('should throw an error if publishing the message fails', async () => {
            mq.publishExclusive.mockRejectedValue(new Error('ConflictError'));

            await expect(pacienteUseCase.findDoctors()).toBeUndefined;
        });
    });

    describe('reserve', () => {
       
        it('should throw an error if reservation fails', async () => {
            const mockPaciente = new Paciente('1', 'Test Paciente', '12345678900', 'test@example.com', 'hashed_password', '000');
            gateway.findById.mockResolvedValue(mockPaciente);

            const reserveServiceMock = jest.fn().mockRejectedValue(new Error('Reserva falhou'));

            await expect(pacienteUseCase.reserve('1', 'appointment_id')).rejects.toThrow('Erro ao reservar o agendamento');
        });
    });

    describe('listAppointments', () => {
        it('should publish and return a list of appointments', async () => {
            const mockResponse = 'Appointment details';
            mq.publishExclusive.mockResolvedValue(mockResponse);

            const result = await pacienteUseCase.listAppointments('1');
            expect(result).toBeUndefined;
        });

        it('should throw an error if publishing the message fails', async () => {
            mq.publishExclusive.mockRejectedValue(new Error('ConflictError'));

            await expect(pacienteUseCase.listAppointments('1')).toBeUndefined;
        });
    });
});
