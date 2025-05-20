// js/main.js

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
      alert('Esquema cadastrado com sucesso!');
      formCadastro.reset();
    } else {
      alert('Erro ao cadastrar esquema.');
    }
  } catch (err) {
    console.error('Erro:', err);
    alert('Erro ao conectar com o servidor.');
  }
});
