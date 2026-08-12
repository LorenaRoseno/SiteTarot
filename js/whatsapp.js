import { WHATSAPP_NUMERO } from "./config.js";

export function abrirWhats(mensagem) {
    const texto = encodeURIComponent(mensagem);

    const url =
        `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;

    window.open(url, "_blank");
}

/*
Mantém compatibilidade com os onclick
que já existem no HTML.
*/
window.abrirWhats = abrirWhats;