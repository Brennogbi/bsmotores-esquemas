const formCadastro = document.getElementById('form-cadastro');
const motorIdInput = document.getElementById('motorId');
const tituloForm = document.getElementById('titulo-form');
const botaoSubmit = document.getElementById('botao-submit');
const imagemAtualLink = document.getElementById('imagemAtual');
const imagemAtualContainer = document.getElementById('imagemAtualContainer');
const arquivosAtuaisList = document.getElementById('arquivosAtuais');
const totalEsquemas = document.getElementById('total-esquemas');
const loading = document.getElementById('loading');

// Função para mostrar/esconder o spinner
const toggleLoading = (show) => {
  loading.style.display = show ? 'flex' : 'none';
};

// Função para atualizar o contador de esquemas
const atualizarContador = async () => {
  toggleLoading(true);
  try {
    const response = await fetch('https://bsmotores-esquemas.onrender.com/api/motores/contar');
    const data = await response.json();
    if (totalEsquemas) {
      totalEsquemas.textContent = data.total || 0;
    }
  } catch (err) {
    console.error('Erro ao contar esquemas:', err);
    if (totalEsquemas) {
      totalEsquemas.textContent = 'Erro';
    }
  } finally {
    toggleLoading(false);
  }
};

// Função para obter o ID do motor da URL
const getMotorId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

// Preencher o formulário para edição
const preencherFormulario = async () => {
  const motorId = getMotorId();
  if (motorId) {
    toggleLoading(true);
    try {
      const response = await fetch(`https://bsmotores-esquemas.onrender.com/api/motores/buscar?_id=${motorId}`);
      const data = await response.json();

      if (!data || data.length === 0) {
        alert('❌ Motor não encontrado.');
        window.location.href = 'listar.html';
        return;
      }

      const motor = data[0];
      motorIdInput.value = motor._id;
      document.getElementById('marca').value = motor.marca;
      document.getElementById('cv').value = motor.cv;
      document.getElementById('voltagem').value = motor.voltagem;
      document.getElementById('tensao').value = motor.tensao;
      document.getElementById('tipoLigacao').value = motor.tipoLigacao;
      document.getElementById('observacoes').value = motor.observacoes || '';
      document.getElementById('codigo').value = motor.codigo || ''; // Novo campo

      if (motor.imagem) {
        imagemAtualLink.href = motor.imagem;
        imagemAtualLink.textContent = 'Ver imagem atual';
        imagemAtualContainer.style.display = 'block';
      } else {
        imagemAtualLink.textContent = 'Nenhuma imagem';
        imagemAtualContainer.style.display = 'block';
      }

      arquivosAtuaisList.innerHTML = '';
      if (motor.arquivos && motor.arquivos.length > 0) {
        motor.arquivos.forEach((arquivo, index) => {
          const li = document.createElement('li');
          const fileName = `Arquivo ${index + 1}${arquivo.endsWith('.pdf') ? ' (PDF)' : ' (Imagem)'}`;
          li.innerHTML = `
            <input type="checkbox" name="manterArquivo" value="${arquivo}" checked>
            <a href="${arquivo}" target="_blank">${fileName}</a>
          `;
          arquivosAtuaisList.appendChild(li);
        });
      } else {
        arquivosAtuaisList.innerHTML = '<li>Nenhum arquivo adicional</li>';
      }

      tituloForm.textContent = 'Editar Esquema';
      botaoSubmit.textContent = 'Salvar Alterações';
      document.getElementById('marca').removeAttribute('required');
      document.getElementById('cv').removeAttribute('required');
      document.getElementById('voltagem').removeAttribute('required');
      document.getElementById('tensao').removeAttribute('required');
      document.getElementById('tipoLigacao').removeAttribute('required');
      document.getElementById('imagem').removeAttribute('required');
      document.getElementById('codigo').removeAttribute('required');
    } catch (err) {
      console.error('Erro ao carregar motor:', err);
      alert('❌ Erro ao carregar dados do motor.');
      window.location.href = 'listar.html';
    } finally {
      toggleLoading(false);
    }
  }
  atualizarContador();
};

// Enviar dados do formulário (cadastro ou edição)
formCadastro.addEventListener('submit', async function (event) {
  event.preventDefault();
  toggleLoading(true);

  const formData = new FormData(formCadastro);
  const motorId = motorIdInput.value;

  if (motorId) {
    const arquivosParaManter = [];
    document.querySelectorAll('input[name="manterArquivo"]:checked').forEach(checkbox => {
      arquivosParaManter.push(checkbox.value);
    });
    formData.append('arquivosParaManter', JSON.stringify(arquivosParaManter));
  }

  const method = motorId ? 'PUT' : 'POST';
  const url = motorId
    ? `https://bsmotores-esquemas.onrender.com/api/motores/${motorId}`
    : 'https://bsmotores-esquemas.onrender.com/api/motores/cadastrar';

  try {
    const response = await fetch(url, {
      method: method,
      body: formData
    });

    if (response.ok) {
      alert(motorId ? '✅ Esquema atualizado com sucesso!' : '✅ Esquema cadastrado com sucesso!');
      formCadastro.reset();
      motorIdInput.value = '';
      tituloForm.textContent = 'Cadastro de Esquemas';
      botaoSubmit.textContent = 'Cadastrar';
      imagemAtualContainer.style.display = 'none';
      arquivosAtuaisList.innerHTML = '';
      document.getElementById('marca').setAttribute('required', '');
      document.getElementById('cv').setAttribute('required', '');
      document.getElementById('voltagem').setAttribute('required', '');
      document.getElementById('tensao').setAttribute('required', '');
      document.getElementById('tipoLigacao').setAttribute('required', '');
      window.location.href = 'listar.html';
    } else {
      const erro = await response.json();
      alert('❌ Erro: ' + (erro.detalhe || erro.erro || 'Verifique os dados.'));
    }
  } catch (err) {
    console.error('Erro ao conectar com o servidor:', err);
    alert('❌ Erro ao conectar com o servidor.');
  } finally {
    toggleLoading(false);
  }
});

// Carregar dados do motor e contador
document.addEventListener('DOMContentLoaded', preencherFormulario);