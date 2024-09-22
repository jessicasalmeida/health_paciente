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
exports.pacienteRouter = void 0;
const express_1 = __importStar(require("express"));
const paciente_respository_mongo_1 = require("../../data-sources/mongodb/paciente-respository-mongo");
const paciente_controller_1 = require("../../../operation/controllers/paciente-controller");
const paciente_use_case_1 = require("../../../core/usercases/paciente-use-case");
const password_hasher_controller_1 = require("../../../operation/controllers/password-hasher-controller");
const mq_1 = require("../../mq/mq");
const mq = new mq_1.RabbitMQ();
const repository = new paciente_respository_mongo_1.PacienteRepository();
const passwordHasher = new password_hasher_controller_1.PasswordHasher();
const useCase = new paciente_use_case_1.PacienteUseCase(repository, passwordHasher, mq);
const controller = new paciente_controller_1.PacienteController(useCase);
exports.pacienteRouter = (0, express_1.Router)();
exports.pacienteRouter.use(express_1.default.json());
exports.pacienteRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*  #swagger.tags = ['Paciente']
        #swagger.summary = 'Create'
        #swagger.description = 'Endpoint to create a doctor' */
    const order = yield controller.create(req, res);
}));
exports.pacienteRouter.get('/listDoctors/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*  #swagger.tags = ['Paciente']
    #swagger.summary = 'list doctors'
    #swagger.description = 'Endpoint to list all doctors' */
    const order = yield controller.listDoctors(req, res);
}));
exports.pacienteRouter.get('/reserve/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*  #swagger.tags = ['Doctor']
    #swagger.summary = 'schedule'
    #swagger.description = 'Endpoint to schedule an appointment' */
    const order = yield controller.reserve(req, res);
}));
exports.pacienteRouter.get('/appointments/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*  #swagger.tags = ['Paciente']
    #swagger.summary = 'schedule'
    #swagger.description = 'Endpoint to list appointments by a doctor' */
    const order = yield controller.listAppointments(req, res);
}));
