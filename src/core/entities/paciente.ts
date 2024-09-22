export class Paciente {
    constructor(
      public _id: string,
      public name: string,
      public cpf: string,
      public email: string,
      public password: string
    ) {}
  }