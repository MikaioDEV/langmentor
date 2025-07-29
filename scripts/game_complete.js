// =================================================================
// LÓGICA DO JOGO DE COMPLETAR (game_complete.js)
// =================================================================
(function() {
    // Estas variáveis devem ser definidas globalmente ou carregadas de um arquivo, como sentences.js
    // const sentences = [ ... ]; 

    const correctSound = new Audio("sounds/correct.mp3");
    const incorrectSound = new Audio("sounds/incorrect.mp3");

    correctSound.volume = 0.5;
    incorrectSound.volume = 0.5;
    correctSound.playbackRate = 3.0;
    incorrectSound.playbackRate = 3.0;

    function getNextSentenceIndex() {
        const sentenceWeights = sentences.map((s, i) => ({ index: i, weight: Math.max((s.errors || 0) - (s.correct || 0) + 1, 1) }));
        const totalWeight = sentenceWeights.reduce((sum, s) => sum + s.weight, 0);
        const random = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        for (let i = 0; i < sentenceWeights.length; i++) {
            cumulativeWeight += sentenceWeights[i].weight;
            if (random < cumulativeWeight) return sentenceWeights[i].index;
        }
        return 0;
    }

    let currentSentenceIndex = getNextSentenceIndex();

    const sentenceElement = document.getElementById("sentence");
    const sentencePtElement = document.getElementById("sentence-pt");
    const feedbackMessage = document.getElementById("feedback-message");
    const checkButton = document.getElementById("check-btn");
    const nextButton = document.getElementById("next-btn");
    const showAnswerButton = document.getElementById("show-answer-btn");

    function loadSentence() {
        const currentSentence = sentences[currentSentenceIndex];
        // Inicializa as propriedades se não existirem
        currentSentence.errors = currentSentence.errors || 0;
        currentSentence.correct = currentSentence.correct || 0;
        currentSentence.views = currentSentence.views || 0;

        const completeSentence = currentSentence.sentence.replace("____", currentSentence.answer);

        // Correção do bug de tamanho do input
        const inputHTML = `<input id="answer-input" type="text" class="border-b-2 border-gray-300 focus:border-primary outline-none text-center bg-transparent" style="width: 5ch; min-width: 5ch; max-width: 40ch;" oninput="this.style.width = (this.value.length + 1) + 'ch';">`;
        
        sentenceElement.innerHTML = `
            <button id="speak-btn" class="text-2xl text-secondary hover:text-blue-400 align-middle">🔊</button>
            <span class="align-middle">${currentSentence.sentence.replace("____", inputHTML)}</span>`;

        const input = document.getElementById("answer-input");
        if(input) input.focus();

        sentencePtElement.innerHTML = currentSentence.sentencePt.replace(
            currentSentence.answerPt,
            `<span class="text-primary font-bold">${currentSentence.answerPt}</span>`,
        );

        feedbackMessage.classList.add("hidden");
        nextButton.classList.add("hidden");
        checkButton.classList.remove("hidden");
        showAnswerButton.classList.add("hidden");

        document.getElementById("speak-btn").addEventListener("click", () => speakSentence(completeSentence));
        
        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                if (!checkButton.classList.contains("hidden")) {
                    checkAnswer();
                } else if (!nextButton.classList.contains("hidden")) {
                    nextButton.click();
                }
            }
        });
    }

    function checkAnswer() {
        const userAnswer = document.getElementById("answer-input").value.toLowerCase().trim();
        const currentSentence = sentences[currentSentenceIndex];
        const correctAnswer = currentSentence.answer.toLowerCase();

        if (userAnswer === correctAnswer) {
            correctSound.play();
            feedbackMessage.textContent = "🎉 Your answer is correct!";
            feedbackMessage.className = "text-center mt-4 font-bold text-lg text-primary";
            currentSentence.correct++;
            checkButton.classList.add("hidden");
            nextButton.classList.remove("hidden");
        } else {
            incorrectSound.play();
            feedbackMessage.textContent = "❌ Oops! Try again or check the correct answer.";
            feedbackMessage.className = "text-center mt-4 font-bold text-lg text-incorrect";
            currentSentence.errors++;
            showAnswerButton.classList.remove("hidden");
        }
        feedbackMessage.classList.remove("hidden");
    }

    checkButton.addEventListener("click", checkAnswer);
    nextButton.addEventListener("click", () => {
        currentSentenceIndex = getNextSentenceIndex();
        loadSentence();
    });

    function showAnswer() {
        const currentSentence = sentences[currentSentenceIndex];
        const input = document.getElementById("answer-input");
        input.value = currentSentence.answer;
        input.style.width = (currentSentence.answer.length + 1) + "ch";
        currentSentence.views++;
        showAnswerButton.classList.add("hidden");
    }

    showAnswerButton.addEventListener("click", showAnswer);

    function speakSentence(sentence) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // Carrega a primeira frase quando o DOM estiver pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadSentence);
    } else {
        loadSentence();
    }
})();


