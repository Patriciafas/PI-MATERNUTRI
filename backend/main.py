
import os
from dotenv import load_dotenv

load_dotenv(
    dotenv_path=os.path.join(
        os.path.dirname(__file__),
        ".env"
)
)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

app = FastAPI(title="MaterNutri API")

# Configure depois com o endereço real do seu site
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5500"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key) if api_key else None


class ChatRequest(BaseModel):
    mensagem: str
    modo: str = "geral"


@app.get("/")
def inicio():
    return {"mensagem": "API MaterNutri funcionando!"}


@app.post("/chat")
def conversar(dados: ChatRequest):

    if not client:
        raise HTTPException(
            status_code=500,
            detail="Chave da inteligência artificial não configurada."
        )

    mensagem = dados.mensagem.strip()

    if not mensagem:
        raise HTTPException(
            status_code=400,
            detail="Digite uma mensagem."
        )

    if len(mensagem) > 4000:
        raise HTTPException(
            status_code=400,
            detail="Mensagem muito longa."
        )

    if dados.modo not in ["geral", "nutricao"]:
        raise HTTPException(
            status_code=400,
            detail="Modo inválido."
        )

    if dados.modo == "nutricao":
        instrucao = """
        Você é o MaterNutri IA, um assistente educativo
        especializado em nutrição e alimentação saudável.

        Explique os assuntos de forma simples e responsável.
        Não faça diagnósticos, não prescreva medicamentos,
        não indique dietas clínicas individualizadas e não
        substitua nutricionistas ou médicos.
        Quando necessário, recomende atendimento profissional.
        """
    else:
        instrucao = """
        Você é o MaterNutri IA, um assistente de inteligência
        artificial geral. Responda perguntas sobre estudos,
        tecnologia, conhecimentos gerais e outros assuntos.
        Seja claro, educado e objetivo.
        """

    
    try:
        print("Enviando mensagem ao Gemini...")

        resposta = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=f"{instrucao}\n\nPergunta do usuário: {mensagem}"
        )

        print("Resposta recebida do Gemini!")

        return {
            "resposta": resposta.text
        }

    except Exception as erro:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=502,
            detail="Não foi possível obter uma resposta da IA."
        )



    
    except Exception as erro:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail="Não foi possível obter uma resposta da IA."
        )
