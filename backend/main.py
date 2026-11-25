
import os
import traceback
import requests

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Carrega as variáveis do arquivo backend/.env
load_dotenv(
    dotenv_path=os.path.join(
        os.path.dirname(__file__),
        ".env"
    )
)


# Configuração da API
app = FastAPI(title="MaterNutri API")


# CORS - configuração para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Chave da API OpenRouter
api_key = os.getenv("OPENROUTER_API_KEY")


# Modelo de dados recebido pelo chatbot
class ChatRequest(BaseModel):
    mensagem: str
    modo: str = "geral"


# Rota inicial para verificar se a API está funcionando
@app.get("/")
def inicio():
    return {
        "mensagem": "API MaterNutri funcionando!"
    }


# Rota do chatbot
@app.post("/chat")
def conversar(dados: ChatRequest):

    # Verifica se a chave da API foi configurada
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Chave da inteligência artificial não configurada."
        )

    # Valida a mensagem
    mensagem = dados.mensagem.strip()

    if not mensagem:
        raise HTTPException(
            status_code=400,
            detail="A mensagem não pode estar vazia."
        )

    if len(mensagem) > 4000:
        raise HTTPException(
            status_code=400,
            detail="A mensagem é muito longa."
        )

    # Valida o modo do chatbot
    if dados.modo not in ["geral", "nutricao"]:
        raise HTTPException(
            status_code=400,
            detail="Modo de chatbot inválido."
        )

    # Instruções do assistente
    if dados.modo == "nutricao":
        instrucao = (
            "Você é o assistente virtual do MaterNutri, "
            "uma plataforma de acompanhamento nutricional gestacional. "
            "Ofereça informações educativas sobre alimentação, "
            "nutrição e cuidados gerais durante a gestação. "
            "Não realize diagnósticos, não prescreva medicamentos "
            "e não indique dietas clínicas individualizadas. "
            "Não substitua consultas com médicos ou nutricionistas. "
            "Quando necessário, oriente a usuária a procurar "
            "um profissional de saúde. "
            "Responda de forma clara, acolhedora e objetiva."
        )
    else:
        instrucao = (
            "Você é um assistente virtual do MaterNutri. "
            "Responda perguntas sobre estudos, tecnologia, "
            "conhecimentos gerais e assuntos diversos. "
            "Utilize linguagem clara, educativa e objetiva."
        )

    # Envia a pergunta para o OpenRouter
    try:
        resposta = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "X-Title": "MaterNutri"
            },
            json={
                "model": "openrouter/free",
                "messages": [
                    {
                        "role": "system",
                        "content": instrucao
                    },
                    {
                        "role": "user",
                        "content": mensagem
                    }
                ]
            },
            timeout=60
        )

        resposta.raise_for_status()

        resultado = resposta.json()

        texto_resposta = (
            resultado.get("choices", [{}])[0]
            .get("message", {})
            .get("content")
        )

        if not texto_resposta:
            raise ValueError(
                "A IA retornou uma resposta vazia."
            )

        return {
            "resposta": texto_resposta
        }

    except requests.exceptions.RequestException as erro:
        print("Erro na comunicação com o OpenRouter:")
        print(erro)

        if erro.response is not None:
            print("Resposta do servidor:")
            print(erro.response.text)

        raise HTTPException(
            status_code=502,
            detail="Não foi possível obter uma resposta da inteligência artificial."
        )

    except (KeyError, IndexError, TypeError, ValueError) as erro:
        print("Erro ao processar a resposta da IA:")
        print(erro)

        raise HTTPException(
            status_code=502,
            detail="A inteligência artificial retornou uma resposta inválida."
        )

    except Exception:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Ocorreu um erro interno no chatbot."
        )
