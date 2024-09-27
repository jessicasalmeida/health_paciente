import { Request, Response } from 'express';
import { PacienteUseCase } from '../../core/usercases/paciente-use-case';
import { Presenter } from '../presenters/presenter';

export class PacienteController {
  constructor(
    private pacienteUseCase: PacienteUseCase
  ) { }

  async create(req: Request, res: Response) {
    try {
      const paciente = await this.pacienteUseCase.create(req.body);
      res.status(201).json(Presenter.toDTO(paciente));
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

  async listDoctors(req: Request, res: Response) {
    try {
      const resposta = await this.pacienteUseCase.findDoctors();
      res.status(200).json(resposta);
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

  async reserve(req: Request, res: Response) {
    try {
      const resposta = await this.pacienteUseCase.reserve(req.query.idPaciente as string, req.query.idAppointment as string);

      if (resposta) {
        res.status(200).json("Agendado com sucesso");
      }
      else {
        res.status(200).json("Reserva não agendada");
      }

    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

  async listAppointments(req: Request, res: Response) {
    try {
      const resposta = await this.pacienteUseCase.listAppointments(req.params.id);
      res.status(200).json(resposta);
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

}