// =================================================================
// LÓGICA DO JOGO DE LEITURA (game_read.js)
// =================================================================
(function() {
    // Estas variáveis devem ser definidas globalmente ou carregadas de um arquivo, como phrases-read.js
    // const texts = [ ... ];
    
    const textContainer = document.getElementById('text-container');
    const readButton = document.getElementById('read-button');
    const statusEl = document.getElementById('status');
    const transcriptContainerEl = document.getElementById('transcript-container');
    const transcriptEl = document.getElementById('transcript');
    const restartButton = document.getElementById('restart-button');
    let currentTextIndex = 0;

    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        }
    }

    function loadText() {
        const text = texts[currentTextIndex];
        textContainer.innerHTML = ''; // Limpa o conteúdo anterior
        text.split(' ').forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word + ' ';
            wordSpan.className = 'word-span';
            wordSpan.onclick = () => speak(word.replace(/[.,!?]/g, ''));
            textContainer.appendChild(wordSpan);
        });
        
        transcriptContainerEl.classList.add('hidden');
        statusEl.textContent = 'Click "Read" and start reading aloud!';
        readButton.disabled = false;
        restartButton.style.display = 'none';
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        readButton.addEventListener('click', () => recognition.start());

        recognition.onstart = () => {
            statusEl.textContent = 'Listening...';
            readButton.disabled = true;
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            transcriptEl.textContent = transcript;
            transcriptContainerEl.classList.remove('hidden');
        };
        recognition.onend = () => {
            statusEl.textContent = 'Finished listening. Click "Read another" to continue.';
            readButton.disabled = true;
            restartButton.style.display = 'inline-flex';
        };
        recognition.onerror = (event) => {
            statusEl.textContent = `Error: ${event.error}. Please try again.`;
            readButton.disabled = false;
        };
    } else {
        statusEl.textContent = "Sorry, your browser doesn't support Speech Recognition.";
        readButton.disabled = true;
    }

    restartButton.addEventListener('click', () => {
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        loadText();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadText);
    } else {
        loadText();
    }
})();


// =================================================================
// LÓGICA DE CONTROLE DA UI E PWA
// =================================================================
(function() {
    // Lógica para troca de abas
    const tabLearnBtn = document.getElementById('tab-learn-btn');
    const tabReadBtn = document.getElementById('tab-read-btn');
    const learnContainer = document.getElementById('learn-container');
    const readContainer = document.getElementById('read-container');

    function showLearn() {
        learnContainer.classList.remove('hidden');
        readContainer.classList.add('hidden');
        tabLearnBtn.classList.add('tab-active');
        tabLearnBtn.classList.remove('text-text_light');
        tabReadBtn.classList.remove('tab-active');
        tabReadBtn.classList.add('text-text_light');
    }

    function showRead() {
        learnContainer.classList.add('hidden');
        readContainer.classList.remove('hidden');
        tabLearnBtn.classList.remove('tab-active');
        tabLearnBtn.classList.add('text-text_light');
        tabReadBtn.classList.add('tab-active');
        tabReadBtn.classList.remove('text-text_light');
    }

    tabLearnBtn.addEventListener('click', showLearn);
    tabReadBtn.addEventListener('click', showRead);

    // Lógica para PWA
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/scripts/service-worker.js")
                .catch((error) => console.error("Service Worker registration failed:", error));
        });
    }
    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        Swal.fire({
            title: "Install WebApp",
            html: `🌟 Works offline<br>⚡ Quick to launch<br>🚀 One-tap learning`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Install Now 💖",
            cancelButtonText: "Maybe Later 😞",
            confirmButtonColor: "#58cc02", // Cor verde do Duolingo
            cancelButtonColor: "#b9babd",
        }).then((result) => {
            if (result.isConfirmed) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
            }
        });
    });
})();
