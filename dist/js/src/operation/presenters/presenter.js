"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Presenter = void 0;
class Presenter {
    static toDTO(presenter) {
        let dto = {
            _id: presenter._id,
            name: presenter.name,
            cpf: presenter.cpf,
            email: presenter.email,
            password: presenter.password,
            idAws: presenter.idAws
        };
        return dto;
    }
}
exports.Presenter = Presenter;
