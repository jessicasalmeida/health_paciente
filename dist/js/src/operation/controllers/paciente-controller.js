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
exports.PacienteController = void 0;
class PacienteController {
    constructor(pacienteUseCase) {
        this.pacienteUseCase = pacienteUseCase;
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctor = yield this.pacienteUseCase.create(req.body);
                res.status(201).json(doctor);
            }
            catch (e) {
                res.status(400).json({ message: e.message });
            }
        });
    }
    listDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resposta = yield this.pacienteUseCase.findDoctors();
                res.status(200).json(resposta);
            }
            catch (e) {
                res.status(400).json({ message: e.message });
            }
        });
    }
    reserve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resposta = yield this.pacienteUseCase.reserve(req.query.idPaciente, req.query.idAppointment);
                if (resposta) {
                    res.status(200).json("Agendado com sucesso");
                }
                else {
                    res.status(200).json("Reserva não agendada");
                }
            }
            catch (e) {
                res.status(400).json({ message: e.message });
            }
        });
    }
    listAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resposta = yield this.pacienteUseCase.listAppointments(req.params.id);
                res.status(200).json(resposta);
            }
            catch (e) {
                res.status(400).json({ message: e.message });
            }
        });
    }
}
exports.PacienteController = PacienteController;
