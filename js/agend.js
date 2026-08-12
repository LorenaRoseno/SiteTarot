import { API_AGENDA } from "./config.js";


const etapaData =
    document.querySelector("#etapa-data");

const etapaHorarios =
    document.querySelector("#etapa-horarios");

const etapaDados =
    document.querySelector("#etapa-dados");


const horariosDisponiveis =
    document.querySelector(
        "#horarios-disponiveis"
    );

const dataSelecionadaTexto =
    document.querySelector(
        "#data-selecionada"
    );


const voltarParaData =
    document.querySelector(
        "#voltar-para-data"
    );

const voltarParaHorarios =
    document.querySelector(
        "#voltar-para-horarios"
    );


const resumoLeitura =
    document.querySelector(
        "#resumo-leitura"
    );

const resumoData =
    document.querySelector(
        "#resumo-data"
    );

const resumoHorario =
    document.querySelector(
        "#resumo-horario"
    );


const modalAgendamento =
    document.querySelector(
        "#modal-agendamento"
    );

const leituraAgendamento =
    document.querySelector(
        ".agendamento-leitura"
    );


const botoesAgendamento =
    document.querySelectorAll(
        ".btn-agendamento"
    );

const botoesFecharAgendamento =
    document.querySelectorAll(
        "[data-fechar-agendamento]"
    );


const cacheHorarios = new Map();


function formatarData(data) {
    const [ano, mes, dia] =
        data.split("-");

    return new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
    ).toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


function mostrarHorarios(
    data,
    horarios
) {
    horariosDisponiveis.innerHTML = "";

    dataSelecionadaTexto.textContent =
        formatarData(data);


    if (horarios.length === 0) {
        horariosDisponiveis.innerHTML =
            "<p>Nenhum horário disponível neste dia.</p>";
    } else {

        horarios.forEach(
            (horario) => {

                const botao =
                    document.createElement(
                        "button"
                    );

                botao.type = "button";

                botao.classList.add(
                    "horario-btn"
                );

                botao.textContent =
                    horario;

                botao.dataset.horario =
                    horario;

                botao.dataset.data =
                    data;

                horariosDisponiveis.appendChild(
                    botao
                );
            }
        );
    }


    etapaData.classList.add(
        "etapa-oculta"
    );

    etapaHorarios.classList.remove(
        "etapa-oculta"
    );
}


export async function buscarHorarios(
    data
) {

    etapaData.classList.add(
        "etapa-oculta"
    );

    etapaHorarios.classList.remove(
        "etapa-oculta"
    );


    horariosDisponiveis.innerHTML =
        '<p class="horarios-loading">Consultando horários disponíveis...</p>';


    /* CACHE */

    if (cacheHorarios.has(data)) {

        mostrarHorarios(
            data,
            cacheHorarios.get(data)
        );

        return;
    }


    try {
        const url =
            `${API_AGENDA}?data=${encodeURIComponent(data)}&_=${Date.now()}`;

        const resposta =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store",
                    redirect: "follow"
                }
            );


        if (!resposta.ok) {
            throw new Error(
                `Erro ao consultar agenda: ${resposta.status}`
            );
        }


        const dados =
            await resposta.json();


        if (!dados.ok) {
            throw new Error(
                dados.erro ||
                "Não foi possível consultar a agenda."
            );
        }


        cacheHorarios.set(
            dados.data,
            dados.disponiveis
        );


        mostrarHorarios(
            dados.data,
            dados.disponiveis
        );

    } catch (erro) {

        console.error(
            "Erro ao consultar horários:",
            erro
        );


        horariosDisponiveis.innerHTML = `
            <p class="horarios-erro">
                Não foi possível carregar os horários.
                Tente novamente.
            </p>
        `;
    }
}


function selecionarHorario(
    botao
) {
    const data =
        botao.dataset.data;

    const horario =
        botao.dataset.horario;


    resumoLeitura.textContent =
        `Leitura: ${leituraAgendamento.textContent}`;

    resumoData.textContent =
        `Data: ${formatarData(data)}`;

    resumoHorario.textContent =
        `Horário: ${horario}`;


    etapaHorarios.classList.add(
        "etapa-oculta"
    );

    etapaDados.classList.remove(
        "etapa-oculta"
    );
}


function abrirAgendamento(
    leitura
) {
    leituraAgendamento.textContent =
        leitura;

    modalAgendamento.classList.add(
        "is-open"
    );

    modalAgendamento.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function fecharAgendamento() {
    modalAgendamento.classList.remove(
        "is-open"
    );

    modalAgendamento.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
}


export function inicializarAgendamento() {

    /* ABRIR MODAL */

    botoesAgendamento.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                () => {
                    abrirAgendamento(
                        botao.dataset.leitura
                    );
                }
            );
        }
    );


    /* FECHAR MODAL */

    botoesFecharAgendamento.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                fecharAgendamento
            );
        }
    );


    /* ESC */

    document.addEventListener(
        "keydown",
        (evento) => {

            if (
                evento.key === "Escape" &&
                modalAgendamento.classList.contains(
                    "is-open"
                )
            ) {
                fecharAgendamento();
            }
        }
    );


    /* ESCOLHER HORÁRIO */

    horariosDisponiveis.addEventListener(
        "click",
        (evento) => {

            const botao =
                evento.target.closest(
                    ".horario-btn"
                );

            if (!botao) {
                return;
            }

            selecionarHorario(botao);
        }
    );


    /* VOLTAR PARA DATA */

    voltarParaData.addEventListener(
        "click",
        () => {

            etapaHorarios.classList.add(
                "etapa-oculta"
            );

            etapaData.classList.remove(
                "etapa-oculta"
            );
        }
    );


    /* VOLTAR PARA HORÁRIOS */

    voltarParaHorarios.addEventListener(
        "click",
        () => {

            etapaDados.classList.add(
                "etapa-oculta"
            );

            etapaHorarios.classList.remove(
                "etapa-oculta"
            );
        }
    );
}