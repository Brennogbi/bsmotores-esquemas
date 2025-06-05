const formListar = document.getElementById('form-listar');
const resultado = document.getElementById('resultado');
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
    totalEsquemas.textContent = data.total || 0;
  } catch (err) {
    console.error('Erro ao contar esquemas:', err);
    totalEsquemas.textContent = 'Erro';
  } finally {
    toggleLoading(false);
  }
};

formListar.addEventListener('submit', async function (event) {
  event.preventDefault();
  toggleLoading(true);

  const params = new URLSearchParams({
    marca: document.getElementById('marcaBusca').value,
    cv: document.getElementById('cvBusca').value,
    voltagem: document.getElementById('voltagemBusca').value,
    tensao: document.getElementById('tensaoBusca').value,
    tipoLigacao: document.getElementById('tipoLigacaoBusca').value
  });

  try {
    const response = await fetch(`https://bsmotores-esquemas.onrender.com/api/motores/buscar?${params.toString()}`);
    const data = await response.json();

    resultado.innerHTML = '';

    if (data.length === 0) {
      resultado.innerHTML = '<p>Nenhum esquema encontrado.</p>';
      return;
    }

    data.forEach(esquema => {
      const div = document.createElement('div');
      div.classList.add('esquema-item');

      let arquivosHtml = '';
      if (esquema.arquivos && esquema.arquivos.length > 0) {
        arquivosHtml = '<p>Arquivos Adicionais:</p><ul>';
        esquema.arquivos.forEach((arquivo, index) => {
          const fileName = `Arquivo ${index + 1}${arquivo.endsWith('.pdf') ? ' (PDF)' : ' (Imagem)'}`;
          arquivosHtml += `<li><a href="${arquivo}" target="_blank" download>${fileName}</a></li>`;
        });
        arquivosHtml += '</ul>';
      } else {
        arquivosHtml = '<p>Sem arquivos adicionais.</p>';
      }

      div.innerHTML = `
        <h3>Marca: ${esquema.marca}</h3>
        <p>CV: ${esquema.cv}</p>
        <p>Voltagem: ${esquema.voltagem}</p>
        <p>Tensão: ${esquema.tensao}</p>
        <p>Tipo de Ligação: ${esquema.tipoLigacao}</p>
        <p class="observacoes">Observações: ${esquema.observacoes ? esquema.observacoes.replace(/\n/g, '<br>') : '---'}</p>
        ${esquema.imagem ? `<img src="${esquema.imagem}" alt="Imagem do esquema" style="max-width: 300px;">` : '<p>Sem imagem</p>'}
        ${esquema.imagem ? `<br><a href="${esquema.imagem}" download target="_blank">📥 Baixar imagem</a>` : ''}
        ${arquivosHtml}
        <button class="btn-editar" data-id="${esquema._id}">✏️ Editar</button>
        <button class="btn-deletar" data-id="${esquema._id}">🗑️ Deletar</button>
      `;

      resultado.appendChild(div);
    });

    // Ação do botão Editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.location.href = `index.html?id=${id}`;
      });
    });

    // Ação do botão Deletar
    document.querySelectorAll('.btn-deletar').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Tem certeza que deseja deletar este esquema?')) {
          toggleLoading(true);
          try {
            const deleteResponse = await fetch(`https://bsmotores-esquemas.onrender.com/api/motores/${id}`, {
              method: 'DELETE',
            });

            if (deleteResponse.ok) {
              alert('✅ Esquema deletado com sucesso!');
              formListar.dispatchEvent(new Event('submit')); // Atualizar lista
              atualizarContador(); // Atualizar contador
            } else {
              alert('❌ Erro ao deletar esquema.');
            }
          } catch (err) {
            console.error('Erro ao deletar:', err);
            alert('❌ Erro de conexão com o servidor.');
          } finally {
            toggleLoading(false);
          }
        }
      });
    });

    // Atualizar contador após carregar a lista
    atualizarContador();

  } catch (err) {
    console.error('Erro ao buscar:', err);
    alert('❌ Erro ao buscar dados.');
  } finally {
    toggleLoading(false);
  }
});

// Carregar contador ao abrir a página
document.addEventListener('DOMContentLoaded', atualizarContador);