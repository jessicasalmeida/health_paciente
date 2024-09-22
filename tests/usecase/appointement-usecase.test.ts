
import Agenda from 'agenda';
import { AppointmentRepository } from '../../src/common/interfaces/appointment-data-source';
import { EmailNotificationService } from '../../src/external/notification-service';
import { ScheduleAppointmentUseCase } from '../../src/core/usercases/appointment-use-case';
import { ConflictError } from '../../src/common/errors/conflict-error';

jest.mock('agenda');

const mockAppointmentRepository: Partial<AppointmentRepository> = {
  isAvailable: jest.fn(),
  save: jest.fn(),
};

const mockEmailNotificationService: Partial<EmailNotificationService> = {
  notifyDoctor: jest.fn(),
};

describe('ScheduleAppointmentUseCase', () => {
  let scheduleAppointmentUseCase: ScheduleAppointmentUseCase;
  let mockAgenda: Agenda;

  beforeEach(() => {
    mockAgenda = new Agenda();
    mockAgenda.define = jest.fn();
    mockAgenda.schedule = jest.fn();
    mockAgenda.start = jest.fn();

    scheduleAppointmentUseCase = new ScheduleAppointmentUseCase(
      mockAppointmentRepository as AppointmentRepository,
      mockEmailNotificationService as EmailNotificationService
    );
  });

  it('should schedule an appointment successfully when available', async () => {
    mockAppointmentRepository.isAvailable = jest.fn(() => Promise.resolve(true));

    const appointment = {
      id: '1',
      doctorId: 'doctor123',
      patientId: 'patient123',
      date: new Date(),
    };

    await scheduleAppointmentUseCase.execute(appointment);

    expect(mockAppointmentRepository.isAvailable).toHaveBeenCalledWith('doctor123', appointment.date);
    expect(mockAppointmentRepository.save).toHaveBeenCalledWith(appointment);
    expect(mockAgenda.schedule).toHaveBeenCalledWith(appointment.date, 'sendAppointmentNotification', {
      doctorId: 'doctor123',
      patientId: 'patient123',
      appointmentDate: appointment.date,
    });
  });

  it('should throw conflict error when the time slot is already taken', async () => {
    mockAppointmentRepository.isAvailable = jest.fn(() => Promise.resolve(false));

    const appointment = {
      id: '1',
      doctorId: 'doctor123',
      patientId: 'patient123',
      date: new Date(),
    };

    await expect(scheduleAppointmentUseCase.execute(appointment)).rejects.toThrow(ConflictError);
  });
});
