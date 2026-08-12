const calendarDays =
    document.querySelector("#calendar-days");

const calendarMes =
    document.querySelector("#calendar-mes");

const botaoMesAnterior =
    document.querySelector("#mes-anterior");

const botaoMesSeguinte =
    document.querySelector("#mes-seguinte");


let mesExibido = new Date();

mesExibido.setDate(1);


function renderizarCalendario() {
    calendarDays.innerHTML = "";

    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();

    const primeiroDia =
        new Date(ano, mes, 1);

    const ultimoDia =
        new Date(ano, mes + 1, 0);

    calendarMes.textContent =
        primeiroDia.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );


    /* DIAS VAZIOS ANTES DO DIA 1 */

    for (
        let i = 0;
        i < primeiroDia.getDay();
        i++
    ) {
        const vazio =
            document.createElement("span");

        vazio.classList.add(
            "calendar-empty"
        );

        calendarDays.appendChild(vazio);
    }


    /* DIAS DO MÊS */

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    for (
        let dia = 1;
        dia <= ultimoDia.getDate();
        dia++
    ) {
        const data =
            new Date(ano, mes, dia);

        const botao =
            document.createElement("button");

        botao.type = "button";

        botao.classList.add(
            "calendar-day"
        );

        botao.textContent = dia;

        if (data < hoje) {
            botao.disabled = true;
        }

        botao.dataset.data =
            `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        calendarDays.appendChild(botao);
    }
}


export function inicializarCalendario(
    aoSelecionarData
) {

    botaoMesAnterior.addEventListener(
        "click",
        () => {
            mesExibido.setMonth(
                mesExibido.getMonth() - 1
            );

            renderizarCalendario();
        }
    );


    botaoMesSeguinte.addEventListener(
        "click",
        () => {
            mesExibido.setMonth(
                mesExibido.getMonth() + 1
            );

            renderizarCalendario();
        }
    );


    calendarDays.addEventListener(
        "click",
        (evento) => {

            const botao =
                evento.target.closest(
                    ".calendar-day"
                );

            if (
                !botao ||
                botao.disabled
            ) {
                return;
            }

            aoSelecionarData(
                botao.dataset.data
            );
        }
    );


    renderizarCalendario();
}