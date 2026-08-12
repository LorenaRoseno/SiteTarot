import "./whatsapp.js";

import {
    inicializarCalendario
} from "./calendar.js";

import {
    inicializarAgendamento,
    buscarHorarios
} from "./agend.js";


inicializarAgendamento();

inicializarCalendario(
    buscarHorarios
);