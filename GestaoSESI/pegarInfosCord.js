const supabaseUrl = 'https://pfdjgsjbmhisqjxbzmjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZGpnc2pibWhpc3FqeGJ6bWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNjY3NzEsImV4cCI6MjA0NDc0Mjc3MX0.qYuDBWNU8F6qzcAaksDeXc_CITjHAMAagFgFq-miLfE';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
//Declarando supabase

const userId = localStorage.getItem('authUuid'); //pegando userID

let materiasData = [];  // Array global para armazenar o estado das linhas
let numeroMateriasTemp = 1
let pagAtual = 0; // Inicializa a página atual como 0
// Seleciona os elementos do modal e overlay
const overlay = document.getElementById('overlay');
const modalProfessores = document.getElementById('modalProfessores');
const modalRecados = document.getElementById('modalRecados');
// Seleciona todos os professores e recados
const professores = document.querySelectorAll('.professor');
const recados = document.querySelectorAll('.recado');

async function carregarPaginaModal(atual) {
    // const botaoPassar = document.getElementById('buttonNext');
    // const divFormularioContainer = document.getElementById('formularioInfos');
    const divFormulario = document.getElementById('formulario');
    const tituloFormulario = document.getElementById('titulo');


    if (atual == 1) {
        tituloFormulario.innerHTML = 'DADOS DE LOGIN';
        let nomeInfo = localStorage.getItem('nome').toLowerCase().replace(/\s+/g, "");
        let sobrenomeInfo = localStorage.getItem('sobrenome').toLowerCase().replace(/\s+/g, "");
        let emailEducacionalInfo = `${nomeInfo}.${sobrenomeInfo}@portalsesisp.org.br`
        divFormulario.innerHTML = `
            <div class="scrollAulas">
                <div class="formRow">
                    <div class="formGroup">
                        <label for="EmailEducacional">Email Educacional</label>
                        <input class="disabled" id="EmailEducacional" type="text" value="${emailEducacionalInfo}" disabled>
                    </div>
                </div>
                <div class="formRow row2">
                    <div class="formGroup">
                        <label for="Senha">Senha</label>
                        <input id="Senha" placeholder="Escreva aqui" type="text">
                    </div>
                    <div class="formGroup">
                        <label for="ConfirmarSenha">Confirmar Senha</label>
                        <input id="ConfirmarSenha" placeholder="Escreva aqui" type="text">
                    </div>
                </div>
            </div>
            <div class="botoes maisdeum">
                <button id="buttonPreview" onclick="apagarInfosTemporarias(2)" type="button">Anterior</button>
                <button id="buttonNext" onclick="salvarInfosTemporariamente(2)" type="button">Próximo</button>
            </div>
        `;
    } else if (atual == 0) {
        tituloFormulario.innerHTML = 'DADOS PESSOAIS';
        divFormulario.innerHTML = `
            <div class="formRow row2">
                <div class="formGroup">
                    <label for="Nome">Nome</label>
                    <input id="Nome" placeholder="Escreva aqui" type="text">
                </div>
                <div class="formGroup">
                    <label for="Sobrenome">Sobrenome</label>
                    <input id="Sobrenome" placeholder="Escreva aqui" type="text">
                </div>
            </div>
            <div class="formRow">
                <div class="formGroup">
                    <label for="EmailPessoal">Email Pessoal</label>
                    <input id="EmailPessoal" placeholder="Escreva aqui" type="email">
                </div>
            </div>
            <div class="formRow">
                <div class="formGroup">
                    <label for="Numero">Número de celular (com DDD)</label>
                    <input id="Numero" placeholder="11912345678" type="number">
                </div>
            </div>
            <div class="formRow">
                <div class="formGroup">
                    <label for="CPF">CPF</label>
                    <input id="CPF" placeholder="Escreva sem pontuação" type="number">
                </div>
            </div>
            <div class="botoes">
                <button id="buttonNext" onclick="salvarInfosTemporariamente(1)" type="button">Próximo</button>
            </div>
        `;
    } else if (atual === 2) {
        const { data: turmas, error: turmasError } = await supabaseClient
            .from('turmas')
            .select('*');

        if (turmasError || !turmas?.length) {
            console.error('Erro ao buscar dados das turmas:', turmasError || 'Nenhuma turma encontrada');
            return;
        }

        // Salva os valores atuais das seleções (turmas e matérias) no array global
        document.querySelectorAll('.formRow.row2').forEach((row, index) => {
            const turmaSelect = row.querySelector('.turmasOptions');
            const materiaSelect = row.querySelector('.materia');
            if (turmaSelect && materiaSelect) {
                materiasData[index] = {
                    turma: turmaSelect.value,
                    materia: materiaSelect.value
                };
            }
        });

        tituloFormulario.innerHTML = 'AULAS';
        divFormulario.innerHTML = `
            <div class="scrollAulas">
                <div class="divReverse" style="display: flex; flex-direction: column-reverse; width: 100%; gap: 15px">
                    <div class="formRow row2">
                        <div class="formGroup turmaGroup">
                            <div onclick="aumentarMateria(${atual})" class="professor" id="naoCadastrado">
                                <i class="fa-solid fa-circle-plus fa-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="botoes maisdeum">
                <button id="buttonPreview" onclick="apagarInfosTemporarias(3)" type="button">Anterior</button>
                <button id="buttonFinish" onclick="fecharModal()" type="button">Finalizar</button>
            </div>
        `;

        for (let i = 0; i < numeroMateriasTemp; i++) {
            let scrollDiv = document.querySelector('.divReverse');

            const formRow = `<div class="formRow row2">
                    <div class="formGroup turmaGroup">
                        <label for="Turma">Turma</label>
                        <select name="Turma" class="turmasOptions"></select>
                    </div>
                    <div class="formGroup materiaGroup">
                        <label for="Materia">Matéria</label>
                        <select name="Materia" class="materia">
                            <option value="linguaPortuguesa">Lingua Portuguesa</option>
                            <option value="matematica">Matematica</option>
                            <option value="educacaoFisica">Educação Física</option>
                            <option value="historia">História</option>
                        </select>
                    </div>                      
                    <i onclick="diminuirMateria(${atual})" id="botaoMenosMateria" style="align-self: center; cursor: pointer;" class="fa-solid fa-circle-minus fa-xl"></i>
                </div>`;
            scrollDiv.innerHTML += formRow;
        }

        let selectTurmas = document.querySelectorAll('.turmasOptions');
        selectTurmas.forEach(turmaSelect => {
            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.nome_turma;
                option.textContent = turma.nome_turma[0] == 1 || turma.nome_turma[0] == 2 || turma.nome_turma[0] == 3
                    ? `${turma.nome_turma[0]}°${turma.nome_turma[1]} EM`
                    : `${turma.nome_turma[0]}°${turma.nome_turma[1]}`;
                turmaSelect.appendChild(option);
            });
        });

        // Restaurar os valores das seleções usando o array global `materiasData`
        document.querySelectorAll('.formRow.row2').forEach((row, index) => {
            if (materiasData[index]) {
                const turmaSelect = row.querySelector('.turmasOptions');
                const materiaSelect = row.querySelector('.materia');
                if (turmaSelect) turmaSelect.value = materiasData[index].turma;
                if (materiaSelect) materiaSelect.value = materiasData[index].materia;
            }
        });
    }
}

