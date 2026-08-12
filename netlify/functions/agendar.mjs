export default async (request) => {
    if (request.method !== "POST") {
        return Response.json(
            {
                ok: false,
                erro: "Método não permitido."
            },
            {
                status: 405
            }
        );
    }

    try {
        const dados = await request.json();

        const {
            nome,
            email,
            whatsapp,
            leitura,
            data,
            horario
        } = dados;

        if (
            !nome ||
            !email ||
            !whatsapp ||
            !leitura ||
            !data ||
            !horario
        ) {
            return Response.json(
                {
                    ok: false,
                    erro: "Preencha todos os campos obrigatórios."
                },
                {
                    status: 400
                }
            );
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return Response.json(
                {
                    ok: false,
                    erro: "Data inválida."
                },
                {
                    status: 400
                }
            );
        }

        if (!/^\d{2}:\d{2}$/.test(horario)) {
            return Response.json(
                {
                    ok: false,
                    erro: "Horário inválido."
                },
                {
                    status: 400
                }
            );
        }

        const appsScriptUrl =
            process.env.NOCTRA_APPS_SCRIPT_URL;

        const secret =
            process.env.NOCTRA_API_SECRET;

        if (!appsScriptUrl || !secret) {
            console.error(
                "Variáveis de ambiente da agenda não configuradas."
            );

            return Response.json(
                {
                    ok: false,
                    erro: "Serviço de agendamento indisponível."
                },
                {
                    status: 500
                }
            );
        }

        const resposta = await fetch(
            appsScriptUrl,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome,
                    email,
                    whatsapp,
                    leitura,
                    data,
                    horario,
                    secret
                }),

                redirect: "follow"
            }
        );

        if (!resposta.ok) {
            throw new Error(
                `Apps Script respondeu com status ${resposta.status}.`
            );
        }

        const resultado =
            await resposta.json();

        return Response.json(
            resultado,
            {
                status: resultado.ok ? 200 : 400
            }
        );

    } catch (erro) {
        console.error(
            "Erro ao realizar agendamento:",
            erro
        );

        return Response.json(
            {
                ok: false,
                erro: "Não foi possível concluir o agendamento."
            },
            {
                status: 500
            }
        );
    }
};

export const config = {
    path: "/api/agendar",
    method: "POST"
};