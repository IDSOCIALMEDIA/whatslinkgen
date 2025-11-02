// Espera o DOM carregar para rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ---
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const linkOutput = document.getElementById('generated-link');
    const messagePreview = document.getElementById('preview-message');
    const qrCodeContainer = document.getElementById('qrcode');
    const qrColorInput = document.getElementById('qr-color');
    
    const copyBtn = document.getElementById('copy-link');
    const downloadBtn = document.getElementById('download-qr');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Templates
    const defaultTemplatesContainer = document.getElementById('default-templates');
    const customTemplatesContainer = document.getElementById('custom-templates');
    const saveTemplateBtn = document.getElementById('save-template');
    const templateNameInput = document.getElementById('template-name');

    // --- Variáveis Globais ---
    let qrCodeInstance = null; // Armazena a instância do QR Code
    let currentLink = ''; // Armazena o link gerado atualmente
    let currentQRCodeColor = '#000000'; // Cor padrão do QR Code

    // --- Funções Principais ---

    /**
     * Função Central: Atualiza tudo em tempo real
     */
    function updateAllPreviews() {
        const phone = phoneInput.value.replace(/\D/g, ''); // Limpa tudo que não for dígito
        const message = messageInput.value;
        const encodedMessage = encodeURIComponent(message);

        // 1. Atualiza o Link
        if (phone.length > 9) { // Um número de telefone válido (com DDI)
            currentLink = `https://wa.me/${phone}?text=${encodedMessage}`;
            linkOutput.value = currentLink;
        } else {
            currentLink = '';
            linkOutput.value = 'Aguardando número válido...';
        }

        // 2. Atualiza o Preview da Mensagem
        if (message.trim() === '') {
            messagePreview.textContent = 'Sua mensagem aparecerá aqui...';
        } else {
            messagePreview.textContent = message;
        }

        // 3. Atualiza o QR Code
        generateQRCode();
    }

    /**
     * Gera ou atualiza o QR Code
     */
    function generateQRCode() {
        // Limpa o QR Code anterior
        qrCodeContainer.innerHTML = '';

        if (currentLink === '') {
            qrCodeContainer.innerHTML = '<span style="color: var(--text-light-color);">Digite um número para gerar o QR Code</span>';
            return;
        }

        // Cria a nova instância do QR Code
        // Usamos a biblioteca qrcode.js que foi importada no HTML
        try {
            qrCodeInstance = new QRCode(qrCodeContainer, {
                text: currentLink,
                width: 200,
                height: 200,
                colorDark: currentQRCodeColor,
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.error("Erro ao gerar QR Code:", e);
        }
    }

    /**
     * Formata o número de telefone enquanto digita
     */
    function formatPhoneNumber() {
        let value = phoneInput.value.replace(/\D/g, '');
        // Esta é uma máscara simples, ajuste conforme sua necessidade
        // Ex: 55 (11) 91234-5678
        if (value.length > 2) {
            value = value.substring(0, 2) + ' (' + value.substring(2);
        }
        if (value.length > 7) {
            value = value.substring(0, 7) + ') ' + value.substring(7);
        }
        if (value.length > 13) {
            value = value.substring(0, 13) + '-' + value.substring(13);
        }
        if (value.length > 18) { // Limita o tamanho
            value = value.substring(0, 18);
        }
        phoneInput.value = value;
    }

    /**
     * Copia o link gerado para a área de transferência
     */
    function copyLinkToClipboard() {
        if (currentLink === '') {
            alert('Não há link para copiar. Digite um número primeiro.');
            return;
        }
        navigator.clipboard.writeText(currentLink).then(() => {
            copyBtn.textContent = 'Copiado!';
            setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2000);
        }).catch(err => {
            console.error('Falha ao copiar:', err);
            alert('Falha ao copiar o link.');
        });
    }

    /**
     * Baixa o QR Code como um arquivo PNG
     */
    function downloadQRCode() {
        if (!qrCodeInstance || currentLink === '') {
            alert('Gere um QR Code primeiro.');
            return;
        }
        
        // O qrcode.js gera um elemento <canvas>
        const canvas = qrCodeContainer.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'qrcode-whatsapp.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            alert('Não foi possível encontrar o canvas do QR Code.');
        }
    }

    // --- Funções de Tema (Dark/Light Mode) ---
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = 'Alternar Tema ☀️';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.textContent = 'Alternar Tema 🌙';
        }
    }

    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }

    // --- Funções de Templates (localStorage) ---

    function loadTemplates() {
        const templates = JSON.parse(localStorage.getItem('customTemplates')) || [];
        customTemplatesContainer.innerHTML = ''; // Limpa
        templates.forEach((template, index) => {
            const item = document.createElement('div');
            item.className = 'custom-template-item';
            
            const btn = document.createElement('button');
            btn.className = 'custom-template-btn';
            btn.textContent = template.name;
            btn.dataset.message = template.message;
            btn.addEventListener('click', () => {
                messageInput.value = template.message;
                updateAllPreviews(); // Atualiza tudo ao aplicar o template
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-template';
            delBtn.textContent = 'X';
            delBtn.dataset.index = index;
            delBtn.addEventListener('click', deleteTemplate);

            item.appendChild(btn);
            item.appendChild(delBtn);
            customTemplatesContainer.appendChild(item);
        });
    }

    function saveTemplate() {
        const name = templateNameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (name === '' || message === '') {
            alert('Por favor, defina um nome e uma mensagem para o template.');
            return;
        }

        const templates = JSON.parse(localStorage.getItem('customTemplates')) || [];
        templates.push({ name, message });
        localStorage.setItem('customTemplates', JSON.stringify(templates));
        
        templateNameInput.value = ''; // Limpa o campo
        loadTemplates(); // Recarrega a lista
    }

    function deleteTemplate(event) {
        const index = event.target.dataset.index;
        const templates = JSON.parse(localStorage.getItem('customTemplates')) || [];
        
        if (confirm(`Tem certeza que deseja deletar o template "${templates[index].name}"?`)) {
            templates.splice(index, 1); // Remove o item
            localStorage.setItem('customTemplates', JSON.stringify(templates));
            loadTemplates(); // Recarrega a lista
        }
    }

    // --- Registro de Event Listeners ---
    
    // Atualiza em tempo real
    phoneInput.addEventListener('input', updateAllPreviews);
    messageInput.addEventListener('input', updateAllPreviews);
    
    // Formata o telefone (usa 'keyup' para pegar o valor após a digitação)
    phoneInput.addEventListener('keyup', formatPhoneNumber);

    // Cor do QR Code
    qrColorInput.addEventListener('input', (e) => {
        currentQRCodeColor = e.target.value;
        generateQRCode(); // Regera o QR Code com a nova cor
    });
    
    // Botões
    copyBtn.addEventListener('click', copyLinkToClipboard);
    downloadBtn.addEventListener('click', downloadQRCode);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Templates
    saveTemplateBtn.addEventListener('click', saveTemplate);
    defaultTemplatesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('template-btn')) {
            messageInput.value = e.target.textContent;
            updateAllPreviews();
        }
    });
    
    // --- Inicialização ---

    // Carrega o tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Carrega os templates salvos
    loadTemplates();

    // Gera o preview inicial (vazio)
    updateAllPreviews();
    
    // Registra o Service Worker (para o PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => console.log('Service Worker registrado com sucesso:', registration))
            .catch(error => console.log('Falha ao registrar Service Worker:', error));
    }

});
