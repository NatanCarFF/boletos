document.addEventListener('DOMContentLoaded', () => {
    const pfBoletosList = document.getElementById('pfBoletosList');
    const pjBoletosList = document.getElementById('pjBoletosList');
    const addPfBoletoForm = document.getElementById('addPfBoletoForm');
    const addPjBoletoForm = document.getElementById('addPjBoletoForm');
    const exportDataButton = document.getElementById('exportData');
    const importDataInput = document.getElementById('importData');

    let boletosData = {
        pessoaFisica: [],
        pessoaJuridica: []
    };

    // --- Local Storage Functions ---

    function saveBoletos() {
        localStorage.setItem('boletosData', JSON.stringify(boletosData));
    }

    function loadBoletos() {
        const storedData = localStorage.getItem('boletosData');
        if (storedData) {
            boletosData = JSON.parse(storedData);
        }
    }

    // --- Render Functions ---

    function renderBoletos(type) {
        const listElement = type === 'pessoaFisica' ? pfBoletosList : pjBoletosList;
        listElement.innerHTML = ''; // Clear current list

        boletosData[type].forEach((boleto, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="boleto-info">
                    <div class="boleto-description">${boleto.description}</div>
                    <div class="boleto-date">Vencimento: ${new Date(boleto.dueDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <button class="delete-btn" data-type="${type}" data-index="${index}">Excluir</button>
            `;
            listElement.appendChild(li);
        });
    }

    // --- Add Boleto Functions ---

    addPfBoletoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const description = document.getElementById('pfDescription').value;
        const dueDate = document.getElementById('pfDueDate').value;

        if (description && dueDate) {
            boletosData.pessoaFisica.push({ description, dueDate });
            saveBoletos();
            renderBoletos('pessoaFisica');
            addPfBoletoForm.reset();
        } else {
            alert('Por favor, preencha todos os campos para Pessoa Física.');
        }
    });

    addPjBoletoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const description = document.getElementById('pjDescription').value;
        const dueDate = document.getElementById('pjDueDate').value;

        if (description && dueDate) {
            boletosData.pessoaJuridica.push({ description, dueDate });
            saveBoletos();
            renderBoletos('pessoaJuridica');
            addPjBoletoForm.reset();
        } else {
            alert('Por favor, preencha todos os campos para Pessoa Jurídica.');
        }
    });

    // --- Delete Boleto Function ---

    document.querySelectorAll('.columns').forEach(column => {
        column.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const type = event.target.dataset.type;
                const index = parseInt(event.target.dataset.index);

                if (confirm('Tem certeza que deseja excluir este boleto?')) {
                    boletosData[type].splice(index, 1);
                    saveBoletos();
                    renderBoletos(type);
                }
            }
        });
    });


    // --- Import/Export Functions ---

    exportDataButton.addEventListener('click', () => {
        const dataStr = JSON.stringify(boletosData, null, 2); // Pretty print JSON
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boletos_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importDataInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    // Basic validation for the imported data structure
                    if (importedData.pessoaFisica && Array.isArray(importedData.pessoaFisica) &&
                        importedData.pessoaJuridica && Array.isArray(importedData.pessoaJuridica)) {
                        boletosData = importedData;
                        saveBoletos();
                        renderBoletos('pessoaFisica');
                        renderBoletos('pessoaJuridica');
                        alert('Dados importados com sucesso!');
                    } else {
                        alert('Formato de arquivo JSON inválido. Verifique se contém "pessoaFisica" e "pessoaJuridica" como arrays.');
                    }
                } catch (error) {
                    alert('Erro ao ler o arquivo JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    });

    // --- Initial Load ---
    loadBoletos();
    renderBoletos('pessoaFisica');
    renderBoletos('pessoaJuridica');
});