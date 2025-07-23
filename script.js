document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    // --- Configuration ---
    const INTENT_ROUTER_URL = 'https://intent-router.truxonline.com/chat';
    
    // --- État de l'application ---
    let isWaitingForReply = false;

    // ========================================================================
    // DÉFINITION DE TOUTES LES FONCTIONS
    // ========================================================================

    const addMessage = (text, sender) => {
        const messageElem = document.createElement('div');
        messageElem.classList.add('message', sender);
        messageElem.textContent = text;
        chatBox.appendChild(messageElem);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const setInputState = (enabled) => {
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
    };

    const sendMessage = async () => {
        if (isWaitingForReply) return;
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';
        isWaitingForReply = true;
        setInputState(false);

        try {
            const response = await fetch(INTENT_ROUTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message }) 
           });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail?.error || 'Erreur inconnue du serveur.');
            }

            const data = await response.json();
            
            if (data && data.reply) {
                addMessage(data.reply, 'lisa');
            } else {
                throw new Error("La réponse du serveur est dans un format inattendu.");
            }

        } catch (error) {
            console.error("Erreur dans sendMessage:", error);
            addMessage(`Erreur: ${error.message}`, 'lisa');
        } finally {
            isWaitingForReply = false;
            setInputState(true);
            userInput.focus();
        }
    };

    // ========================================================================
    // MISE EN PLACE DES ÉCOUTEURS D'ÉVÉNEMENTS
    // ========================================================================

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
    });

    // Message de bienvenue
    addMessage("Bonjour, mon Roi. Je suis prête.", 'lisa');
});