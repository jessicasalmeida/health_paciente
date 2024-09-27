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
exports.Gateway = void 0;
const conflict_error_1 = require("../../common/errors/conflict-error");
const not_found_error_1 = require("../../common/errors/not-found-error");
const paciente_1 = require("../../core/entities/paciente");
class Gateway {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    save(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const pacienteDTO = {
                _id: entity._id,
                name: entity.name,
                cpf: entity.cpf,
                email: entity.email,
                password: entity.password,
                idAws: entity.idAws
            };
            const sucesso = yield this.dataSource.save(pacienteDTO);
            return sucesso;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.dataSource.findByEmail(email);
            if (data) {
                const dataEntity = new paciente_1.Paciente(data._id, data.email, data.cpf, data.email, data.password, data.idAws);
                return dataEntity;
            }
            throw new conflict_error_1.ConflictError("Erro ao inserir paciente");
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.dataSource.findById(id);
            if (data) {
                const dataEntity = new paciente_1.Paciente(data._id, data.email, data.cpf, data.email, data.password, data.idAws);
                return dataEntity;
            }
            throw new not_found_error_1.NotFoundError("Erro ao localizar paciente");
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let dataEntity = new Array();
            const data = yield this.dataSource.findAll();
            if (data) {
                data.forEach(data => {
                    dataEntity.push(new paciente_1.Paciente(data._id, data.email, data.cpf, data.email, data.password, data.idAws));
                });
            }
            return dataEntity;
        });
    }
}
exports.Gateway = Gateway;
