// chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")
const messages = []

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { color: "green" }

let websocket

function createTempMessageElement() {
    const div = document.createElement("div")
    const span = document.createElement("span")
    div.id = "temp-message"
    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = '#ffffff'

    div.appendChild(span)

    span.innerHTML = 'Langmentor AI'
    div.innerHTML = "Gerando resposta..."
    return div
}

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")

    div.classList.add("message--self")
    div.innerHTML = content
    return div
}

const createAudioMessageSelfElement = (audioSrc) => {
    const div = document.createElement("div")
    const audioElement = document.createElement("audio");
    const sourceElement = document.createElement("source");

    div.classList.add("audio--self")

    audioElement.controls = true;
    sourceElement.src = audioSrc;
    sourceElement.type = "audio/mp3";

    // Montando a estrutura dos elementos
    audioElement.appendChild(sourceElement);
    div.appendChild(audioElement);

    return div
}

const createAudioMessageOtherElement = (sender, senderColor, audioSrc) => {
    const div = document.createElement("div");
    const audioElement = document.createElement("audio");
    const sourceElement = document.createElement("source");

    // Configuração do elemento de áudio
    audioElement.controls = true;
    sourceElement.src = audioSrc;
    sourceElement.type = "audio/mp3";

    // Montando a estrutura dos elementos
    audioElement.appendChild(sourceElement);
    div.appendChild(audioElement);

    return div;
};


const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userName, userColor, content, audio } = JSON.parse(data);
    console.log(data)
    console.log(typeof (content))
    const new_content = content.replace(/\n/g, '<br>');


    const message =
        userName == 'Você'
            ? createMessageSelfElement(new_content)
            : createMessageOtherElement(new_content, userName, userColor)
    tempMessage = createTempMessageElement()
    chatMessages.appendChild(message);
    if (userName == 'Você') {
        chatMessages.appendChild(tempMessage);
    }
    else {
        document.querySelector('#temp-message').remove();
    }
    if (audio) {
        const audioMessage = createAudioMessageOtherElement(userName, userColor, audio)
        chatMessages.appendChild(audioMessage);
    }
    scrollScreen();
}


const sendMessage = async (event) => {
    event.preventDefault();

    const message = {
        messages: [{
            userColor: user.color,
            content: chatInput.value
        }]
    };

    const responseData = { userName: 'Você', userColor: '#ffff', content: chatInput.value, audio: null };
    processMessage({ data: JSON.stringify(responseData) });

    chatInput.value = "";

    try {

        // Seleciona todos os elementos de mensagem dentro do chat
        const messageElements = chatMessages.querySelectorAll('.message--self, .message--other');

        // Converte NodeList para Array e pega apenas as últimas 10 mensagens
        const last10MessageElements = Array.from(messageElements).slice(-11);

        // Filtrar e mapear os últimos 10 elementos para criar objetos no formato esperado pela API da OpenAI
        const messagesArray = last10MessageElements.filter(element => element.textContent.trim() !== "Gerando resposta...").map(element => {
            // Determina o papel da mensagem baseado na classe do elemento
            const role = element.classList.contains('message--self') ? 'user' : 'system';

            // Extrai e ajusta o conteúdo da mensagem
            let content = element.textContent.trim();
            if (role === 'system') {
                // Remove o nome "Langmentor AI" do início do conteúdo da mensagem do sistema
                const namePattern = /^Langmentor AI/; // Regex para identificar o padrão do nome no início
                content = content.replace(namePattern, '').trim(); // Remove o nome e espaços extras
            }

            // Retorna o objeto no formato esperado
            return { role, content };
        });

        const response = await fetch("http://localhost:5000/bot-free", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: messagesArray }),
        });
        const data = await response.json();
        // Ajustar conforme o novo formato de resposta da API
        const responseData = { userName: 'Langmentor AI', userColor: '#ffff', content: data.content, audio: data.audio };
        processMessage({ data: JSON.stringify(responseData) });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
    }
};

chat.style.display = "flex"

// loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)



function updateIcon(isRecording) {
    const recordIcon = document.querySelector('#recordButton .material-symbols-outlined');
    if (isRecording) {
        recordIcon.textContent = 'graphic_eq'; // Ícone que representa a gravação
        recordIcon.classList.add('recording');
    } else {
        recordIcon.textContent = 'mic'; // Ícone de microfone padrão
        recordIcon.classList.remove('recording');
    }
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (window.SpeechRecognition && navigator.mediaDevices && window.MediaRecorder) {
    let recognition = new SpeechRecognition();
    let mediaRecorder;
    let audioChunks = [];
    let isTranscribing = false;

    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    document.querySelector('#recordButton').addEventListener('click', async () => {
        if (!isTranscribing) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                updateIcon(true)
                recognition.start();
                isTranscribing = true;

                mediaRecorder.ondataavailable = function (event) {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { 'type': 'audio/wav; codecs=opus' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audioMessage = createAudioMessageSelfElement(audioUrl); // Função para criar o elemento de áudio
                    chatMessages.appendChild(audioMessage); // Adiciona ao chat
                    let formData = new FormData();
                    formData.append('audio', audioBlob, 'audio.mp3');
                    audioChunks = [];
                    updateIcon(false);
                    document.querySelector('#sendButton').click();
                };

            } catch (err) {
                console.error('Falha ao acessar o microfone', err);
                alert('Falha ao acessar o microfone: ' + err.message);
            }
        } else {
            console.log('A transcrição já está em andamento.');
        }
    });

    recognition.addEventListener('result', (e) => {
        let transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

        document.querySelector('#textInput').value = transcript;

    });

    recognition.addEventListener('error', (e) => {
        console.error('Erro no reconhecimento de fala:', e.error);
    });

    recognition.onend = () => {
        isTranscribing = false;
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop(); // Para a gravação quando a transcrição termina
        }
    };

} else {
    console.error('Seu navegador não suporta as APIs necessárias');
    alert('Seu navegador não suporta as APIs necessárias (Web Speech API, MediaRecorder, ou getUserMedia).');
}