function diminuirMateria(atual) {
    if (numeroMateriasTemp > 1) {
        numeroMateriasTemp--;
        materiasData.pop();  // Remove o último item do array `materiasData`
        carregarPaginaModal(atual);
    }
}

function aumentarMateria(atual) {
    numeroMateriasTemp++;
    materiasData.push({ turma: "", materia: "" });  // Adiciona um item vazio ao array `materiasData`
    carregarPaginaModal(atual);
}

async function fetchCordenadorData() {

    // Busca o ID do professor relacionado ao perfil do usuário
    const { data: profileID, error: profileError } = await supabaseClient
        .from('profiles')
        .select('coordenador_id')
        .eq('id', userId);

    if (profileError || !profileID?.length) {
        console.error('Erro ao buscar perfil:', profileError || 'Nenhum perfil encontrado');
        return;
    }

    const cordenadorId = profileID[0].coordenador_id;

    // Busca os dados do professor usando o ID encontrado
    const { data: cordenador, error: cordenadorError } = await supabaseClient
        .from('coordenadores')
        .select('*')
        .eq('id', cordenadorId);

    if (cordenadorError || !cordenador?.length) {
        console.error('Erro ao buscar dados do cordenador:', cordenadorError || 'Professor não encontrado');
        return;
    }

    const spanCord = document.getElementById('nomeCordenador');
    spanCord.textContent = `${cordenador[0].nome}`;

}

