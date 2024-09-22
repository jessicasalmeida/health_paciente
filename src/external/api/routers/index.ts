import express from "express";
import { pacienteRouter } from "./paciente-router";

export const routes = express.Router();

routes.use("/paciente", pacienteRouter);