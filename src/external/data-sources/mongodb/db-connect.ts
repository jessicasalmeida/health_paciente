import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import { Paciente } from "../../../core/entities/paciente";
import { Appointment } from "../../../core/entities/appointment";

export const collections : {
    paciente?: mongoDB.Collection<Paciente>} = {};

export async function connectToDataBase()
{
    dotenv.config();
    const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING as string);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const pacienteCollection = db.collection<Paciente>(process.env.PACIENTE_COLLECTION_NAME as string);

    collections.paciente = pacienteCollection;

    console.log(`Conexão :` + process.env.DB_CONN_STRING as string);
}