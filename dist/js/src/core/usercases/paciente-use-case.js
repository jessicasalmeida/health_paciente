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
exports.PacienteUseCase = void 0;
const validation_error_1 = require("../../common/errors/validation-error");
const mq_1 = require("../../external/mq/mq");
const paciente_1 = require("../entities/paciente");
class PacienteUseCase {
    constructor(pacienteRepository, passwordHasher, mq) {
        this.pacienteRepository = pacienteRepository;
        this.passwordHasher = passwordHasher;
        this.mq = mq;
    }
    create(pacienteData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pacienteData.email || !pacienteData.password || !pacienteData.cpf) {
                throw new validation_error_1.ValidationError('Missing required fields');
            }
            const hashedPassword = yield this.passwordHasher.hash(pacienteData.password);
            const doctor = new paciente_1.Paciente(pacienteData._id, pacienteData.name, pacienteData.cpf, pacienteData.email, hashedPassword);
            return this.pacienteRepository.save(doctor);
        });
    }
    findDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mq = new mq_1.RabbitMQ();
                yield this.mq.connect();
                console.log("Publicado listDoctors");
                const responsta = yield this.mq.publishExclusive('listDoctors', "");
                yield this.mq.close();
                return responsta;
            }
            catch (ConflictError) {
                throw new Error("Erro ao publicar mensagem");
            }
        });
    }
    reserve(idPaciente, idAppointment) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mq = new mq_1.RabbitMQ();
                yield this.mq.connect();
                console.log("Publicado newReserve");
                const responsta = yield this.mq.publishExclusive('newReserve', { idPaciente: idPaciente, idAppointment: idAppointment });
                yield this.mq.close();
                return responsta;
            }
            catch (ConflictError) {
                throw new Error("Erro ao publicar mensagem");
            }
        });
    }
    listAppointments(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mq = new mq_1.RabbitMQ();
                yield this.mq.connect();
                console.log("Publicado listAppointment");
                const responsta = yield this.mq.publishExclusive('listAppointment', { id: id });
                yield this.mq.close();
                return responsta;
            }
            catch (ConflictError) {
                throw new Error("Erro ao publicar mensagem");
            }
        });
    }
}
exports.PacienteUseCase = PacienteUseCase;
