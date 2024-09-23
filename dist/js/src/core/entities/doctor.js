"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
class Doctor {
    constructor(_id, name, cpf, crm, email, password) {
        this._id = _id;
        this.name = name;
        this.cpf = cpf;
        this.crm = crm;
        this.email = email;
        this.password = password;
    }
}
exports.Doctor = Doctor;
