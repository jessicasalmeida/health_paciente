export class Appointment {
    constructor(
      public id: string,
      public doctorId: string,
      public patientId: string,
      public date: Date,
      public status: boolean
    ) {}
  }
  