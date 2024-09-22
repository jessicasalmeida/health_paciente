"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
class Paciente {
    constructor(_id, name, cpf, email, password) {
        this._id = _id;
        this.name = name;
        this.cpf = cpf;
        this.email = email;
        this.password = password;
    }
}
exports.Paciente = Paciente;
