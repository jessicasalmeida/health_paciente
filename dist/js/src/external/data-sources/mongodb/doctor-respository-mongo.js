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
exports.DoctorRepository = void 0;
const db_connect_1 = require("./db-connect");
class DoctorRepository {
    save(doctor) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const savedDoctor = yield ((_a = db_connect_1.collections.doctor) === null || _a === void 0 ? void 0 : _a.insertOne(doctor));
            return savedDoctor;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            {
                const query = { email: (email) };
                const order = yield ((_a = db_connect_1.collections.doctor) === null || _a === void 0 ? void 0 : _a.findOne(query));
                return order;
            }
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            {
                const doctors = yield ((_a = db_connect_1.collections.doctor) === null || _a === void 0 ? void 0 : _a.find());
                return doctors;
            }
        });
    }
}
exports.DoctorRepository = DoctorRepository;
