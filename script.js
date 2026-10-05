// ======================================================
// CONFIGURAÇÃO DA PLANILHA
// ======================================================

const SHEET_ID =
    "2PACX-1vTHVBDSqVbQG-QuWyvkOLbkuUH614g_5VQ7d1qJXnvyt1o1gsaZFqTnMJ4yUkM0Yg";

const GID = "1429344482";

const INTERVALO_ATUALIZACAO = 60 * 1000;


// ======================================================
// METAS
// ======================================================

const metas = [
    {
        nome: "14º Salário",
        meta: 36000000,
        numero: "01"
    },
    {
        nome: "Priscilla",
        meta: 40000000,
        numero: "02"
    },
    {
        nome: "15º Salário",
        meta: 44000000,
        numero: "03"
    },
    {
        nome: "Bônus",
        meta: 45000000,
        numero: "04"
    }
];


// ======================================================
// FORMATAÇÃO
// ======================================================

function formatarMoeda(valor) {

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
    }).format(valor);

}


function formatarPercentual(valor) {

    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(valor) + "%";

}


// ======================================================
// CONVERTER NÚMERO
// ======================================================

function converterNumero(valor) {

    if (typeof valor === "number") {
        return valor;
    }

    if (!valor) {
        return 0;
    }

    let texto = String(valor)
        .trim()
        .replace("R$", "")
        .replace(/\s/g, "");

    texto = texto
        .replace(/\./g, "")
        .replace(",", ".");

    return Number(texto) || 0;
}


// ======================================================
// CONVERTER CSV
// ======================================================

function converterCSV(texto) {

    const linhas = [];

    let linhaAtual = [];
    let campoAtual = "";
    let dentroAspas = false;

    for (let i = 0; i < texto.length; i++) {

        const caractere = texto[i];

        if (caractere === '"') {

            if (
                dentroAspas &&
                texto[i + 1] === '"'
            ) {
                campoAtual += '"';
                i++;
            } else {
                dentroAspas = !dentroAspas;
            }

        } else if (
            caractere === "," &&
            !dentroAspas
        ) {

            linhaAtual.push(campoAtual);
            campoAtual = "";

        } else if (
            (caractere === "\n" || caractere === "\r") &&
            !dentroAspas
        ) {

            if (
                caractere === "\r" &&
                texto[i + 1] === "\n"
            ) {
                i++;
            }

            linhaAtual.push(campoAtual);

            if (linhaAtual.length > 1) {
                linhas.push(linhaAtual);
            }

            linhaAtual = [];
            campoAtual = "";

        } else {

            campoAtual += caractere;

        }
    }

    if (
        campoAtual.length > 0 ||
        linhaAtual.length > 0
    ) {

        linhaAtual.push(campoAtual);
        linhas.push(linhaAtual);

    }

    return linhas;
}


// ======================================================
// BUSCAR PLANILHA
// ======================================================

async function carregarPlanilha() {

    const url =
        `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${GID}&single=true&output=csv&cache=${Date.now()}`;

    try {

        atualizarStatus(
            "Atualizando...",
            "amarelo"
        );


        const resposta = await fetch(url, {
            cache: "no-store"
        });


        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );

        }


        const texto = await resposta.text();


        console.log(
            "CSV recebido:",
            texto
        );


        const dados =
            converterCSV(texto);


        console.log(
            "Dados convertidos:",
            dados
        );


        // ==================================================
        // B6 = TOTAL REALIZADO
        // ==================================================

        const totalRealizado =
            converterNumero(
                dados[5]?.[1]
            );


        console.log(
            "Total encontrado em B6:",
            totalRealizado
        );


        if (!totalRealizado) {

            throw new Error(
                "Não consegui encontrar o valor da célula B6."
            );

        }


        // ==================================================
        // MOSTRAR TOTAL
        // ==================================================

        document.getElementById(
            "totalRealizado"
        ).textContent =
            formatarMoeda(totalRealizado);


        // ==================================================
        // MOSTRAR CARDS
        // ==================================================

        renderizarCards(
            totalRealizado
        );


        // ==================================================
        // HORÁRIO
        // ==================================================

        const agora =
            new Date();


        document.getElementById(
            "ultimaAtualizacao"
        ).textContent =
            agora.toLocaleTimeString(
                "pt-BR"
            );


        // ==================================================
        // STATUS
        // ==================================================

        atualizarStatus(
            "Dados atualizados",
            "verde"
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar planilha:",
            erro
        );


        atualizarStatus(
            "Erro na conexão",
            "vermelho"
        );


        document.getElementById(
            "metas"
        ).innerHTML = `

            <div class="error">

                <strong>
                    Não foi possível carregar os dados.
                </strong>

                <br><br>

                ${erro.message}

                <br><br>

                <small>
                    Verifique o Console do navegador
                    para mais detalhes.
                </small>

            </div>

        `;

    }
}


// ======================================================
// RENDERIZAR CARDS
// ======================================================

function renderizarCards(total) {

    const container =
        document.getElementById("metas");


    container.innerHTML = "";


    metas.forEach((item) => {

        const falta =
            Math.max(
                item.meta - total,
                0
            );


        const percentual =
            (total / item.meta) * 100;


        const percentualBarra =
            Math.min(
                percentual,
                100
            );


        const necessidadeMes =
            falta / 3;


        const card =
            document.createElement("div");


        card.className = "card";


        card.innerHTML = `

            <div class="card-header">

                <div class="card-title">
                    ${item.nome}
                </div>

                <div class="card-number">
                    ${item.numero}
                </div>

            </div>


            <div class="meta-label">
                Meta
            </div>


            <div class="meta-value">
                ${formatarMoeda(item.meta)}
            </div>


            <div class="progress-info">

                <span class="progress-label">
                    Progresso
                </span>

                <span class="progress-percent">
                    ${formatarPercentual(percentual)}
                </span>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width: ${percentualBarra}%"
                ></div>

            </div>


            <div class="card-info">

                <div class="info-box">

                    <div class="info-label">
                        Falta
                    </div>

                    <div class="info-value">
                        ${formatarMoeda(falta)}
                    </div>

                </div>


                <div class="info-box">

                    <div class="info-label">
                        Necessário / mês
                    </div>

                    <div class="info-value">
                        ${formatarMoeda(necessidadeMes)}
                    </div>

                </div>

            </div>

        `;


        container.appendChild(card);

    });
}


// ======================================================
// STATUS
// ======================================================

function atualizarStatus(
    texto,
    tipo
) {

    const statusText =
        document.getElementById(
            "statusText"
        );


    const statusDot =
        document.querySelector(
            ".status-dot"
        );


    statusText.textContent =
        texto;


    if (tipo === "verde") {

        statusDot.style.background =
            "#31c48d";

    }

    else if (tipo === "vermelho") {

        statusDot.style.background =
            "#ef4444";

    }

    else {

        statusDot.style.background =
            "#f0b429";

    }

}


// ======================================================
// INICIAR
// ======================================================

carregarPlanilha();


// ======================================================
// ATUALIZAÇÃO AUTOMÁTICA
// ======================================================

setInterval(
    carregarPlanilha,
    INTERVALO_ATUALIZACAO
);