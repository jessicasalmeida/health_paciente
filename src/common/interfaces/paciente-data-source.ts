import { Paciente } from "../../core/entities/paciente";

export interface PacienteRepository {
  save(paciente: Paciente): Promise<Paciente>;
  findByEmail(email: string): Promise<Paciente | null>;
  findById(id: string): Promise<Paciente>;
  findAll(): Promise<Paciente[]>;
}
