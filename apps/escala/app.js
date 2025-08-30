const pessoas = [
  "Hudson",
  "Jocicleiton",
  "Joabe",
  "Maykon",
  "João Pedro",
  "Ariel",
  "Yuri",
  "Lucas",
  "Erisson",
  "Cleiton",
  "Cirley",
  "Webert",
  "Erison"
];
const funcoes = ["Datashow", "Live", "Filmadora"];
const eventosFixos = {
  sabado_1: [{ horario: "19:00", nome: "Culto de Jovens e Adolescentes" }],
  terca_1: [{ horario: "19:00", nome: "Crianças" }],
  quarta_3: [{ horario: "19:00", nome: "Feminino" }],
  sabado_4: [{ horario: "19:00", nome: "Masculino" }],
  domingo_todo: [
    { horario: "09:00", nome: "Escola Dominical" },
    { horario: "16:30", nome: "Culto Vespertino" },
    { horario: "18:30", nome: "Culto" },
  ],
  quinta_todo: [{ horario: "19:00", nome: "Culto de Quinta" }],
};

let escalas = {};
let escalasImportadasRelativas = {};
let contagem = {};
pessoas.forEach((p) => {
  contagem[p] = {
    Datashow: 0,
    Live: 0,
    Filmadora: 0,
    TOTAL: 0,
  };
});

const botaoGerar = document.getElementById("gerar");
const botaoExportar = document.getElementById("exportar");
const botaoImportar = document.getElementById("importarBtn");
const inputImportar = document.getElementById("importar");
const mesSelecionado = document.getElementById("mes");
const calBody = document.getElementById("cal-body");
const countBody = document.getElementById("count-body");
const modal = document.getElementById("modal");
const modalDia = document.getElementById("modal-dia");
const linhasEscala = document.getElementById("linhas-escala");

let diaAtual = null;

window.addEventListener("load", carregarLocalStorage);
botaoGerar.addEventListener("click", gerarCalendario);
botaoExportar.addEventListener("click", exportarEscala);
botaoImportar.addEventListener("click", () => inputImportar.click());
inputImportar.addEventListener("change", importarEscala);
mesSelecionado.addEventListener("change", atualizaEscalasImportadas);

document.getElementById("salvar").addEventListener("click", () => {
  const linhas = Array.from(document.querySelectorAll(".line"));
  escalas[diaAtual] = linhas.map((line) => {
    return {
      horario: line.querySelector("input").value,
      funcao: line.querySelector("select:nth-child(2)").value,
      pessoa: line.querySelector("select:nth-child(3)").value,
    };
  });

  const ano = new Date().getFullYear();
  const mes = parseInt(document.getElementById("mes").value);

  for (const dia in escalas) {
    const data = new Date(ano, mes, dia);
    const diaSemana = data.getDay();
    const ocorrencia = Math.floor((dia - 1) / 7) + 1;
    escalasImportadasRelativas[`${diaSemana}_${ocorrencia}`] = escalas[dia];
  }

  atualizaContagem();
  atualizaExibicaoTodosOsDias();
  salvarLocalStorage();
  modal.style.display = "none";
});

document.getElementById("add-linha").addEventListener("click", () => {
  adicionarLinha();
});

document.getElementById("fechar").addEventListener("click", () => {
  modal.style.display = "none";
});

function salvarLocalStorage() {
  const dados = {
    escalas,
    escalasImportadasRelativas,
    mesSelecionado: document.getElementById("mes").value,
  };
  localStorage.setItem("escalaApp", JSON.stringify(dados));
}

function carregarLocalStorage() {
  const dados = JSON.parse(localStorage.getItem("escalaApp"));
  if (dados) {
    escalasImportadasRelativas = dados.escalasImportadasRelativas || {};
    const mesSalvo = dados.mesSelecionado ?? new Date().getMonth();
    document.getElementById("mes").value = mesSalvo;
    atualizaEscalasImportadas();
  }
}

