"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
class PacienteUseCase {
    constructor(gateway, passwordHasher, mq, cognito) {
        this.gateway = gateway;
        this.passwordHasher = passwordHasher;
        this.mq = mq;
        this.cognito = cognito;
    }
    create(pacienteData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pacienteData.email || !pacienteData.password || !pacienteData.cpf) {
                throw new validation_error_1.ValidationError('Missing required fields');
            }
            const hashedPassword = yield this.passwordHasher.hash(pacienteData.password);
            const paciente = new paciente_1.Paciente(pacienteData._id, pacienteData.name, pacienteData.cpf, pacienteData.email, hashedPassword, "000");
            const respostaCognito = yield this.cognito.createUser(pacienteData.email);
            yield this.cognito.setUserPassword(pacienteData.email, pacienteData.password);
            pacienteData.idAws = respostaCognito;
            return this.gateway.save(paciente);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.gateway.findById(id);
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
            const paciente = yield this.findById(idPaciente);
            return reserveService(paciente, idAppointment);
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
function reserveService(paciente, id) {
    dotenv.config();
    return fetch(String(process.env.SCHEDULE_SERVER + "/schedule/reserve/"), {
        method: 'POST',
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({ paciente: paciente, idAppointment: id }),
    })
        .then((response) => {
        console.log(response);
        if (response.status == 200)
            return true;
        return false;
    })
        .catch((erro) => {
        console.log(erro);
        throw new Error("Erro ao reservar o agendamento");
    });
}
