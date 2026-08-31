const CALENDAR_ID = "nodustarot@gmail.com";
const TIME_ZONE = "America/Sao_Paulo";
const DURACAO_CONSULTA = 45;
const INTERVALO_CONSULTAS = 5;

const PASSO_AGENDAMENTO =
  DURACAO_CONSULTA + INTERVALO_CONSULTAS;

const DISPONIBILIDADE = {
  0: [ // Domingo
    ["09:00", "12:00"],
    ["15:00", "21:00"]
  ],
  1: [ // Segunda
    ["09:00", "12:00"],
    ["15:00", "21:00"]
  ],
  2: [ // Terça
    ["09:00", "12:00"],
    ["15:00", "21:00"]
  ],
  3: [ // Quarta
    ["09:00", "12:00"],
    ["15:00", "21:00"]
  ],
  4: [ // Quinta
    ["09:00", "12:00"],
    ["15:00", "21:00"]
  ],
  5: [ // Sexta
    ["09:00", "12:00"],
    ["15:00", "21:00"]
  ],
  6: [ // Sábado
    ["09:00", "12:00"],
    ["15:00", "21:00"]
  ]
};

function doGet(e) {
  const agenda = CalendarApp.getCalendarById(CALENDAR_ID);

  if (!agenda) {
    return respostaJson({
      ok: false,
      erro: "Agenda não encontrada."
    });
  }

  const data = e.parameter.data;

  if (!data) {
    return respostaJson({
      ok: true,
      mensagem: "API Nodus funcionando.",
      timeZone: TIME_ZONE
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return respostaJson({
      ok: false,
      erro: "Data inválida. Use YYYY-MM-DD."
    });
  }

  const [ano, mes, dia] = data
    .split("-")
    .map(Number);

  const dataSelecionada = new Date(
    ano,
    mes - 1,
    dia
  );

  const dataValida =
    dataSelecionada.getFullYear() === ano &&
    dataSelecionada.getMonth() === mes - 1 &&
    dataSelecionada.getDate() === dia;

  if (!dataValida) {
    return respostaJson({
      ok: false,
      erro: "Data inválida."
    });
  }

  const diaSemana = dataSelecionada.getDay();

  const periodos = DISPONIBILIDADE[diaSemana];

  if (!periodos) {
    return respostaJson({
      ok: true,
      data: data,
      duracao: DURACAO_CONSULTA,
      disponiveis: []
    });
  }

  const eventos = agenda.getEventsForDay(
    dataSelecionada
  );

  const horariosDisponiveis = [];

  const agora = new Date();

  periodos.forEach(
    ([inicioPeriodo, fimPeriodo]) => {

      let inicioSlot = criarHorario(
        dataSelecionada,
        inicioPeriodo
      );

      const fimPeriodoDate = criarHorario(
        dataSelecionada,
        fimPeriodo
      );

      while (true) {

        const fimSlot = new Date(
          inicioSlot.getTime() +
          DURACAO_CONSULTA * 60 * 1000
        );

        if (fimSlot > fimPeriodoDate) {
          break;
        }

        const ocupado = eventos.some(
          (evento) => {

            if (evento.isAllDayEvent()) {
              return true;
            }

            return (
              inicioSlot < evento.getEndTime() &&
              fimSlot > evento.getStartTime()
            );
          }
        );

        if (
          !ocupado &&
          inicioSlot > agora
        ) {
          horariosDisponiveis.push(
            Utilities.formatDate(
              inicioSlot,
              TIME_ZONE,
              "HH:mm"
            )
          );
        }

        // IMPORTANTE:
        // precisa estar DENTRO do while
        inicioSlot = new Date(
          inicioSlot.getTime() +
          PASSO_AGENDAMENTO * 60 * 1000
        );
      }
    }
  );

  return respostaJson({
    ok: true,
    data: data,
    duracao: DURACAO_CONSULTA,
    disponiveis: horariosDisponiveis
  });
}

function doPost(e) {
  try {
    const secretEsperado = PropertiesService
      .getScriptProperties()
      .getProperty("NOCTRA_API_SECRET");

    const agenda = CalendarApp.getCalendarById(CALENDAR_ID);

    if (!agenda) {
      return respostaJson({
        ok: false,
        erro: "Agenda não encontrada."
      });
    }

    /* =========================
    RECEBE OS DADOS
    ========================= */

    const dados = JSON.parse(e.postData.contents);

    if (!dados.secret || dados.secret !== secretEsperado) {
      return respostaJson({
        ok: false,
        erro: "Não autorizado."
      });
    }

    const {
      nome,
      email,
      whatsapp,
      leitura,
      data,
      horario
    } = dados;


    /* =========================
    VALIDA CAMPOS OBRIGATÓRIOS
    ========================= */

    if (
      !nome ||
      !email ||
      !whatsapp ||
      !leitura ||
      !data ||
      !horario
    ) {
      return respostaJson({
        ok: false,
        erro: "Dados obrigatórios ausentes."
      });
    }


    /* =========================
    VALIDA FORMATO
    ========================= */

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return respostaJson({
        ok: false,
        erro: "Data inválida."
      });
    }

    if (!/^\d{2}:\d{2}$/.test(horario)) {
      return respostaJson({
        ok: false,
        erro: "Horário inválido."
      });
    }


    /* =========================
    MONTA DATA E HORÁRIO
    ========================= */

    const [ano, mes, dia] = data
      .split("-")
      .map(Number);

    const [hora, minuto] = horario
      .split(":")
      .map(Number);

    const inicio = new Date(
      ano,
      mes - 1,
      dia,
      hora,
      minuto,
      0,
      0
    );

    const dataHoraValida =
      inicio.getFullYear() === ano &&
      inicio.getMonth() === mes - 1 &&
      inicio.getDate() === dia &&
      inicio.getHours() === hora &&
      inicio.getMinutes() === minuto;

    if (!dataHoraValida) {
      return respostaJson({
        ok: false,
        erro: "Data ou horário inválido."
      });
    }

    const fim = new Date(
      inicio.getTime() +
      DURACAO_CONSULTA * 60 * 1000
    );


    /* =========================
    IMPEDE HORÁRIO PASSADO
    ========================= */

    const agora = new Date();

    if (inicio <= agora) {
      return respostaJson({
        ok: false,
        erro: "Não é possível agendar um horário que já passou."
      });
    }


    /* =========================
    VALIDA DISPONIBILIDADE
    ========================= */

    const diaSemana = inicio.getDay();

    const periodos = DISPONIBILIDADE[diaSemana];

    if (!periodos) {
      return respostaJson({
        ok: false,
        erro: "Não há atendimento disponível nesta data."
      });
    }

    const passoMs =
      PASSO_AGENDAMENTO * 60 * 1000;

    const horarioPermitido = periodos.some(
      ([inicioPeriodo, fimPeriodo]) => {

        const inicioDoPeriodo = criarHorario(
          inicio,
          inicioPeriodo
        );

        const fimDoPeriodo = criarHorario(
          inicio,
          fimPeriodo
        );

        const dentroDoPeriodo =
          inicio >= inicioDoPeriodo &&
          fim <= fimDoPeriodo;

        const encaixaNaGrade =
          (
            inicio.getTime() -
            inicioDoPeriodo.getTime()
          ) % passoMs === 0;

        return (
          dentroDoPeriodo &&
          encaixaNaGrade
        );
      }
    );

    if (!horarioPermitido) {
      return respostaJson({
        ok: false,
        erro: "Horário inválido para esta agenda."
      });
    }


    /* =========================
    BLOQUEIA RESERVAS SIMULTÂNEAS
    ========================= */

    const lock = LockService.getScriptLock();

    lock.waitLock(10000);

    try {

      /* =========================
      CONFERE CONFLITO NOVAMENTE
      ========================= */

      const conflitos = agenda.getEvents(
        inicio,
        fim
      );

      if (conflitos.length > 0) {
        return respostaJson({
          ok: false,
          erro: "Este horário acabou de ficar indisponível."
        });
      }


      /* =========================
      DESCRIÇÃO DO EVENTO
      ========================= */

      const descricao = [
        `Leitura: ${leitura}`,
        `Cliente: ${nome}`,
        `E-mail: ${email}`,
        `WhatsApp: ${whatsapp}`
      ].join("\n");


      /* =========================
      CRIA O EVENTO
      ========================= */

      const evento = agenda.createEvent(
        "Consulta Nodus Tarot",
        inicio,
        fim,
        {
          description: descricao
        }
      );


      /* =========================
      RESPOSTA DE SUCESSO
      ========================= */

      return respostaJson({
        ok: true,
        mensagem: "Agendamento criado com sucesso.",
        eventoId: evento.getId()
      });

    } finally {
      lock.releaseLock();
    }

  } catch (erro) {
    console.error(
      "Erro ao criar agendamento:",
      erro
    );

    return respostaJson({
      ok: false,
      erro: "Erro interno ao criar o agendamento."
    });
  }
}

function criarHorario(data, horario) {

  const [hora, minuto] = horario
    .split(":")
    .map(Number);

  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
    hora,
    minuto,
    0,
    0
  );
}

function respostaJson(dados) {

  return ContentService
    .createTextOutput(JSON.stringify(dados))
    .setMimeType(ContentService.MimeType.JSON);
}