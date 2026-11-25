
const STORAGE_KEY = "materNutriExames";
const DB_NAME = "materNutriArquivos";
const STORE_NAME = "exames";

const modal = document.getElementById("exam-modal");
const form = document.getElementById("exam-form");
const list = document.getElementById("exam-list");
const searchInput = document.getElementById("search-exam");
const fileInput = document.getElementById("exam-file");

let exams = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFile(id, file) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put({
      id,
      file,
      name: file.name,
      type: file.type
    });

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function getFile(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(id);

    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function deleteFile(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function saveExams() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function openModal() {
  form.reset();
  document.getElementById("exam-date").value = getLocalDate();
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

document.getElementById("new-exam")
  .addEventListener("click", openModal);

document.getElementById("close-modal")
  .addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = fileInput.files[0];

  if (file && file.size > 2 * 1024 * 1024) {
    alert("O arquivo é muito grande. Escolha um arquivo de até 2 MB.");
    return;
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (file && !allowedTypes.includes(file.type)) {
    alert("Formato não permitido. Escolha PDF, JPG, PNG ou WEBP.");
    return;
  }

  const exam = {
    id: Date.now(),
    title: document.getElementById("exam-title").value.trim(),
    type: document.getElementById("exam-type").value,
    date: document.getElementById("exam-date").value,
    description: document.getElementById("exam-description").value.trim(),
    fileName: file ? file.name : ""
  };

  try {
    if (file) {
      await saveFile(exam.id, file);
    }

    exams.push(exam);
    saveExams();

    closeModal();
    renderExams();
  } catch (error) {
    console.error(error);
    alert("Não foi possível salvar o exame. Tente novamente.");
  }
});

function renderExams() {
  const search = searchInput.value.toLowerCase().trim();

  const filtered = exams
    .filter((exam) => {
      return (
        exam.title.toLowerCase().includes(search) ||
        exam.type.toLowerCase().includes(search) ||
        exam.description.toLowerCase().includes(search) ||
        exam.fileName.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  list.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.textContent = "♧";

    const title = document.createElement("h3");
    title.textContent = search
      ? "Nenhum exame encontrado"
      : "Seu primeiro exame começa aqui";

    const description = document.createElement("p");
    description.textContent = search
      ? "Tente pesquisar por outro título, descrição ou arquivo."
      : "Adicione exames de sangue, ultrassons, laudos e outros documentos do pré-natal.";

    empty.append(icon, title, description);

    if (!search) {
      const button = document.createElement("button");
      button.className = "primary-button";
      button.textContent = "＋ Adicionar exame";
      button.addEventListener("click", openModal);
      empty.appendChild(button);
    }

    list.appendChild(empty);
    return;
  }

  filtered.forEach((exam) => {
    const card = document.createElement("article");
    card.className = "exam-card";

    const title = document.createElement("h3");
    title.textContent = exam.title;

    const type = document.createElement("p");
    type.textContent = `Tipo: ${exam.type}`;

    const date = document.createElement("p");
    date.textContent = `Data de realização: ${formatDate(exam.date)}`;

    card.append(title, type, date);

    if (exam.description) {
      const description = document.createElement("p");
      description.textContent = `Descrição: ${exam.description}`;
      card.appendChild(description);
    }

    if (exam.fileName) {
      const fileName = document.createElement("p");
      fileName.textContent = `Arquivo: ${exam.fileName}`;
      card.appendChild(fileName);
    }

    const actions = document.createElement("div");
    actions.className = "exam-actions";

    if (exam.fileName) {
      const viewButton = document.createElement("button");
      viewButton.className = "action-button";
      viewButton.textContent = "Visualizar arquivo";

      viewButton.addEventListener("click", async () => {
        try {
          const saved = await getFile(exam.id);

          if (!saved) {
            alert("Arquivo não encontrado neste navegador.");
            return;
          }

          const url = URL.createObjectURL(saved.file);
          const newWindow = window.open(url, "_blank");

          if (!newWindow) {
            const link = document.createElement("a");
            link.href = url;
            link.download = saved.name;
            link.click();
          }

          setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) {
          console.error(error);
          alert("Não foi possível abrir o arquivo.");
        }
      });

      const downloadButton = document.createElement("button");
      downloadButton.className = "action-button";
      downloadButton.textContent = "Baixar";

      downloadButton.addEventListener("click", async () => {
        try {
          const saved = await getFile(exam.id);

          if (!saved) {
            alert("Arquivo não encontrado neste navegador.");
            return;
          }

          const url = URL.createObjectURL(saved.file);
          const link = document.createElement("a");

          link.href = url;
          link.download = saved.name;
          link.click();

          setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) {
          console.error(error);
          alert("Não foi possível baixar o arquivo.");
        }
      });

      actions.append(viewButton, downloadButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-button delete";
    deleteButton.textContent = "Excluir";

    deleteButton.addEventListener("click", async () => {
      if (!confirm("Deseja realmente excluir este exame e seu arquivo?")) {
        return;
      }

      try {
        await deleteFile(exam.id);
        exams = exams.filter(item => item.id !== exam.id);
        saveExams();
        renderExams();
      } catch (error) {
        console.error(error);
        alert("Não foi possível excluir o arquivo.");
      }
    });

    actions.appendChild(deleteButton);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

searchInput.addEventListener("input", renderExams);

document.getElementById("empty-new-exam")
  ?.addEventListener("click", openModal);

renderExams();
