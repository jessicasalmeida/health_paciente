"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleAppointmentUseCase = void 0;
const conflict_error_1 = require("../../common/errors/conflict-error");
const not_found_error_1 = require("../../common/errors/not-found-error");
const mq_1 = require("../../external/mq/mq");
class ScheduleAppointmentUseCase {
    constructor(appointmentRepository, emailNotificationService, mq) {
        this.appointmentRepository = appointmentRepository;
        this.emailNotificationService = emailNotificationService;
        this.mq = mq;
    }
    reserveAppointment(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            const isAvailable = yield this.appointmentRepository.isAvailable(appointment.doctorId, appointment.date);
            if (!isAvailable) {
                throw new conflict_error_1.ConflictError('Horário já está ocupado.');
            }
            const newAppointment = yield this.appointmentRepository.save(appointment);
            this.mq = new mq_1.RabbitMQ();
            yield this.mq.connect();
            yield this.mq.publish('sendNotification', { message: newAppointment });
            yield this.mq.close();
            return newAppointment;
        });
    }
    newAppointment(appointments) {
        return __awaiter(this, void 0, void 0, function* () {
            const newAppointments = {};
            appointments.forEach((appointment) => __awaiter(this, void 0, void 0, function* () {
                const isAvailable = this.appointmentRepository.isAvailable(appointment.doctorId, appointment.date);
                if (!isAvailable) {
                    throw new conflict_error_1.ConflictError('Horário já está ocupado.');
                }
                newAppointments.push(yield this.appointmentRepository.save(appointment));
            }));
            return newAppointments;
        });
    }
    editAppointment(id, appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            const olderAppointment = yield this.appointmentRepository.findById(id);
            if (olderAppointment) {
                throw new not_found_error_1.NotFoundError("Appointment not founded");
            }
            yield this.appointmentRepository.edit(appointment);
        });
    }
    findAppointmentsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.appointmentRepository.findAppointmentsByDoctor(doctorId);
        });
    }
    listeners() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mq = new mq_1.RabbitMQ();
            yield this.mq.connect();
            yield this.mq.consume('newReserve', (message) => __awaiter(this, void 0, void 0, function* () {
                const appointment = message.appointment;
                console.log("Fila newReserve: " + appointment.id);
                this.reserveAppointment(appointment);
            }));
            yield this.mq.consume('newAppointments', (message) => __awaiter(this, void 0, void 0, function* () {
                const appointments = message.appointments;
                console.log("Fila newAppointments. Lenght: " + appointments.length);
                this.newAppointment(appointments);
            }));
            yield this.mq.consume('editAppointment', (message) => __awaiter(this, void 0, void 0, function* () {
                const appointment = message.appointment;
                const id = message.id;
                console.log("Fila editAppointment. ID: " + appointment.id);
                this.editAppointment(id, appointment);
            }));
            yield this.mq.consume('listAppointment', (message) => __awaiter(this, void 0, void 0, function* () {
                const id = message.id;
                console.log("Fila listAppointment. ID: " + id);
                this.findAppointmentsByDoctor(id);
            }));
        });
    }
}
exports.ScheduleAppointmentUseCase = ScheduleAppointmentUseCase;