async function fetchProfessoresData() {
    // Busca os dados do professor usando o ID encontrado
    const { data: professores, error: professoresError } = await supabaseClient
        .from('professores')
        .select('*')


    if (professoresError || !professores?.length) {
        console.error('Erro ao buscar dados do cordenador:', professoresError || 'Professor não encontrado');
        return;
    }

    // Ordena os professores em ordem alfabética pelo nome
    professores.sort((a, b) => a.nome.localeCompare(b.nome));

    // Seleciona o contêiner onde as divs serão inseridas
    const listaProfessores = document.getElementById('listaProfessores');
    listaProfessores.innerHTML = ''; // Limpa a lista antes de adicionar novos professores

    // Adiciona cada professor à lista
    professores.forEach(professor => {
        const professorDiv = document.createElement('div');
        professorDiv.className = 'professor';

        // Cria um elemento de título para o nome do professor
        const title = document.createElement('h3');
        title.className = 'title';
        title.textContent = professor.nome; // Define o nome do professor
        professorDiv.setAttribute('data-professorID', professor.id)

        // Anexa o título à div do professor
        professorDiv.appendChild(title);
        professorDiv.addEventListener('click', abrirModalProfessores);
        // Anexa a div do professor à lista
        listaProfessores.appendChild(professorDiv);
    });

    // Adiciona a div #naoCadastrado ao final da lista
    const naoCadastradoDiv = document.createElement('div');
    naoCadastradoDiv.id = 'naoCadastrado';
    naoCadastradoDiv.innerHTML = '<i class="fa-solid fa-circle-plus fa-xl"></i>'; // Ícone para adicionar um novo professor
    naoCadastradoDiv.className = 'professor'
    naoCadastradoDiv.addEventListener('click', abrirModalProfessores);


    // Anexa a div #naoCadastrado à lista
    listaProfessores.appendChild(naoCadastradoDiv);
}

async function fetchTurmasData() {
    const { data: turmas, error: turmasError } = await supabaseClient
        .from('turmas')
        .select('*');

    if (turmasError || !turmas?.length) {
        console.error('Erro ao buscar dados das turmas:', turmasError || 'Nenhuma turma encontrada');
        return;
    }

    // Seleciona o elemento onde as turmas serão adicionadas
    const lista = document.getElementById('lista');

    // Limpa a lista antes de adicionar novos elementos
    lista.innerHTML = '';

    turmas.forEach(turma => {
        const nomeTurma = turma.nome_turma; // Supondo que a coluna se chama 'nome_turma'
        const grau = turma.grau; // Supondo que a coluna se chama 'grau'

        nomeCompostoTurma = `${nomeTurma[0]}° Ano ${nomeTurma[1]}`

        // Determina o horário com base no grau
        const horario = grau === 'Fundamental' ? 'manha ' : 'tarde';
        const ensino = grau === 'Fundamental' ? 'fund' : 'EM';

        // Cria o elemento da turma
        const turmaDiv = document.createElement('div');
        turmaDiv.classList.add('turma');

        turmaDiv.innerHTML = `
            <h4 class="title">${nomeCompostoTurma}</h4>
            <div class="turmaInfos">
                <div class="turmaInfo grau ${ensino}">${grau.charAt(0).toUpperCase() + grau.slice(1)}</div>
                <div class="turmaInfo horario ${horario}">${horario.charAt(0).toUpperCase() + horario.slice(1)}</div>
            </div>
        `;


        function redirect() {
            window.location.href = "gerMaterias.html"
        }
        turmaDiv.addEventListener('click', redirect);

        // Adiciona a turma à lista
        lista.appendChild(turmaDiv);
    });
}


