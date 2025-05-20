// Seleciona o formulário e o container onde os resultados serão exibidos
const formListar = document.getElementById('form-listar');
const resultado = document.getElementById('resultado');

// Evento que é executado ao enviar o formulário de busca
formListar.addEventListener('submit', async function (event) {
  event.preventDefault(); // Impede o recarregamento da página

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

    resultado.innerHTML = ''; // Limpa os resultados antes de listar

    if (!Array.isArray(data) || data.length === 0) {
      resultado.innerHTML = '<p>Nenhum esquema encontrado.</p>';
      return;
    }

    data.forEach(esquema => {
      const div = document.createElement('div');
      div.classList.add('esquema-item');

      div.innerHTML = `
        <h3>Marca: ${esquema.marca}</h3>
        <p>CV: ${esquema.cv}</p>
        <p>Voltagem: ${esquema.voltagem}</p>
        <p>Tensão: ${esquema.tensao}</p>
        <p>Tipo de Ligação: ${esquema.tipoLigacao}</p>
        <p>Observações: ${esquema.observacoes || '---'}</p>

        ${esquema.imagem ? `<img src="${esquema.imagem}" alt="Imagem do esquema" style="max-width: 300px;">` : '<p>Sem imagem</p>'}
        ${esquema.imagem ? `<br><a href="${esquema.imagem}" download target="_blank">📥 Baixar imagem</a>` : ''}

        <button class="btn-deletar" data-id="${esquema._id}">🗑️ Deletar</button>
      `;

      resultado.appendChild(div);
    });

    // Adiciona os eventos aos botões de deletar
    adicionarEventosDeletar();

  } catch (err) {
    console.error('Erro ao buscar:', err);
    alert('❌ Erro ao buscar dados.');
  }
});

// Função para adicionar eventos aos botões de deletar
function adicionarEventosDeletar() {
  const botoes = document.querySelectorAll('.btn-deletar');
  botoes.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');

      if (confirm('Tem certeza que deseja deletar este esquema?')) {
        try {
          const deleteResponse = await fetch(`https://bsmotores-esquemas.onrender.com/api/motores/${id}`, {
            method: 'DELETE',
          });

          if (deleteResponse.ok) {
            alert('✅ Esquema deletado com sucesso!');
            formListar.dispatchEvent(new Event('submit')); // Recarrega a lista
          } else {
            alert('❌ Erro ao deletar esquema.');
          }
        } catch (err) {
          console.error('Erro ao deletar:', err);
          alert('❌ Erro de conexão com o servidor.');
        }
      }
    });
  });
}