function gerarCalendario() {
  calBody.innerHTML = "";
  const ano = new Date().getFullYear();
  const mes = parseInt(mesSelecionado.value);
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  let linha = document.createElement("tr");
  for (let i = 0; i < primeiroDia; i++) {
    linha.appendChild(document.createElement("td"));
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const data = new Date(ano, mes, dia);
    const diaSemana = data.getDay();
    const celula = document.createElement("td");
    const diaHeader = document.createElement("div");
    diaHeader.classList.add("dia-header");
    diaHeader.textContent = dia;
    celula.appendChild(diaHeader);
    celula.addEventListener("click", () => abrirModal(dia));
    atualizaExibicaoDia(dia, celula);
    linha.appendChild(celula);

    if (diaSemana === 6) {
      calBody.appendChild(linha);
      linha = document.createElement("tr");
    }
  }
  if (linha.children.length > 0) {
    const faltam = 7 - linha.children.length;
    for (let i = 0; i < faltam; i++)
      linha.appendChild(document.createElement("td"));
    calBody.appendChild(linha);
  }
  atualizaTabelaContagem();
}

function abrirModal(dia) {
  diaAtual = dia;
  modalDia.textContent = dia;
  linhasEscala.innerHTML = "";
  const escalasDia = escalas[dia] || [];
  escalasDia.forEach((item) =>
    adicionarLinha(item.horario, item.funcao, item.pessoa)
  );
  if (escalasDia.length === 0) adicionarLinha();
  modal.style.display = "flex";
}

function adicionarLinha(horarioSel = "", funcaoSel = "", pessoaSel = "") {
  const div = document.createElement("div");
  div.classList.add("line");

  const inputHora = document.createElement("input");
  inputHora.type = "time";
  inputHora.value = horarioSel;

  const selectFuncao = document.createElement("select");
  funcoes.forEach((f) => {
    const option = document.createElement("option");
    option.value = f;
    option.textContent = f;
    if (f === funcaoSel) option.selected = true;
    selectFuncao.appendChild(option);
  });
  const selectPessoa = document.createElement("select");
  const optionDefault = document.createElement("option");
  optionDefault.text = "Selecione uma pessoa";
  optionDefault.disabled = true;
  optionDefault.selected = !pessoaSel;
  selectPessoa.appendChild(optionDefault);
  pessoas.forEach((p) => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    if (p === pessoaSel) option.selected = true;
    selectPessoa.appendChild(option);
  });
  div.appendChild(inputHora);
  div.appendChild(selectFuncao);
  div.appendChild(selectPessoa);
  linhasEscala.appendChild(div);
}

function exportarEscala() {
  const ano = new Date().getFullYear();
  const mes = parseInt(document.getElementById("mes").value);
  const escalasExport = {};
  for (const dia in escalas) {
    const data = new Date(ano, mes, dia);
    const diaSemana = data.getDay();
    const ocorrencia = Math.floor((dia - 1) / 7) + 1;
    escalasExport[`${diaSemana}_${ocorrencia}`] = escalas[dia];
  }
  const blob = new Blob(
    [
      JSON.stringify({
        escalas: escalasExport,
        mesSelecionado: mes,
      }),
    ],
    { type: "text/plain" }
  );
  const a = document.createElement("a");
  a.download = "escalas.txt";
  a.href = URL.createObjectURL(blob);
  a.click();
}

function importarEscala(event) {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = (e) => {
    const data = JSON.parse(e.target.result);
    escalasImportadasRelativas = data.escalas || {};
    if (data.mesSelecionado !== undefined) {
      document.getElementById("mes").value = data.mesSelecionado;
    }
    salvarLocalStorage();
    atualizaEscalasImportadas();
  };
  leitor.readAsText(arquivo);
}

function atualizaEscalasImportadas() {
  const ano = new Date().getFullYear();
  const mes = parseInt(document.getElementById("mes").value);
  escalas = {};
  for (const chave in escalasImportadasRelativas) {
    const [diaSemana, ocorrencia] = chave.split("_").map(Number);
    const diaExato = encontrarDiaPorOcorrencia(ano, mes, diaSemana, ocorrencia);
    if (diaExato) {
      escalas[diaExato] = escalasImportadasRelativas[chave];
    }
  }
  gerarCalendario();
  atualizaContagem();
  atualizaExibicaoTodosOsDias();
}

