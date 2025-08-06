// Auto-translation system using Google Translate API
class AutoTranslator {
    constructor() {
        this.cache = new Map();
        this.supportedLanguages = {
            'pt': 'Portuguese',
            'es': 'Spanish', 
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'en': 'English'
        };
    }

    // Translate text using Google Translate API
    async translateText(text, targetLanguage) {
        const cacheKey = `${text}_${targetLanguage}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Using Google Translate API (free tier)
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data[0] && data[0][0]) {
                const translation = data[0][0][0];
                this.cache.set(cacheKey, translation);
                return translation;
            }
            
            return text; // Fallback to original text
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback to original text
        }
    }

    // Translate a sentence and highlight the answer word
    async translateSentence(sentence, answer, targetLanguage) {
        try {
            // Translate the complete sentence
            const translatedSentence = await this.translateText(sentence, targetLanguage);
            
            // Translate the answer word separately
            const translatedAnswer = await this.translateText(answer, targetLanguage);
            
            // Replace ____ with the translated answer in green
            const sentenceWithAnswer = translatedSentence.replace(
                '____',
                `<span class="text-green-500 font-bold">${translatedAnswer}</span>`
            );
            
            return sentenceWithAnswer;
        } catch (error) {
            console.error('Sentence translation error:', error);
            return sentence; // Fallback to original sentence
        }
    }

    // Get language name from code
    getLanguageName(code) {
        return this.supportedLanguages[code] || 'Portuguese';
    }

    // Get language code from name
    getLanguageCode(name) {
        for (const [code, langName] of Object.entries(this.supportedLanguages)) {
            if (langName === name) return code;
        }
        return 'pt'; // Default to Portuguese
    }
}

// Create global translator instance
window.autoTranslator = new AutoTranslator(); 