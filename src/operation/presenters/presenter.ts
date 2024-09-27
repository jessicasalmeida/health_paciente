import { PacienteDTO } from "../../common/dto/paciente.dto";
import { Paciente } from "../../core/entities/paciente";


export class Presenter {
    static toDTO(
        presenter: Paciente
    ): PacienteDTO {
        let dto: PacienteDTO = {
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
