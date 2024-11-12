const textContainer = document.getElementById("text-container");
const readButton = document.getElementById("read-button");
const statusText = document.getElementById("status");
const transcriptDisplay = document.getElementById("transcript"); // Referência ao div da transcrição

// Mostra um texto aleatório sempre que a página é carregada
const randomText = texts[Math.floor(Math.random() * texts.length)];
const words = randomText.split(" "); // Divide o texto em palavras
let currentWordIndex = 0; // Controla a palavra atual

function displayWords() {
  textContainer.innerHTML = words
    .map((word, index) => {
      if (index === currentWordIndex) {
        return `<span id="current-word" class="font-bold cursor-pointer" onclick="speakWord('${word}')">${word}</span>`; // Palavra atual destacada com clique
      } else if (index < currentWordIndex) {
        return `<span class="text-green-500 cursor-pointer" onclick="speakWord('${word}')">${word}</span>`; // Palavras corretas em verde com clique
      }
      return `<span class="cursor-pointer" onclick="speakWord('${word}')">${word}</span>`; // Demais palavras com clique
    })
    .join(" ");
}

displayWords();

// Configuração do reconhecimento de fala
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = true;

// Função de TTS
function speakWord(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;

  const voices = speechSynthesis.getVoices();
  const naturalVoice = voices.find((voice) =>
    voice.name.includes("Google US English"),
  );
  if (naturalVoice) {
    speech.voice = naturalVoice;
  }

  window.speechSynthesis.speak(speech);
}

// Função para remover pontuação
function removePunctuation(text) {
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
}

// Inicia reconhecimento de fala apenas uma vez
let permissionGranted =
  localStorage.getItem("speechPermission") === "granted";
let isRecognizing = false; // Variável para controlar se o reconhecimento está em andamento

readButton.addEventListener("click", () => {
  if (!permissionGranted) {
    // Solicita permissão para o reconhecimento de fala
    recognition.start();
    permissionGranted = true;
    localStorage.setItem("speechPermission", "granted"); // Armazena a permissão no localStorage
    statusText.textContent = "Listening...";
  } else {
    if (!isRecognizing) {
      recognition.start(); // Inicia a escuta
      statusText.textContent = "Listening...";
    } else {
      // Já está reconhecendo, não faz nada
      statusText.textContent = "Already listening...";
    }
  }
});

recognition.addEventListener("start", () => {
  isRecognizing = true;
});

recognition.addEventListener("end", () => {
  isRecognizing = false;

  if (currentWordIndex < words.length) {
    recognition.start(); // Reinicia a escuta para capturar a próxima palavra
    statusText.textContent = "Listening...";
  } else {
    statusText.textContent = "Recognition finished. Well done!";
    document.getElementById("restart-button").style.display =
      "inline-block"; // Exibe o botão de reiniciar
  }
});

recognition.addEventListener("result", (event) => {
  const transcript = Array.from(event.results)
    .map((result) => result[0].transcript)
    .join("")
    .trim()
    .toLowerCase();

  // Remove pontuação da transcrição
  const cleanTranscript = removePunctuation(transcript);

  // Exibe a transcrição em tempo real
  transcriptDisplay.textContent = transcript;

  // Remove pontuação da palavra atual
  const currentWord = removePunctuation(
    words[currentWordIndex].toLowerCase(),
  );

  const transcriptWords = cleanTranscript.split(/\s+/); // Divide a transcrição em palavras

  // Verifica se a palavra atual está contida na transcrição
  if (transcriptWords.includes(currentWord)) {
    document
      .getElementById("current-word")
      .classList.add("text-green-500");
    currentWordIndex++; // Avança para a próxima palavra

    if (currentWordIndex < words.length) {
      displayWords(); // Atualiza para a próxima palavra
    } else {
      statusText.textContent =
        "Congratulations! You've finished the sentence.";
      // Não precisamos mais reiniciar o reconhecimento
    }
  } else {
    document.getElementById("current-word").style.color = "red"; // Palavra incorreta
  }
});

document
  .getElementById("restart-button")
  .addEventListener("click", () => {
    location.reload(); // Recarrega a página para começar de novo
  });