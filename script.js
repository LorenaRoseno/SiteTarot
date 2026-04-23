function abrirWhats(mensagem) {
    const numero = "5534992066429"; // EX: 5534999999999
    const texto = encodeURIComponent(mensagem);
    const url = `https://wa.me/${numero}?text=${texto}`;

    window.open(url, '_blank');
    }