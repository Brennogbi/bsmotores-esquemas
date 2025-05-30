const formListar = document.getElementById('form-listar');
const resultado = document.getElementById('resultado');

formListar.addEventListener('submit', async function (event) {
  event.preventDefault();

  const params = new URLSearchParams();
  const marca = document.getElementById('marcaBusca').value;
  const cv = document.getElementById('cvBusca').value;
  const voltagem = document.getElementById('voltagemBusca').value;
  const tensao = document.getElementById('tensaoBusca').value;
  const tipoLigacao = document.getElementById('tipoLigacaoBusca').value;

  if (marca) params.append('marca', marca);
  if (cv && !isNaN(cv)) params.append('cv', Number(cv));
  if (voltagem && !isNaN(voltagem)) params.append('voltagem', Number(voltagem));
  if (tensao && !isNaN(tensao)) params.append('tensao', Number(tensao));
  if (tipoLigacao) params.append('tipoLigacao', tipoLigacao);

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

      const arquivosHtml = esquema.arquivos && esquema.arquivos.length > 0
        ? esquema.arquivos.map((url, index) => `<br><a href="${url}" download target="_blank">📥 Baixar arquivo ${index + 1}</a>`).join('')
        : '<p>Sem arquivos adicionais</p>';

      div.innerHTML = `
        <h3>Marca: ${esquema.marca}</h3>
        <p>CV: ${esquema.cv}</p>
        <p>Voltagem: ${esquema.voltagem}</p>
        <p>Tensão: ${esquema.tensao}</p>
        <p>Tipo de Ligação: ${esquema.tipoLigacao}</p>
        <p>Observações: ${esquema.observacoes || '---'}</p>
        ${esquema.imagem ? `<img src="${esquema.imagem}" alt="Imagem do esquema">` : '<p>Sem imagem</p>'}
        ${esquema.imagem ? `<br><a href="${esquema.imagem}" download target="_blank">📥 Baixar imagem</a>` : ''}
        ${arquivosHtml}
        <button class="btn-deletar" data-id="${esquema._id}">🗑️ Deletar</button>
      `;

      resultado.appendChild(div);
    });

    // Botões de deletar
    document.querySelectorAll('.btn-deletar').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Tem certeza que deseja deletar este esquema?')) {
          try {
            const deleteResponse = await fetch(`https://bsmotores-esquemas.onrender.com/api/motores/${id}`, {
              method: 'DELETE',
            });

            if (deleteResponse.ok) {
              alert('✅ Esquema deletado com sucesso!');
              formListar.dispatchEvent(new Event('submit')); // Atualiza a listagem
            } else {
              const erro = await deleteResponse.json();
              alert('❌ Erro ao deletar: ' + (erro.erro || 'Tente novamente.'));
            }
          } catch (err) {
            console.error('Erro ao deletar:', err);
            alert('❌ Erro de conexão ao tentar deletar.');
          }
        }
      });
    });

  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    alert('❌ Erro ao buscar dados. Verifique sua conexão ou tente novamente.');
  }
});