// main.js

const formCadastro = document.getElementById('form-cadastro');

formCadastro.addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(formCadastro);

  try {
    const response = await fetch('https://bsmotores-esquemas.onrender.com/api/motores/cadastrar', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      alert('✅ Esquema cadastrado com sucesso!');
      formCadastro.reset();
    } else {
      const erro = await response.json();
      alert('❌ Erro ao cadastrar esquema: ' + (erro.message || 'Verifique os dados.'));
    }

  } catch (err) {
    console.error('Erro ao conectar com o servidor:', err);
    alert('❌ Erro ao conectar com o servidor.');
  }
});
