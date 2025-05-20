// frontend/main.js

// Seleciona o formulário pelo ID
const formCadastro = document.getElementById('form-cadastro');

// Adiciona um evento ao enviar o formulário
formCadastro.addEventListener('submit', async function (event) {
  event.preventDefault(); // Impede o envio padrão da página

  const formData = new FormData(formCadastro); // Cria um FormData com todos os campos do formulário

  try {
    // Envia os dados para a API usando método POST
    const response = await fetch('https://bsmotores-esquemas.onrender.com.com/api/motores/cadastrar', {
      method: 'POST',
      body: formData
    });

    // Se o cadastro foi bem-sucedido
    if (response.ok) {
      alert('✅ Esquema cadastrado com sucesso!');
      formCadastro.reset(); // Limpa o formulário após sucesso
    } else {
      const erro = await response.json();
      alert('❌ Erro ao cadastrar esquema: ' + (erro.message || 'Verifique os dados.'));
    }

  } catch (err) {
    console.error('Erro ao conectar com o servidor:', err);
    alert('❌ Erro ao conectar com o servidor.');
  }
});
