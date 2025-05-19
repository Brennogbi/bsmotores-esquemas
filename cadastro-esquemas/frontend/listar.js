// frontend/listar.js
const formListar = document.getElementById('form-listar');
const resultado = document.getElementById('resultado');

formListar.addEventListener('submit', async function (event) {
  event.preventDefault();

  const params = new URLSearchParams({
    marca: document.getElementById('marcaBusca').value,
    cv: document.getElementById('cvBusca').value,
    voltagem: document.getElementById('voltagemBusca').value,
    tensao: document.getElementById('tensaoBusca').value,
    tipoLigacao: document.getElementById('tipoLigacaoBusca').value
  });

  try {
    const response = await fetch(`https://cadastro-esquema-bsmotores.onrender.com/api/motores/buscar?${params.toString()}`);
    const data = await response.json();

    resultado.innerHTML = ''; // ✅ Limpa os resultados antes de listar (evita duplicação)

    if (data.length === 0) {
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
        <p>Observações: ${esquema.observacoes}</p>

        <!-- ✅ URL corrigida para produção -->
        <img src="https://cadastro-esquema-bsmotores.onrender.com/uploads/${esquema.imagem}" alt="Imagem do esquema">

        <!-- ✅ Botão de download funcional -->
        <br>
        <a href="https://cadastro-esquema-bsmotores.onrender.com/uploads/${esquema.imagem}" download>📥 Baixar imagem</a>

        <!-- ✅ Botão deletar com ID correto -->
        <button class="btn-deletar" data-id="${esquema._id}">🗑️ Deletar</button>
      `;
      resultado.appendChild(div);
    });

    // ✅ Evento de deletar esquema
    document.querySelectorAll('.btn-deletar').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Tem certeza que deseja deletar este esquema?')) {
          try {
            const deleteResponse = await fetch(`https://cadastro-esquema-bsmotores.onrender.com/api/motores/${id}`, {
              method: 'DELETE',
            });

            if (deleteResponse.ok) {
              alert('Esquema deletado com sucesso!');
              
              // ✅ Atualiza listagem sem reload (evita duplicações)
              formListar.dispatchEvent(new Event('submit'));

            } else {
              alert('Erro ao deletar esquema');
            }
          } catch (err) {
            console.error(err);
            alert('Erro de conexão com o servidor');
          }
        }
      });
    });

  } catch (err) {
    console.error('Erro ao buscar:', err);
    alert('Erro ao buscar dados.');
  }
});