function atualizaExibicaoTodosOsDias() {
  Array.from(document.querySelectorAll("#cal-body td")).forEach((td) => {
    const diaHeader = td.querySelector(".dia-header");
    if (!diaHeader) return;
    const dia = parseInt(diaHeader.textContent);
    atualizaExibicaoDia(dia, td);
  });
}

function atualizaExibicaoDia(dia, celula) {
  Array.from(celula.querySelectorAll(".escala-item")).forEach((el) =>
    el.remove()
  );
  const ano = new Date().getFullYear();
  const mes = parseInt(document.getElementById("mes").value);
  const data = new Date(ano, mes, dia);
  const diaSemana = data.getDay();
  const ocorrencia = Math.floor((dia - 1) / 7) + 1;

  const diaSemanaNomes = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];
  const diaSemanaNome = diaSemanaNomes[diaSemana];
  const chavesEvento = [
    `${diaSemanaNome}_${ocorrencia}`, // ex.: "sabado_1"
    `${diaSemanaNome}_todo`, // ex.: "domingo_todo"
  ];

  // 1️⃣ Coletar todas as escalas normais do dia atual
  const escalasDoDia = escalas[dia] ? [...escalas[dia]] : [];

  // 2️⃣ Adicionar todos os eventos fixos
  chavesEvento.forEach((chave) => {
    if (eventosFixos[chave]) {
      eventosFixos[chave].forEach((evento) => {
        escalasDoDia.push({
          horario: evento.horario,
          funcao: evento.nome,
          pessoa: "📅 Evento Fixo",
        });
      });
    }
  });

  // 3️⃣ Ordenar todas as escalas por horário e função
  escalasDoDia
    .sort((a, b) => {
      if (a.horario < b.horario) return -1;
      if (a.horario > b.horario) return 1;
      if (a.pessoa === "📅 Evento Fixo") return -1;
      if (b.pessoa === "📅 Evento Fixo") return 1;
      return a.funcao.localeCompare(b.funcao);
    })
    .forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("escala-item");
      if (item.pessoa === "📅 Evento Fixo") {
        div.style.fontWeight = "bold";
        div.textContent = `📅 ${item.horario} - ${item.funcao}`;
      } else {
        div.innerHTML = `${item.funcao}: <b>${item.pessoa
          .slice(0, 4)
          .toUpperCase()}</b>`;
      }
      celula.appendChild(div);
    });
}

function atualizaContagem() {
  pessoas.forEach((p) => {
    contagem[p] = { Datashow: 0, Live: 0, Filmadora: 0, TOTAL: 0 };
  });
  for (const dia in escalas) {
    escalas[dia].forEach((item) => {
      if (item.pessoa && item.pessoa !== "📅 Evento Fixo") {
        contagem[item.pessoa][item.funcao]++;
        contagem[item.pessoa]["TOTAL"]++;
      }
    });
  }
  atualizaTabelaContagem();
}

function atualizaTabelaContagem() {
  countBody.innerHTML = "";
  const maxContagem = Math.max(...pessoas.map((p) => contagem[p]["TOTAL"]));
  pessoas.forEach((p) => {
    const linha = document.createElement("tr");
    if (contagem[p]["TOTAL"] === maxContagem && maxContagem > 0) {
      linha.classList.add("highlight");
    }
    linha.innerHTML = `
            <td>${p}</td>
            <td>${contagem[p]["Datashow"]}</td>
            <td>${contagem[p]["Live"]}</td>
            <td>${contagem[p]["Filmadora"]}</td>
            <td>${contagem[p]["TOTAL"]}</td>
        `;
    countBody.appendChild(linha);
  });
}

function encontrarDiaPorOcorrencia(ano, mes, diaSemana, ocorrencia) {
  let contador = 0;
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  for (let dia = 1; dia <= totalDias; dia++) {
    const data = new Date(ano, mes, dia);
    if (data.getDay() === diaSemana) {
      contador++;
      if (contador === ocorrencia) {
        return dia;
      }
    }
  }
  return null;
}
