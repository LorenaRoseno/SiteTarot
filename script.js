function abrirWhats(mensagem) {
    const numero = "5534992066429"; // EX: 5534999999999
    const texto = encodeURIComponent(mensagem);
    const url = `https://wa.me/${numero}?text=${texto}`;

    window.open(url, '_blank');
}

const calendarDays = document.querySelector("#calendar-days");
const calendarMes = document.querySelector("#calendar-mes");

const botaoMesAnterior = document.querySelector("#mes-anterior");
const botaoMesSeguinte = document.querySelector("#mes-seguinte");

let mesExibido = new Date();

mesExibido.setDate(1);

function renderizarCalendario() {
    calendarDays.innerHTML = "";

    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    calendarMes.textContent =
        primeiroDia.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric"
        });

    for (let i = 0; i < primeiroDia.getDay(); i++) {
        const vazio = document.createElement("span");

        vazio.classList.add("calendar-empty");

        calendarDays.appendChild(vazio);
    }

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const data = new Date(ano, mes, dia);

        const botao = document.createElement("button");

        botao.type = "button";
        botao.classList.add("calendar-day");

        botao.textContent = dia;

        if (data < hoje) {
            botao.disabled = true;
        }

        botao.dataset.data =
            `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        calendarDays.appendChild(botao);
    }
}

botaoMesAnterior.addEventListener("click", () => {
    mesExibido.setMonth(
        mesExibido.getMonth() - 1
    );

    renderizarCalendario();
});

botaoMesSeguinte.addEventListener("click", () => {
    mesExibido.setMonth(
        mesExibido.getMonth() + 1
    );

    renderizarCalendario();
});

renderizarCalendario();

const API_AGENDA = "https://script.google.com/macros/s/AKfycbxkosLKJ2uBYgVAC4-tEzvuCUy9tpHkIW4AAclrwh3_uxdOh4-dsvnOk7_W7iSHVmdc/exec";
const cacheHorarios = new Map();

async function buscarHorarios(data) {

    etapaData.classList.add("etapa-oculta");
    etapaHorarios.classList.remove("etapa-oculta");

    horariosDisponiveis.innerHTML =
        '<p class="horarios-loading">Consultando horários disponíveis...</p>';

    if (cacheHorarios.has(data)) {
        const horarios = cacheHorarios.get(data);

        mostrarHorarios(data, horarios);
        return;
    }

    try {
        const url =
            `${API_AGENDA}?data=${encodeURIComponent(data)}&_=${Date.now()}`;

        const resposta = await fetch(url, {
            method: "GET",
            cache: "no-store",
            redirect: "follow"
        });

        if (!resposta.ok) {
            throw new Error(
                `Erro ao consultar agenda: ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        if (!dados.ok) {
            throw new Error(
                dados.erro || "Não foi possível consultar a agenda."
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

calendarDays.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".calendar-day");

    if (!botao || botao.disabled) {
        return;
    }

    buscarHorarios(botao.dataset.data);
});

const etapaData = document.querySelector("#etapa-data");
const etapaHorarios = document.querySelector("#etapa-horarios");
const etapaDados = document.querySelector("#etapa-dados");

const voltarParaHorarios = document.querySelector(
    "#voltar-para-horarios"
);

const resumoLeitura = document.querySelector("#resumo-leitura");
const resumoData = document.querySelector("#resumo-data");
const resumoHorario = document.querySelector("#resumo-horario");

const horariosDisponiveis = document.querySelector(
    "#horarios-disponiveis"
);

const dataSelecionadaTexto = document.querySelector(
    "#data-selecionada"
);

const voltarParaData = document.querySelector(
    "#voltar-para-data"
);

function mostrarHorarios(data, horarios) {
    horariosDisponiveis.innerHTML = "";

    const [ano, mes, dia] = data.split("-");

    const dataFormatada =
        new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia)
        ).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

    dataSelecionadaTexto.textContent = dataFormatada;

    if (horarios.length === 0) {
        horariosDisponiveis.innerHTML =
            "<p>Nenhum horário disponível neste dia.</p>";
    } else {
        horarios.forEach((horario) => {
            const botao = document.createElement("button");

            botao.type = "button";
            botao.classList.add("horario-btn");

            botao.textContent = horario;
            botao.dataset.horario = horario;
            botao.dataset.data = data;

            horariosDisponiveis.appendChild(botao);
        });
    }

    etapaData.classList.add("etapa-oculta");
    etapaHorarios.classList.remove("etapa-oculta");
}

horariosDisponiveis.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".horario-btn");

    if (!botao) {
        return;
    }

    const data = botao.dataset.data;
    const horario = botao.dataset.horario;

    const [ano, mes, dia] = data.split("-");

    const dataFormatada = new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
    ).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    resumoLeitura.textContent =
        `Leitura: ${leituraAgendamento.textContent}`;

    resumoData.textContent =
        `Data: ${dataFormatada}`;

    resumoHorario.textContent =
        `Horário: ${horario}`;

    etapaHorarios.classList.add("etapa-oculta");
    etapaDados.classList.remove("etapa-oculta");
});

voltarParaHorarios.addEventListener("click", () => {
    etapaDados.classList.add("etapa-oculta");
    etapaHorarios.classList.remove("etapa-oculta");
});

voltarParaData.addEventListener("click", () => {
    etapaHorarios.classList.add("etapa-oculta");
    etapaData.classList.remove("etapa-oculta");
});

const modalAgendamento = document.querySelector("#modal-agendamento");
const leituraAgendamento = document.querySelector(".agendamento-leitura");

const botoesAgendamento = document.querySelectorAll(".btn-agendamento");
const botoesFecharAgendamento = document.querySelectorAll(
    "[data-fechar-agendamento]"
);

function abrirAgendamento(leitura) {
    leituraAgendamento.textContent = leitura;

    modalAgendamento.classList.add("is-open");
    modalAgendamento.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function fecharAgendamento() {
    modalAgendamento.classList.remove("is-open");
    modalAgendamento.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}

botoesAgendamento.forEach((botao) => {
    botao.addEventListener("click", () => {
        abrirAgendamento(botao.dataset.leitura);
    });
});

botoesFecharAgendamento.forEach((botao) => {
    botao.addEventListener("click", fecharAgendamento);
});

document.addEventListener("keydown", (evento) => {
    if (
        evento.key === "Escape" &&
        modalAgendamento.classList.contains("is-open")
    ) {
        fecharAgendamento();
    }
});