const correctSound = new Audio("sounds/correct.mp3");
const incorrectSound = new Audio("sounds/incorrect.mp3");

correctSound.volume = 0.5;
incorrectSound.volume = 0.5;

// Ajustar a velocidade de reprodução para 2x
correctSound.playbackRate = 3.0;
incorrectSound.playbackRate = 3.0;

// Função para selecionar a Next frase com certa aleatoriedade ponderada
function getNextSentenceIndex() {
  // Calcular a diferença entre erros e acertos para cada frase e gerar pesos
  const sentenceWeights = sentences.map((sentence, index) => {
    const difference = sentence.errors - sentence.correct; // Diferença entre erros e acertos
    const weight = Math.max(difference + 1, 1); // Evitar peso negativo, mínimo 1
    return { index, weight };
  });

  // Somar os pesos para calcular a distribuição
  const totalWeight = sentenceWeights.reduce(
    (sum, sentence) => sum + sentence.weight,
    0,
  );

  // Gerar um valor aleatório baseado na soma dos pesos
  const random = Math.random() * totalWeight;

  // Selecionar a frase com base no valor aleatório e nos pesos
  let cumulativeWeight = 0;
  for (let i = 0; i < sentenceWeights.length; i++) {
    cumulativeWeight += sentenceWeights[i].weight;
    if (random < cumulativeWeight) {
      return sentenceWeights[i].index;
    }
  }
  return sentenceWeights[0].index; // Retornar a primeira frase como fallback
}

let currentSentenceIndex = getNextSentenceIndex(); // Inicializa com a frase aleatória ponderada

const sentenceElement = document.getElementById("sentence");
const sentencePtElement = document.getElementById("sentence-pt");
const feedbackMessage = document.getElementById("feedback-message");
const checkButton = document.getElementById("check-btn");
const nextButton = document.getElementById("next-btn");
const showAnswerButton = document.getElementById("show-answer-btn");

function loadSentence() {
  const currentSentence = sentences[currentSentenceIndex];

  // Cria a frase completa para ser usada na fala, substituindo "____" pela resposta correta.
  const completeSentence = currentSentence.sentence.replace(
    "____",
    currentSentence.answer,
  );

  sentenceElement.innerHTML = `
              <button id="speak-btn" class="ml-2 text-white p-1 rounded">🔊</button><br>
              ${currentSentence.sentence.replace(
                "____",
                '<input id="answer-input" type="text" class="border-b-2 border-gray-400 focus:border-primary outline-none text-center" style="width: 4ch; max-width: 10ch;" oninput="this.style.width = Math.min(this.value.length, 15) + \'ch\';">',
              )}
          `;

  const input = document.getElementById("answer-input");
  input.focus();

  sentencePtElement.innerHTML = currentSentence.sentencePt.replace(
    currentSentence.answerPt,
    `<span style="color: var(--primary); font-weight:bold;">${currentSentence.answerPt}</span>`,
  );

  feedbackMessage.classList.add("hidden");
  nextButton.classList.add("hidden");
  checkButton.classList.remove("hidden");
  showAnswerButton.classList.add("hidden");

  // Adicionar evento ao botão de fala
  document.getElementById("speak-btn").addEventListener("click", () => {
    speakSentence(completeSentence);
  });

  // document.getElementById("speak-btn").click();

  // Adicionar evento para Check a resposta ao pressionar Enter
  const answerInput = document.getElementById("answer-input");
  answerInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      // Verifica quais botões estão visíveis e chama a função apropriada
      if (
        !checkButton.classList.contains("hidden") &&
        showAnswerButton.classList.contains("hidden")
      ) {
        console.log("check");
        checkAnswer(); // Se apenas o botão de Check está ativo, verifica a resposta
        return;
      }
      if (!showAnswerButton.classList.contains("hidden")) {
        console.log("show");
        showAnswer(); // Esconde o botão de mostrar resposta
        return;
      }
      if (!nextButton.classList.contains("hidden")) {
        console.log("next");
        currentSentenceIndex = getNextSentenceIndex(); // Seleciona a Next frase com aleatoriedade ponderada
        loadSentence(); // Carrega a Next frase
      }
    }
  });
}

// Função para Check a resposta
function checkAnswer() {
  const userAnswer = document
    .getElementById("answer-input")
    .value.toLowerCase()
    .trim();
  const currentSentence = sentences[currentSentenceIndex];
  const correctAnswer = currentSentence.answer.toLowerCase();

  if (userAnswer === correctAnswer) {
    correctSound.play();
    feedbackMessage.textContent = "🎉 Your answer is correct!";
    feedbackMessage.classList.remove("hidden");
    feedbackMessage.classList.add("text-green-500");
    feedbackMessage.classList.remove("text-red-500");

    // Increment the number of correct answers
    currentSentence.correct += 1;

    checkButton.classList.add("hidden");
    nextButton.classList.remove("hidden");
  } else {
    incorrectSound.play();
    feedbackMessage.textContent =
      "❌ Oops! Try again or check the correct answer.";
    feedbackMessage.classList.remove("hidden");
    feedbackMessage.classList.add("text-red-500");
    feedbackMessage.classList.remove("text-green-500");

    // Increment the number of incorrect attempts
    currentSentence.errors += 1;

    showAnswerButton.classList.remove("hidden");
  }
}

// Evento do botão de Check resposta
checkButton.addEventListener("click", checkAnswer);

// Evento do botão Next frase
nextButton.addEventListener("click", () => {
  currentSentenceIndex = getNextSentenceIndex(); // Seleciona a Next frase com aleatoriedade ponderada
  loadSentence();
});

function showAnswer() {
  const currentSentence = sentences[currentSentenceIndex];
  input = document.getElementById("answer-input");
  input.value = currentSentence.answer;
  input.style.width =
    Math.min(currentSentence.answer.length + 1, 15) + "ch";

  // Incrementa o número de vezes que a resposta foi vista
  currentSentence.views += 1;

  showAnswerButton.classList.add("hidden");
}

// Evento para mostrar a resposta
showAnswerButton.addEventListener("click", () => {
  showAnswer();
});

// Função de falar usada anteriormente
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1; // Velocidade da fala
  speech.pitch = 1; // Tom da voz
  speech.volume = 1; // Volume (0 a 1)

  // Seleciona a voz mais natural
  const voices = speechSynthesis.getVoices();
  const naturalVoice = voices.find((voice) =>
    voice.name.includes("Google US English"),
  ); // Altere o nome conforme necessário

  if (naturalVoice) {
    speech.voice = naturalVoice;
  }

  window.speechSynthesis.speak(speech);
}

// Função adaptada para usar a mesma voz ao falar uma frase
function speakSentence(sentence) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US"; // Configura o idioma para inglês
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Seleciona a voz mais natural, como na função speak
    const voices = speechSynthesis.getVoices();
    const naturalVoice = voices.find((voice) =>
      voice.name.includes("Google US English"),
    ); // Altere conforme necessário

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    console.log("Seu navegador não suporta Text-to-Speech.");
  }
}
// speakSentence("Welcome langmentor AI");

// Inicializar o jogo carregando a primeira frase
loadSentence();
