document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    // C'est l'URL de notre service, exposée par Traefik
    const INTENT_ROUTER_URL = 'https://intent-router.truxonline.com/chat';
    
    // L'historique de la conversation, crucial pour le contexte de l'IA
    let conversationHistory = [];

    function addMessage(text, sender) {
        const messageElem = document.createElement('div');
        messageElem.classList.add('message', sender);
        messageElem.textContent = text;
        chatBox.appendChild(messageElem);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = 'auto'; // Réinitialiser la hauteur

        try {
            const response = await fetch(INTENT_ROUTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message, 
                    history: conversationHistory 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail?.error || 'Erreur inconnue du serveur.');
            }

            const data = await response.json();
            addMessage(data.reply, 'lisa');

            // On met à jour l'historique pour les prochains appels
            conversationHistory.push({ "role": "user", "content": message });
            conversationHistory.push({ "role": "assistant", "content": data.reply });

        } catch (error) {
            addMessage(`Erreur: ${error.message}`, 'lisa');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Empêche le retour à la ligne
            sendMessage();
        }
    });

    // Ajuste la hauteur du textarea dynamiquement
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });
});