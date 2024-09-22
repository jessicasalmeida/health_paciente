import { collections } from "./db-connect";
import { Paciente } from '../../../core/entities/paciente';
import { PacienteRepository } from "../../../common/interfaces/paciente-data-source";

export class PacienteRepositoryImpl implements PacienteRepository {


  async save(paciente: Paciente): Promise<Paciente> {
    const savedpaciente = await collections.paciente?.insertOne(paciente);
    return savedpaciente as unknown as Paciente;
  }

  async findByEmail(email: string): Promise<Paciente | null> {
    {
      const query = { email: (email) };
      const order = await collections.paciente?.findOne(query);
      return order as Paciente;
    }
  }

  async findById(id: string): Promise<Paciente> {
    {
      const query = { _id: (id) };
      const order = await collections.paciente?.findOne(query);
      return order as Paciente;
    }
  }

  async findAll(): Promise<Paciente[]> {
    {
      const pacientes = await collections.paciente?.find();
      return pacientes as unknown as  Paciente[];
    }
  }

}
