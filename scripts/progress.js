// =================================================================
// LOCAL STORAGE & PROGRESS MANAGEMENT
// =================================================================

// Initialize user progress in localStorage
if (!localStorage.getItem('langmentor_progress')) {
    localStorage.setItem('langmentor_progress', JSON.stringify({
        totalPoints: 0,
        dayStreak: 0,
        lastStudyDate: null,
        wordsLearned: [],
        readWordsLearned: [],
        totalCorrect: 0,
        totalErrors: 0,
        nativeLanguage: 'pt' // Default to Portuguese
    }));
}

// Get current progress
function getProgress() {
    return JSON.parse(localStorage.getItem('langmentor_progress'));
}

// Save progress
function saveProgress(progress) {
    localStorage.setItem('langmentor_progress', JSON.stringify(progress));
}

// Update day streak
function updateDayStreak() {
    const progress = getProgress();
    const today = new Date().toDateString();
    
    if (progress.lastStudyDate !== today) {
        const lastDate = progress.lastStudyDate ? new Date(progress.lastStudyDate) : null;
        const todayDate = new Date(today);
        
        if (!lastDate) {
            // First time studying
            progress.dayStreak = 1;
        } else if ((todayDate - lastDate) / (1000 * 60 * 60 * 24) === 1) {
            // Consecutive day
            progress.dayStreak++;
        } else if ((todayDate - lastDate) / (1000 * 60 * 60 * 24) > 1) {
            // Streak broken
            progress.dayStreak = 1;
        }
        
        progress.lastStudyDate = today;
        saveProgress(progress);
    }
}

// Add points (positive for correct, negative for errors)
function addPoints(points) {
    const progress = getProgress();
    progress.totalPoints = Math.max(0, progress.totalPoints + points);
    saveProgress(progress);
    updateUI();
}

// Add word to learned list (for sentence game)
function addWordLearned(sentence, word) {
    const progress = getProgress();
    const wordEntry = { 
        sentence, 
        word, 
        date: new Date().toISOString() 
    };
    
    // Check if sentence already exists
    const exists = progress.wordsLearned.find(w => w.sentence === sentence);
    if (!exists) {
        progress.wordsLearned.push(wordEntry);
        saveProgress(progress);
    } else {
        // Update the date if sentence already exists
        const existingEntry = progress.wordsLearned.find(w => w.sentence === sentence);
        existingEntry.date = new Date().toISOString();
        saveProgress(progress);
    }
}

// Add word to read learned list (for read game)
function addReadWordLearned(sentence, word) {
    const progress = getProgress();
    const wordEntry = { 
        sentence, 
        word, 
        date: new Date().toISOString() 
    };
    
    // Check if sentence already exists
    const exists = progress.readWordsLearned.find(w => w.sentence === sentence);
    if (!exists) {
        progress.readWordsLearned.push(wordEntry);
        saveProgress(progress);
    } else {
        // Update the date if sentence already exists
        const existingEntry = progress.readWordsLearned.find(w => w.sentence === sentence);
        existingEntry.date = new Date().toISOString();
        saveProgress(progress);
    }
}

    // Update UI with current progress
function updateUI() {
    const progress = getProgress();
    
    // Update score in nav
    const userScore = document.getElementById('user-score');
    if (userScore) {
        userScore.textContent = progress.totalPoints;
    }
    
    // Update profile stats
    const wordsLearnedCount = document.getElementById('words-learned-count');
    const dayStreakCount = document.getElementById('day-streak-count');
    const totalPointsCount = document.getElementById('total-points-count');
    
    if (wordsLearnedCount) wordsLearnedCount.textContent = progress.wordsLearned.length + progress.readWordsLearned.length;
    if (dayStreakCount) dayStreakCount.textContent = progress.dayStreak;
    if (totalPointsCount) totalPointsCount.textContent = progress.totalPoints;
    
    // Update words learned list
    updateWordsList();
    updateReadWordsList();
}

// Update words learned list in profile (sentence game)
function updateWordsList() {
    const progress = getProgress();
    const wordsList = document.getElementById('words-list');
    const noWordsMessage = document.getElementById('no-words-message');
    
    if (!wordsList || !noWordsMessage) return;
    
    if (progress.wordsLearned.length === 0) {
        wordsList.innerHTML = '';
        noWordsMessage.classList.remove('hidden');
    } else {
        noWordsMessage.classList.add('hidden');
        
        const wordElements = [];
        
        for (const word of progress.wordsLearned.slice(-10).reverse()) {
            // Show original English sentence with green answer
            const originalSentence = word.sentence.replace('____', `<span class="text-green-500 font-bold">${word.word}</span>`);
            
            wordElements.push(`
                <div class="bg-background p-3 rounded-lg">
                    <div class="text-sm text-text_dark mb-1">${originalSentence}</div>
                    <div class="text-xs text-text_light mt-1">${new Date(word.date).toLocaleDateString()}</div>
                </div>
            `);
        }
        
        wordsList.innerHTML = wordElements.join('');
    }
}

// Update read words learned list in profile (read game)
function updateReadWordsList() {
    const progress = getProgress();
    const readWordsList = document.getElementById('read-words-list');
    const noReadWordsMessage = document.getElementById('no-read-words-message');
    
    if (!readWordsList || !noReadWordsMessage) return;
    
    if (progress.readWordsLearned.length === 0) {
        readWordsList.innerHTML = '';
        noReadWordsMessage.classList.remove('hidden');
    } else {
        noReadWordsMessage.classList.add('hidden');
        readWordsList.innerHTML = progress.readWordsLearned
            .slice(-10) // Show last 10 words
            .reverse() // Most recent first
            .map(word => `
                <div class="bg-background p-3 rounded-lg">
                    <div class="text-sm text-text_dark mb-1">${word.sentence}</div>
                    <div class="text-xs text-text_light">${word.word}</div>
                    <div class="text-xs text-text_light mt-1">${new Date(word.date).toLocaleDateString()}</div>
                </div>
            `).join('');
    }
}

// Get user's native language
function getNativeLanguage() {
    const progress = getProgress();
    return progress.nativeLanguage || 'pt';
}

// Set user's native language
function setNativeLanguage(language) {
    const progress = getProgress();
    progress.nativeLanguage = language;
    saveProgress(progress);
}

// Clear duplicates function
function clearDuplicates() {
    const progress = getProgress();
    
    // Remove duplicates from wordsLearned
    const uniqueWords = [];
    const seenSentences = new Set();
    
    progress.wordsLearned.forEach(entry => {
        if (!seenSentences.has(entry.sentence)) {
            seenSentences.add(entry.sentence);
            uniqueWords.push(entry);
        }
    });
    
    // Remove duplicates from readWordsLearned
    const uniqueReadWords = [];
    const seenReadSentences = new Set();
    
    progress.readWordsLearned.forEach(entry => {
        if (!seenReadSentences.has(entry.sentence)) {
            seenReadSentences.add(entry.sentence);
            uniqueReadWords.push(entry);
        }
    });
    
    progress.wordsLearned = uniqueWords;
    progress.readWordsLearned = uniqueReadWords;
    
    saveProgress(progress);
}

// Expose functions globally for use in other modules
window.langmentorProgress = {
    getProgress,
    saveProgress,
    updateDayStreak,
    addPoints,
    addWordLearned,
    addReadWordLearned,
    updateUI,
    clearDuplicates,
    getNativeLanguage,
    setNativeLanguage
}; 