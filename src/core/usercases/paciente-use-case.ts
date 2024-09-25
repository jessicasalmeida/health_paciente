import { ValidationError } from '../../common/errors/validation-error';
import { PacienteRepository } from '../../common/interfaces/paciente-data-source';
import { RabbitMQ } from '../../external/mq/mq';
import { PasswordHasher } from '../../operation/controllers/password-hasher-controller';
import { Paciente } from '../entities/paciente';
import { Doctor } from '../entities/doctor';
import { Cognito } from '../../external/cognito/new_user';
import * as dotenv from "dotenv";

export class PacienteUseCase {
  constructor(
    private pacienteRepository: PacienteRepository,
    private passwordHasher: PasswordHasher, private mq: RabbitMQ,
    private cognito: Cognito
  ) { }

  async create(pacienteData: Partial<Paciente>): Promise<Paciente> {
    if (!pacienteData.email || !pacienteData.password || !pacienteData.cpf) {
      throw new ValidationError('Missing required fields');
    }

    const hashedPassword = await this.passwordHasher.hash(pacienteData.password);
    const paciente = new Paciente(
      pacienteData._id!,
      pacienteData.name!,
      pacienteData.cpf!,
      pacienteData.email!,
      hashedPassword,
      "000"
    );

    const respostaCognito = await this.cognito.createUser(pacienteData.email);
    await this.cognito.setUserPassword(pacienteData.email, pacienteData.password);
    pacienteData.idAws = respostaCognito
    return this.pacienteRepository.save(paciente);
  }

  async findById(id: string): Promise<Paciente> {
    return this.pacienteRepository.findById(id);
  }

  async findDoctors(): Promise<Doctor[]> {
    try {
      this.mq = new RabbitMQ();
      await this.mq.connect();
      console.log("Publicado listDoctors");
      const responsta = await this.mq.publishExclusive('listDoctors', "");
      await this.mq.close();
      return responsta as unknown as Doctor[];
    }
    catch (ConflictError) {
      throw new Error("Erro ao publicar mensagem");
    }
  }

  async reserve(idPaciente: string, idAppointment: string): Promise<boolean> {
    const paciente = await this.findById(idPaciente);
    try {
      this.mq = new RabbitMQ();
      await this.mq.connect();
      console.log("Publicado newReserve");
      await this.mq.publish('newReserve', { paciente: paciente, idAppointment: idAppointment });
      await this.mq.close();
      return true;
    }
    catch (ConflictError) {
      throw new Error("Erro ao publicar mensagem");
    }
  }

  async listAppointments(id: string): Promise<string> {

    try {
      this.mq = new RabbitMQ();
      await this.mq.connect();
      console.log("Publicado listAppointment");
      const responsta = await this.mq.publishExclusive('listAppointment', { id: id });
      await this.mq.close();
      return responsta;
    }
    catch (ConflictError) {
      throw new Error("Erro ao publicar mensagem");
    }
  }
}

function reserveService(paciente: Paciente, id: string): Promise<boolean> {
  dotenv.config();
  return fetch(String(process.env.SCHEDULE_SERVER + "/reserve/"),
      {
          method: 'POST',
          headers: {
              'content-type': 'application/json;charset=UTF-8',
          },
          body: JSON.stringify({paciente : paciente, idAppointment: id}),
      })
  .then((response) =>{
          console.log(response);
          if(response.status)
            return true
          return false
      })
      .catch((erro)=>{
          console.log(erro);
          throw new Error("Erro ao reservar o agendamento");
      }     
      );
    }

