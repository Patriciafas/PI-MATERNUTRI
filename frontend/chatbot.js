const API_URL = "https://organic-guacamole-7vwr55wq65wphr77x-8000.app.github.dev";

const botao = document.getElementById("mater-chat-button");
const janela = document.getElementById("mater-chat");
const fechar = document.getElementById("chat-close");
const enviar = document.getElementById("chat-send");
const campo = document.getElementById("chat-text");
const mensagens = document.getElementById("chat-messages");
const modo = document.getElementById("chat-mode");

botao.addEventListener("click", () => {
    janela.classList.toggle("aberto");
});

fechar.addEventListener("click", () => {
    janela.classList.remove("aberto");
});

function adicionarMensagem(texto, tipo) {
    const div = document.createElement("div");

    div.className = "chat-message " +
        (tipo === "usuario" ? "user-message" : "bot-message");

    // textContent evita interpretar respostas como HTML.
    div.textContent = texto;

    mensagens.appendChild(div);
    mensagens.scrollTop = mensagens.scrollHeight;

    return div;
}

async function enviarMensagem() {
    const mensagem = campo.value.trim();

    if (!mensagem || enviar.disabled) return;

    adicionarMensagem(mensagem, "usuario");
    campo.value = "";

    enviar.disabled = true;

    const carregando = adicionarMensagem(
        "MaterNutri está pensando...",
        "bot"
    );

    try {
        const resposta = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mensagem: mensagem,
                modo: modo.value
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.detail || "Erro ao consultar a IA.");
        }

        carregando.textContent = dados.resposta;

    } catch (erro) {
        carregando.textContent =
            "Não consegui responder agora. Tente novamente.";

        console.error(erro);

    } finally {
        enviar.disabled = false;
        campo.focus();
    }
}

enviar.addEventListener("click", enviarMensagem);

campo.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        enviarMensagem();
    }
});
