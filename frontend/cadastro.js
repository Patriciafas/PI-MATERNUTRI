
(() => {

    const formulario = document.getElementById('form-cadastro');

    if (!formulario) return;

    const passos = [...document.querySelectorAll('.passo')];

    const barra = document.getElementById('barra-progresso');

    const etapaTexto = document.getElementById('etapa-texto');

    const etapaNome = document.getElementById('etapa-nome');

    const voltar = document.getElementById('voltar');

    const continuar = document.getElementById('continuar');

    const finalizar = document.getElementById('finalizar');

    const mensagemErro = document.getElementById('mensagem-erro');

    const toast = document.getElementById('toast');

    const nomesEtapas = [
        'Você',
        'Gestação',
        'Cuidados',
        'Confirmação'
    ];

    let etapaAtual = 0;


    // LOCALIZAR CAMPOS

    const campo = (id) => document.getElementById(id);

    const valor = (id) => campo(id)?.value.trim() || '';


    // MOSTRAR ETAPAS

    function mostrarEtapa(indice) {

        etapaAtual = indice;

        passos.forEach((passo, i) => {

            passo.hidden = i !== indice;

            passo.classList.toggle('ativo', i === indice);

        });

        etapaTexto.textContent =
            `Etapa ${indice + 1} de ${passos.length}`;

        etapaNome.textContent = nomesEtapas[indice];

        barra.style.width =
            `${((indice + 1) / passos.length) * 100}%`;

        voltar.disabled = indice === 0;

        continuar.hidden = indice === passos.length - 1;

        finalizar.hidden = indice !== passos.length - 1;

        mensagemErro.textContent = '';

        if (indice === passos.length - 1) {

            montarResumo();

        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    }


    // VALIDAR CAMPOS

    function validarEtapa() {

        const camposObrigatorios = [
            ...passos[etapaAtual].querySelectorAll('[required]')
        ];

        for (const input of camposObrigatorios) {

            if (input.type === 'checkbox' && !input.checked) {

                input.focus();

                mensagemErro.textContent =
                    'Marque a confirmação para continuar.';

                return false;

            }

            if (
                input.type !== 'checkbox' &&
                !input.value.trim()
            ) {

                input.focus();

                mensagemErro.textContent =
                    'Preencha os campos obrigatórios para continuar.';

                return false;

            }

            if (!input.checkValidity()) {

                input.focus();

                mensagemErro.textContent =
                    input.validationMessage ||
                    'Confira o valor informado.';

                return false;

            }

        }


        // VALIDAR DATA DE NASCIMENTO

        if (etapaAtual === 0) {

            const nascimento = new Date(
                `${valor('nascimento')}T00:00:00`
            );

            const hoje = new Date();

            hoje.setHours(0, 0, 0, 0);

            if (nascimento > hoje) {

                campo('nascimento').focus();

                mensagemErro.textContent =
                    'A data de nascimento não pode estar no futuro.';

                return false;

            }

        }

        return true;

    }


    // MONTAR RESUMO FINAL

    function montarResumo() {

        const itens = [

            ['Nome', valor('nome')],

            ['Telefone', valor('telefone')],

            [
                'Nascimento',
                valor('nascimento')
                    ? new Date(
                        `${valor('nascimento')}T00:00:00`
                    ).toLocaleDateString('pt-BR')
                    : '—'
            ],

            ['Altura', `${valor('altura')} cm`],

            ['Peso pré-gestacional', `${valor('peso')} kg`],

            ['Semana gestacional', `${valor('semanas')}ª semana`],

            [
                'Primeira gestação',
                valor('gestacao') === 'sim' ? 'Sim' : 'Não'
            ],

            [
                'Data provável do parto',
                valor('data-parto')
                    ? new Date(
                        `${valor('data-parto')}T00:00:00`
                    ).toLocaleDateString('pt-BR')
                    : 'Não informada'
            ],

            [
                'Preferência alimentar',
                campo('restricoes').selectedOptions[0].textContent
            ],

            [
                'Alergias',
                valor('alergias') || 'Não informado'
            ]

        ];


        document.getElementById('resumo-cadastro').innerHTML =

            itens.map(([titulo, conteudo]) =>

                `<div class="resumo-item">
                    <small>${escapeHtml(titulo)}</small>
                    <strong>${escapeHtml(conteudo)}</strong>
                </div>`

            ).join('');

    }


    // PROTEGER TEXTO DO RESUMO

    function escapeHtml(texto) {

        return String(texto).replace(/[&<>"']/g, (caractere) => ({

            '&': '&amp;',

            '<': '&lt;',

            '>': '&gt;',

            '"': '&quot;',

            "'": '&#039;'

        })[caractere]);

    }


    // NOTIFICAÇÕES

    function notificar(texto) {

        toast.textContent = texto;

        toast.classList.add('visivel');

        window.setTimeout(() => {

            toast.classList.remove('visivel');

        }, 3500);

    }


    // BOTÃO CONTINUAR

    continuar.addEventListener('click', () => {

        if (!validarEtapa()) return;

        mostrarEtapa(
            Math.min(etapaAtual + 1, passos.length - 1)
        );

    });


    // BOTÃO VOLTAR

    voltar.addEventListener('click', () => {

        mostrarEtapa(
            Math.max(etapaAtual - 1, 0)
        );

    });


    // MÁSCARA DO TELEFONE

    campo('telefone').addEventListener('input', (evento) => {

        let numeros = evento.target.value
            .replace(/\D/g, '')
            .slice(0, 11);

        if (numeros.length > 10) {

            numeros = numeros.replace(
                /^(\d{2})(\d{5})(\d{0,4}).*/,
                '($1) $2-$3'
            );

        } else if (numeros.length > 6) {

            numeros = numeros.replace(
                /^(\d{2})(\d{4})(\d{0,4}).*/,
                '($1) $2-$3'
            );

        } else if (numeros.length > 2) {

            numeros = numeros.replace(
                /^(\d{2})(\d*)/,
                '($1) $2'
            );

        }

        evento.target.value = numeros;

    });


    // MOSTRAR CAMPO DE OUTRA RESTRIÇÃO

    campo('restricoes').addEventListener('change', () => {

        const exibir =
            campo('restricoes').value === 'outra';

        document.getElementById(
            'outra-restricao-wrap'
        ).hidden = !exibir;

    });


    // FINALIZAR CADASTRO

    formulario.addEventListener('submit', (evento) => {

        evento.preventDefault();

        if (!validarEtapa()) return;

        // SALVAR DADOS PARA O PAINEL

        localStorage.setItem(
            'materNutriNome',
            valor('nome')
        );

        localStorage.setItem(
            'materNutriSemanas',
            valor('semanas')
        );

        localStorage.setItem(
            'materNutriParto',
            valor('data-parto')
        );

        localStorage.setItem(
            'materNutriTelefone',
            valor('telefone')
        );

        localStorage.setItem(
            'materNutriAltura',
            valor('altura')
        );

        localStorage.setItem(
            'materNutriPesoInicial',
            valor('peso')
        );

        // REDIRECIONAR PARA O PAINEL

        window.location.href = 'painel.html';

    });


    // AVISOS DO MENU LATERAL

    document.querySelectorAll('[data-aviso]').forEach((link) => {

        link.addEventListener('click', (evento) => {

            evento.preventDefault();

            notificar(link.dataset.aviso);

        });

    });


    // INICIAR CADASTRO

    mostrarEtapa(0);

})();
