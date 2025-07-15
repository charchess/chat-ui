
document.addEventListener('DOMContentLoaded', () => {
    // ... (les premières lignes avec les const ne changent pas) ...
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const INTENT_ROUTER_URL = 'https://intent-router.truxonline.com/chat';
    let conversationHistory = [];
    let isWaitingForReply = false;
    
    // ... (setInputState et addMessage ne changent pas) ...

    async function sendMessage() {
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
                body: JSON.stringify({ message: message, history: conversationHistory })
            });
            
            console.log("Réponse brute du serveur:", response); // LOG DE DÉBOGAGE

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur du serveur (${response.status}): ${errorText}`);
            }

            // On vérifie si la réponse a un contenu avant de la parser
            const responseText = await response.text();
            const data = responseText ? JSON.parse(responseText) : null;
            
            console.log("Données JSON parsées:", data); // LOG DE DÉBOGAGE

            // On vérifie que les données et la propriété 'reply' existent
            if (data && data.reply) {
                addMessage(data.reply, 'lisa');
                conversationHistory.push({ "role": "user", "content": message });
                conversationHistory.push({ "role": "assistant", "content": data.reply });
            } else {
                // Si la réponse est valide mais ne contient pas ce qu'on attend
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