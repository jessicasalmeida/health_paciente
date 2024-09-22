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
exports.AppointmentRepositoryImpl = void 0;
const db_connect_1 = require("./db-connect");
class AppointmentRepositoryImpl {
    save(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const savedAppointment = yield ((_a = db_connect_1.collections.appointment) === null || _a === void 0 ? void 0 : _a.insertOne(appointment));
            return savedAppointment;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = { appointmentId: (id) };
            const savedAppointment = yield ((_a = db_connect_1.collections.appointment) === null || _a === void 0 ? void 0 : _a.findOne(query));
            return savedAppointment;
        });
    }
    edit(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = { appointmentId: (appointment.id) };
            const savedAppointment = yield ((_a = db_connect_1.collections.appointment) === null || _a === void 0 ? void 0 : _a.updateOne(query, appointment));
            return savedAppointment;
        });
    }
    isAvailable(doctorId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = { doctorId: (doctorId), date: (date), status: true };
            const conflictingAppointment = yield ((_a = db_connect_1.collections.appointment) === null || _a === void 0 ? void 0 : _a.findOne(query));
            if (conflictingAppointment == null) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    findAppointmentsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = { doctorId: (doctorId) };
            const appointments = yield ((_a = db_connect_1.collections.appointment) === null || _a === void 0 ? void 0 : _a.find(query));
            return appointments;
        });
    }
}
exports.AppointmentRepositoryImpl = AppointmentRepositoryImpl;
