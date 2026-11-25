
const API_URL = "https://supreme-space-telegram-96xrvpx975pp27r59-8000.app.github.dev/chat";

const botao = document.getElementById("mater-chat-button");
const janela = document.getElementById("mater-chat");
const fechar = document.getElementById("chat-close");
const enviar = document.getElementById("chat-send");
const campo = document.getElementById("chat-text");
const mensagens = document.getElementById("chat-messages");
const modo = document.getElementById("chat-mode");

// Abrir e fechar o chatbot
botao.addEventListener("click", () => {
    janela.classList.toggle("aberto");
});

fechar.addEventListener("click", () => {
    janela.classList.remove("aberto");
});

// Adiciona uma mensagem na conversa
function adicionarMensagem(texto, tipo) {
    const div = document.createElement("div");

    div.className = "chat-message " +
        (tipo === "usuario" ? "user-message" : "bot-message");

    // Evita interpretar respostas como HTML
    div.textContent = texto;

    mensagens.appendChild(div);
    mensagens.scrollTop = mensagens.scrollHeight;

    return div;
}

// Envia a mensagem para o backend
async function enviarMensagem() {
    const mensagem = campo.value.trim();

    if (!mensagem || enviar.disabled) {
        return;
    }

    // Exibe a mensagem do usuário
    adicionarMensagem(mensagem, "usuario");

    campo.value = "";
    enviar.disabled = true;

    // Mensagem temporária de carregamento
    const carregando = adicionarMensagem(
        "MaterNutri está pensando...",
        "bot"
    );

    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mensagem: mensagem,
                modo: modo.value
            })
        });

        // Lê a resposta da API
        const texto = await resposta.text();

        console.log("Status da API:", resposta.status);
        console.log("Resposta recebida:", texto);

        let dados;

        try {
            dados = JSON.parse(texto);
        } catch {
            throw new Error(
                "A API não retornou um JSON válido: " + texto
            );
        }

        // Verifica se a API retornou algum erro
        if (!resposta.ok) {
            throw new Error(
                dados.detail || "Erro ao consultar a IA."
            );
        }

        // Exibe a resposta do chatbot
        carregando.textContent = dados.resposta;

    } catch (erro) {
        carregando.textContent =
            "Não consegui responder agora. Tente novamente.";

        console.error("Erro no chatbot:", erro);

    } finally {
        enviar.disabled = false;
        campo.focus();
    }
}

// Enviar pelo botão
enviar.addEventListener("click", enviarMensagem);

// Enviar pressionando Enter
campo.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        enviarMensagem();
    }
});
