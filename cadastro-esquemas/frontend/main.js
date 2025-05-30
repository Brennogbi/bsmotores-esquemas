const formCadastro = document.getElementById('form-cadastro');

formCadastro.addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(formCadastro);
  
  // Validação no frontend
  const cv = formData.get('cv');
  const voltagem = formData.get('voltagem');
  const tensao = formData.get('tensao');

  if (isNaN(cv) || cv === '' || isNaN(voltagem) || voltagem === '' || isNaN(tensao) || tensao === '') {
    alert('❌ Os campos CV, Voltagem e Tensão devem ser números válidos.');
    return;
  }

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
      alert('❌ Erro ao cadastrar: ' + (erro.erro || 'Verifique os dados e tente novamente.'));
    }

  } catch (err) {
    console.error('Erro ao conectar com o servidor:', err);
    alert('❌ Erro ao conectar com o servidor. Verifique sua conexão ou tente novamente.');
  }
});