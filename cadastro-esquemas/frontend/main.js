document.getElementById('formCadastro').addEventListener('submit', async (event) => {
    event.preventDefault();

    const marca = document.getElementById('marca').value;
    const cv = document.getElementById('cv').value;
    const voltagem = document.getElementById('voltagem').value;
    const tensao = document.getElementById('tensao').value;
    const tipoLigacao = document.getElementById('tipoLigacao').value;
    const observacoes = document.getElementById('observacoes').value;
    const imagem = document.getElementById('imagem').files[0];
    const arquivos = document.getElementById('arquivos').files;

    if (isNaN(cv) || cv === '' || isNaN(voltagem) || voltagem === '' || isNaN(tensao) || tensao === '') {
        alert('❌ Os campos CV, Voltagem e Tensão devem ser números válidos.');
        return;
    }

    const formData = new FormData();
    formData.append('marca', marca);
    formData.append('cv', cv);
    formData.append('voltagem', voltagem);
    formData.append('tensao', tensao);
    formData.append('tipoLigacao', tipoLigacao);
    formData.append('observacoes', observacoes);
    formData.append('imagem', imagem);

    // Adicionar múltiplos arquivos ao FormData
    for (let i = 0; i < arquivos.length; i++) {
        formData.append('arquivos', arquivos[i]);
    }

    try {
        const response = await fetch('https://bsmotores-esquemas.onrender.com/api/motores/cadastrar', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.mensagem) {
            alert('✅ Esquema cadastrado com sucesso!');
            document.getElementById('formCadastro').reset();
        } else {
            alert('❌ ' + result.erro);
        }
    } catch (error) {
        alert('❌ Erro ao conectar com o servidor: ' + error.message);
    }
});