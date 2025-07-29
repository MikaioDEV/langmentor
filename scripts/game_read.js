// =================================================================
// LÓGICA DO JOGO DE LEITURA (game_read.js) - VERSÃO ANTIGA CORRIGIDA
// =================================================================
(function() {
    // Estas variáveis devem ser definidas globalmente ou carregadas de um arquivo, como phrases-read.js
    // const texts = [ ... ];
    
    const textContainer = document.getElementById("text-container");
    const readButton = document.getElementById("read-button");
    const statusText = document.getElementById("status");
    const transcriptDisplay = document.getElementById("transcript");
    const restartButton = document.getElementById("restart-button-read");

    // Garante que os elementos existem antes de adicionar listeners
    if (!textContainer || !readButton || !statusText || !transcriptDisplay || !restartButton) {
        console.error("Um ou mais elementos do jogo de leitura não foram encontrados no DOM.");
        return;
    }

    let words;
    let currentWordIndex;

    function setupNewSentence() {
        // Mostra um texto aleatório
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        words = randomText.split(" "); // Divide o texto em palavras
        currentWordIndex = 0; // Controla a palavra atual
        
        // Reseta o estado da UI
        transcriptDisplay.textContent = "";
        statusText.textContent = 'Click "Read" and start reading aloud!';
        restartButton.style.display = 'none';
        readButton.disabled = false;
        
        displayWords();
    }

    function displayWords() {
      textContainer.innerHTML = words
        .map((word, index) => {
          // Limpa a palavra para a função speakWord
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
          if (index === currentWordIndex) {
            return `<span id="current-word" class="font-bold underline decoration-secondary cursor-pointer" onclick="speakWord('${cleanWord}')">${word}</span>`;
          } else if (index < currentWordIndex) {
            return `<span class="text-primary cursor-pointer" onclick="speakWord('${cleanWord}')">${word}</span>`;
          }
          return `<span class="cursor-pointer" onclick="speakWord('${cleanWord}')">${word}</span>`;
        })
        .join(" ");
    }

    // Configuração do reconhecimento de fala
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        statusText.textContent = "Seu navegador não suporta reconhecimento de fala.";
        readButton.disabled = true;
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    // Função de TTS (exposta globalmente para o onclick funcionar)
    window.speakWord = function(text) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "en-US";
      window.speechSynthesis.speak(speech);
    }

    // Função para remover pontuação
    function removePunctuation(text) {
      return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase().trim();
    }

    let isRecognizing = false;

    readButton.addEventListener("click", () => {
        if (!isRecognizing) {
            try {
                recognition.start();
            } catch(e) {
                console.error("Erro ao iniciar o reconhecimento:", e);
                statusText.textContent = "Não foi possível iniciar. Tente novamente.";
            }
        }
    });

    recognition.onstart = () => {
      isRecognizing = true;
      statusText.textContent = "Listening...";
      readButton.disabled = true;
      readButton.classList.add('opacity-50');
    };

    recognition.onend = () => {
      isRecognizing = false;
      readButton.disabled = false;
      readButton.classList.remove('opacity-50');

      if (currentWordIndex < words.length) {
        statusText.textContent = "Click 'Read' to continue.";
      } else {
        statusText.textContent = "Congratulations! You've finished.";
        restartButton.style.display = "inline-block";
      }
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        isRecognizing = false;
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
        .trim()
        .toLowerCase();

      const cleanTranscript = removePunctuation(transcript);
      transcriptDisplay.textContent = transcript;

      if (currentWordIndex >= words.length) return;

      const currentWord = removePunctuation(words[currentWordIndex]);
      const transcriptWords = cleanTranscript.split(/\s+/);

      if (transcriptWords.includes(currentWord)) {
        const currentWordEl = document.getElementById("current-word");
        if (currentWordEl) {
            currentWordEl.classList.remove('font-bold', 'underline', 'decoration-secondary');
            currentWordEl.classList.add("text-primary");
        }
        
        currentWordIndex++;

        if (currentWordIndex < words.length) {
          displayWords();
        } else {
          statusText.textContent = "Congratulations! You've finished the sentence.";
          restartButton.style.display = 'inline-block';
          recognition.stop();
        }
      }
    };

    // Ação do botão de reiniciar
    restartButton.addEventListener("click", () => {
        setupNewSentence(); // Apenas reinicia o jogo, sem recarregar a página
    });

    // Inicializa o jogo
    setupNewSentence();
})();
