document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const INTENT_ROUTER_URL = 'https://intent-router.truxonline.com/chat';
    
    let conversationHistory = [];
    let isWaitingForReply = false; // Notre nouvelle variable de verrouillage

    // Nouvelle fonction pour gérer l'état de l'input
    function setInputState(enabled) {
        userInput.disabled = !enabled;
        sendBtn.disabled = !enabled;
        if (enabled) {
            userInput.placeholder = "Envoyer un message à Lisa...";
            sendBtn.style.cursor = 'pointer';
            sendBtn.style.opacity = '1';
        } else {
            userInput.placeholder = "Lisa réfléchit...";
            sendBtn.style.cursor = 'not-allowed';
            sendBtn.style.opacity = '0.5';
        }
    }

    function addMessage(text, sender) {
        // ... (cette fonction ne change pas) ...
    }

    async function sendMessage() {
        // On vérifie le verrou
        if (isWaitingForReply) return;

        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';

        // === VERROUILLAGE ===
        isWaitingForReply = true;
        setInputState(false);
        // ====================

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

            conversationHistory.push({ "role": "user", "content": message });
            conversationHistory.push({ "role": "assistant", "content": data.reply });

        } catch (error) {
            addMessage(`Erreur: ${error.message}`, 'lisa');
        } finally {
            // === DÉVERROUILLAGE ===
            isWaitingForReply = false;
            setInputState(true);
            userInput.focus(); // Redonne le focus à l'input
            // ======================
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });
});