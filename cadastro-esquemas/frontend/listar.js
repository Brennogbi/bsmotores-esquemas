async function buscarMotores() {
    const marca = document.getElementById('filtroMarca').value;
    const url = `https://bsmotores-esquemas.onrender.com/api/motores/buscar?marca=${marca}`;
    try {
        const response = await fetch(url);
        const motores = await response.json();
        exibirMotores(motores);
    } catch (error) {
        console.error('Erro ao buscar motores:', error);
    }
}

function exibirMotores(motores) {
    const lista = document.getElementById('listaMotores');
    lista.innerHTML = '';

    motores.forEach(motor => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${motor.marca} - CV: ${motor.cv}</h3>
            <p>Voltagem: ${motor.voltagem}V, Tensão: ${motor.tensao}V, Tipo: ${motor.tipoLigacao}</p>
            <p>Observações: ${motor.observacoes || 'Nenhuma'}</p>
            <img src="${motor.imagem}" alt="Imagem do motor" style="max-width: 200px;"><br><br>
            <button onclick="deletarMotor('${motor._id}')">Deletar</button>
            <h4>Arquivos Adicionais:</h4>
            ${motor.arquivos && motor.arquivos.length > 0 ? motor.arquivos.map(arquivo => `
                <a href="${arquivo}" download>Baixar ${arquivo.split('/').pop()}</a><br>
            `).join('') : 'Nenhum arquivo adicional'}
            <hr>
        `;
        lista.appendChild(div);
    });
}

async function deletarMotor(id) {
    if (confirm('Tem certeza que deseja deletar este motor?')) {
        try {
            const response = await fetch(`https://bsmotores-esquemas.onrender.com/api/motores/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            alert(result.mensagem);
            buscarMotores(); // Atualiza a lista após deletar
        } catch (error) {
            console.error('Erro ao deletar motor:', error);
        }
    }
}

// Busca inicial ao carregar a página
buscarMotores();