async function deslogar() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('Erro ao deslogar:', error.message);
        alert('Erro ao deslogar. Tente novamente.');
    } else {
        window.location.href = './../index.html';
        localStorage.setItem('authUuid', '');
    }
}

async function verificarAutenticacao() {
    const { data: sessionData, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Erro ao obter a sessão:', error.message);
    } else if (!sessionData?.session) {
        window.location.href = './../index.html';
    }
}

function abrirModalProfessores() {
    modalProfessores.style.display = 'flex';
    overlay.style.display = 'block';
    pagAtual = 0
    numeroMateriasTemp = 1
    carregarPaginaModal(pagAtual); // Carrega a primeira página ao abrir o modal
}

// Função para fechar o modal
function fecharModal() {
    modalProfessores.style.display = 'none';
    modalRecados.style.display = 'none';
    overlay.style.display = 'none';
    pagAtual = 0

    localStorage.setItem('nome', '')
    localStorage.setItem('sobrenome', '')
    localStorage.setItem('emailPessoal', '')
    localStorage.setItem('numero', '')
    localStorage.setItem('cpf', '')
    localStorage.setItem('senha', '')
    localStorage.setItem('emailEducacional', '')
}

// Função para abrir o modal de recados
function abrirModalRecados() {
    modalRecados.style.display = 'flex';
    overlay.style.display = 'block';
}

professores.forEach(professor => {
    professor.addEventListener('click', abrirModalProfessores);
});
recados.forEach(recado => {
    recado.addEventListener('click', abrirModalRecados);
});

// Fecha o modal ao clicar fora dele (no overlay)
overlay.addEventListener('click', fecharModal);

function voltarPagina() {
    if (pagAtual == 0) {
        return;
    } else {
        pagAtual--;
    }
    carregarPaginaModal(pagAtual);
}

function passarPagina() {
    if (pagAtual == 2) {
        return;
    } else {
        pagAtual++;
    }
    carregarPaginaModal(pagAtual);
}

function salvarInfosTemporariamente(form) {
    if (form == 1) {
        let nome = document.getElementById('Nome').value
        let sobrenome = document.getElementById('Sobrenome').value
        let emailPessoal = document.getElementById('EmailPessoal').value
        let numero = document.getElementById('Numero').value
        let cpf = document.getElementById('CPF').value

        // if(!nome||!sobrenome||!emailPessoal||!numero||!cpf){
        //     alert('todos os campos precisam ser preenchidos')
        //     return;
        // }

        localStorage.setItem('nome', nome)
        localStorage.setItem('sobrenome', sobrenome)
        localStorage.setItem('emailPessoal', emailPessoal)
        localStorage.setItem('numero', numero)
        localStorage.setItem('cpf', cpf)
    } else if (form == 2) {
        let senha = document.getElementById('Senha').value
        let confirmarSenha = document.getElementById('ConfirmarSenha').value
        let emailEducacional = document.getElementById('EmailEducacional').value

        // if(!senha||!confirmarSenha||!emailEducacional){
        //     alert('todos os campos precisam ser preenchidos')
        //     return;
        // }

        if (senha == confirmarSenha) {
            localStorage.setItem('senha', senha)
            localStorage.setItem('emailEducacional', emailEducacional)
        } else {
            alert('as duas senhas devem ser iguais')
            return;
        }
    }
    passarPagina()
}
function apagarInfosTemporarias(form) {
    if (form === 2) {
        localStorage.setItem('nome', '')
        localStorage.setItem('sobrenome', '')
        localStorage.setItem('emailPessoal', '')
        localStorage.setItem('numero', '')
        localStorage.setItem('cpf', '')
    }
    localStorage.setItem('senha', '')
    localStorage.setItem('emailEducacional', '')

    voltarPagina()
}

fetchProfessoresData()
fetchCordenadorData()
fetchTurmasData();
document.getElementById('botaoDeslog').addEventListener('click', deslogar);
document.addEventListener('DOMContentLoaded', verificarAutenticacao);

