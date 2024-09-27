import { PacienteDTO } from '../../common/dto/paciente.dto';
import { ConflictError } from '../../common/errors/conflict-error';
import { NotFoundError } from '../../common/errors/not-found-error';
import { PacienteRepository } from '../../common/interfaces/paciente-data-source';
import { Paciente } from '../../core/entities/paciente';


export class Gateway {
    dataSource: PacienteRepository;
    constructor(dataSource: PacienteRepository) {
        this.dataSource = dataSource;
    }

    async save(entity: Paciente): Promise<Paciente> {

        const pacienteDTO: PacienteDTO =
        {
            _id: entity._id,
            name: entity.name,
            cpf: entity.cpf,
            email: entity.email,
            password: entity.password,
            idAws: entity.idAws
        };

        const sucesso = await this.dataSource.save(pacienteDTO);
        return sucesso;
    }

    async findByEmail(email: string): Promise<Paciente> {
        const data = await this.dataSource.findByEmail(email);
        if (data) {
            const dataEntity = new Paciente(data._id, data.email, data.cpf, data.email, data.password, data.idAws);
            return dataEntity;
        }
        throw new ConflictError("Erro ao inserir paciente");
    }

    async findById(id: string): Promise<Paciente> {
        const data = await this.dataSource.findById(id);
        if (data) {
            const dataEntity = new Paciente(data._id, data.email, data.cpf, data.email, data.password, data.idAws);
            return dataEntity;
        }
        throw new NotFoundError("Erro ao localizar paciente");
    }

    async findAll(): Promise<Paciente[]> {

        let dataEntity: Array<Paciente> = new Array();
        const data = await this.dataSource.findAll();
        if (data) {
            data.forEach(data => {
                dataEntity.push(new Paciente(data._id, data.email, data.cpf, data.email, data.password, data.idAws))
            });
        }
        return dataEntity;
    }
}