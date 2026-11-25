document.addEventListener("DOMContentLoaded", function () {

  // NOME DA GESTANTE
  const nomeSalvo = localStorage.getItem("materNutriNome");

  if (nomeSalvo) {
    document.getElementById("nomeUsuario").textContent = nomeSalvo;
  }

  // HIDRATAÇÃO
  let copos = Number(localStorage.getItem("materNutriAgua")) || 0;

  const coposAgua = document.getElementById("coposAgua");
  const progresso = document.getElementById("progressoAgua");
  const mensagem = document.getElementById("mensagemAgua");

  function atualizarAgua() {
    coposAgua.textContent = copos;
    progresso.style.width = (copos * 10) + "%";

    if (copos === 10) {
      mensagem.textContent = "Parabéns! Você atingiu sua meta de hoje! 💗";
    } else if (copos >= 5) {
      mensagem.textContent = "Muito bem! Continue se hidratando!";
    } else {
      mensagem.textContent = "Vamos continuar cuidando da sua hidratação!";
    }

    localStorage.setItem("materNutriAgua", copos);
  }

  document.getElementById("maisAgua").addEventListener("click", function () {
    if (copos < 10) {
      copos++;
      atualizarAgua();
    }
  });

  document.getElementById("menosAgua").addEventListener("click", function () {
    if (copos > 0) {
      copos--;
      atualizarAgua();
    }
  });

  atualizarAgua();

  // REGISTRO DE PESO
  let pesos = JSON.parse(localStorage.getItem("materNutriPesos")) || [];

  const campoPeso = document.getElementById("novoPeso");
  const listaPesos = document.getElementById("listaPesos");
  const pesoAtual = document.getElementById("pesoAtual");

  function atualizarPesos() {
    listaPesos.innerHTML = "";

    if (pesos.length === 0) {
      listaPesos.innerHTML =
        "<p>Registre seu peso para acompanhar sua evolução.</p>";
      pesoAtual.textContent = "—";
      return;
    }

    pesoAtual.textContent = pesos[pesos.length - 1].valor + " kg";

    pesos.slice(-4).reverse().forEach(function (registro) {
      const item = document.createElement("div");
      item.className = "weight-item";

      const data = document.createElement("span");
      data.textContent = registro.data;

      const valor = document.createElement("strong");
      valor.textContent = registro.valor + " kg";

      item.appendChild(data);
      item.appendChild(valor);
      listaPesos.appendChild(item);
    });
  }

  document.getElementById("registrarPeso").addEventListener("click", function () {
    const valor = Number(campoPeso.value);

    if (!valor || valor <= 0 || valor > 500) {
      alert("Digite um peso válido.");
      return;
    }

    const data = new Date().toLocaleDateString("pt-BR");

    pesos.push({
      valor: valor.toFixed(1),
      data: data
    });

    localStorage.setItem("materNutriPesos", JSON.stringify(pesos));

    campoPeso.value = "";
    atualizarPesos();
  });

  atualizarPesos();

  // DADOS DO CADASTRO
  const semanasSalvas = localStorage.getItem("materNutriSemanas");
  const partoSalvo = localStorage.getItem("materNutriParto");

  if (semanasSalvas) {
    const semanas = Number(semanasSalvas);
    document.getElementById("semanas").textContent =
      semanas + (semanas === 1 ? " semana" : " semanas");

    if (semanas <= 13) {
      document.getElementById("dicaTrimestre").textContent =
        "1º trimestre — Ácido fólico e cuidados iniciais da gestação.";
    } else if (semanas <= 27) {
      document.getElementById("dicaTrimestre").textContent =
        "2º trimestre — Ferro, cálcio e alimentação equilibrada.";
    } else {
      document.getElementById("dicaTrimestre").textContent =
        "3º trimestre — Ômega-3 e preparação para o parto.";
    }
  }

  if (partoSalvo) {
    const data = new Date(partoSalvo + "T00:00:00");

    if (!isNaN(data.getTime())) {
      document.getElementById("dataParto").textContent =
        data.toLocaleDateString("pt-BR");
    }
  }

});