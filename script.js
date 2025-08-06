// Meitei Mayek to Roman Transliterator Class
class MeiteiToRomanTransliterator {
    constructor(options = {}) {
        this.options = {
            scheme: options.scheme || 'practical',
            showTones: options.showTones || false,
            finalSchwaOff: options.finalSchwaOff !== false,
            keepPunct: options.keepPunct !== false,
            includeExt: options.includeExt !== false
        };

        this.consonants = {
            'ꯀ': 'k', 'ꯈ': 'kh', 'ꯒ': 'g', 'ꯘ': 'gh', 'ꯉ': 'ng',
            'ꯆ': 'ch', 'ꫢ': 'ch', 'ꯖ': 'j', 'ꯓ': 'jh', 'ꫣ': 'ny',
            'ꫤ': 'ṭ', 'ꫥ': 'ṭh', 'ꫦ': 'ḍ', 'ꫧ': 'ḍh', 'ꫨ': 'ṇ',
            'ꯇ': 't', 'ꯊ': 'th', 'ꯗ': 'd', 'ꯙ': 'dh', 'ꯅ': 'n',
            'ꯄ': 'p', 'ꯐ': 'ph', 'ꯕ': 'b', 'ꯚ': 'bh', 'ꯃ': 'm',
            'ꯌ': 'y', 'ꯔ': 'r', 'ꯂ': 'l', 'ꯋ': 'w', 'ꫩ': 'ś',
            'ꫪ': 'ṣ', 'ꯁ': 's', 'ꯍ': 'h'
        };

        this.finals = {
            'ꯛ': 'k', 'ꯜ': 'l', 'ꯝ': 'm', 'ꯞ': 'p', 
            'ꯟ': 'n', 'ꯠ': 't', 'ꯡ': 'ng', 'ꯢ': 'i'
        };

        this.independentVowels = {
            'ꯑ': 'a', 'ꯏ': 'i', 'ꯎ': 'u', 'ꫠ': 'e', 'ꫡ': 'o'
        };

        this.vowelSigns = {
            'ꯥ': { practical: 'aa', academic: 'ā' },
            'ꯤ': { practical: 'i', academic: 'i' },
            'ꯨ': { practical: 'u', academic: 'u' },
            'ꯦ': { practical: 'e', academic: 'e' },
            'ꯣ': { practical: 'o', academic: 'o' },
            'ꯩ': { practical: 'ei', academic: 'ai' },
            'ꯧ': { practical: 'ou', academic: 'au' },
            'ꯪ': { practical: 'ang', academic: 'aṃ' },
            'ꫫ': { practical: 'ii', academic: 'ī' },
            'ꫬ': { practical: 'uu', academic: 'ū' },
            'ꫭ': { practical: 'aai', academic: 'āi' },
            'ꫮ': { practical: 'au', academic: 'au' },
            'ꫯ': { practical: 'aau', academic: 'āu' }
        };

        this.digits = {};
        for (let i = 0; i < 10; i++) {
            this.digits[String.fromCharCode(0xABF0 + i)] = i.toString();
        }

        this.punctuation = { '꯫': '.', '꫰': ',', '꫱': '?' };
        this.special = { 'ꫲ': 'om' };
    }

    mapVowelSigns(signs) {
        let result = '';
        for (let sign of signs) {
            const vowel = this.vowelSigns[sign];
            if (vowel) {
                result += vowel[this.options.scheme] || vowel.practical;
            }
        }
        return result;
    }

    applySchwaRule(roman, isFinal) {
        if (isFinal && this.options.finalSchwaOff && 
            roman.endsWith('a') && roman.length > 1) {
            return roman.slice(0, -1);
        }
        return roman;
    }

    transliterateWord(word) {
        let output = '';
        let i = 0;
        const len = word.length;

        while (i < len) {
            const char = word[i];

            if (this.independentVowels[char]) {
                output += this.independentVowels[char];
                i++;
                continue;
            }

            if (this.digits[char]) {
                output += this.digits[char];
                i++;
                continue;
            }

            if (this.punctuation[char]) {
                if (this.options.keepPunct) {
                    output += this.punctuation[char];
                }
                i++;
                continue;
            }

            if (this.special[char]) {
                output += this.special[char];
                i++;
                continue;
            }

            if (this.finals[char]) {
                output += this.finals[char];
                i++;
                continue;
            }

            if (char === '꯭' || char === '꯬' || char === '꫶') {
                if (char === '꯬' && this.options.showTones) {
                    output += 'ˇ';
                }
                i++;
                continue;
            }

            if (this.consonants[char]) {
                const base = this.consonants[char];
                let vowelPart = '';
                i++;

                // Collect vowel signs
                while (i < len && this.vowelSigns[word[i]]) {
                    vowelPart += word[i];
                    i++;
                }

                const vowelRoman = this.mapVowelSigns(vowelPart);
                const consonantBase = vowelRoman ? base.replace('a', '') : base;
                output += consonantBase + vowelRoman;

                // Handle virama
                if (i < len && word[i] === '꯭') {
                    if (output.endsWith('a')) {
                        output = output.slice(0, -1);
                    }
                    i++;
                }

                // Handle final consonant
                if (i < len && this.finals[word[i]]) {
                    output += this.finals[word[i]];
                    i++;
                }

                // Apply schwa rule at word end
                if (i === len) {
                    output = this.applySchwaRule(output, true);
                }
            } else {
                output += char;
                i++;
            }
        }

        return output;
    }

    transliterate(text) {
        if (!text) return '';
        
        const words = text.split(/(\s+)/);
        return words.map(word => {
            if (!word || /^\s+$/.test(word)) return word;
            return this.transliterateWord(word);
        }).join('');
    }
}

// Bengali to Meitei Mayek Transliterator Class
class BengaliToMeiteiTransliterator {
    constructor() {
        this.mapping = {
            // Consonants
            'ক': 'ꯀ', 'খ': 'ꯈ', 'গ': 'ꯒ', 'ঘ': 'ꯘ', 'ঙ': 'ꯉ',
            'চ': 'ꯆ', 'ছ': 'ꯁ', 'জ': 'ꯖ', 'ঝ': 'ꯓ', 'ঞ': 'ꯅ',
            'ট': 'ꯇ', 'ঠ': 'ꯇ', 'ড': 'ꯗ', 'ঢ': 'ꯙ', 'ণ': 'ꯅ',
            'ত': 'ꯇ', 'থ': 'ꯊ', 'দ': 'ꯗ', 'ধ': 'ꯙ', 'ন': 'ꯅ',
            'প': 'ꯄ', 'ফ': 'ꯐ', 'ব': 'ꯕ', 'ভ': 'ꯚ', 'ম': 'ꯃ',
            'য': 'ꯌ', 'র': 'ꯔ', 'ল': 'ꯂ', 'শ': 'ꯁ', 'ষ': 'ꯁ',
            'স': 'ꯁ', 'হ': 'ꯍ', 'য়': 'ꯌ',

            // Independent vowels
            'অ': 'ꯑ', 'আ': 'ꯑ', 'ই': 'ꯏ', 'ঈ': 'ꯏ', 'উ': 'ꯎ',
            'ঊ': 'ꯎ', 'ঋ': 'ꯔ', 'এ': 'ꯑ', 'ঐ': 'ꯑꯩ', 'ও': 'ꯑꯧ',
            'ঔ': 'ꯑꯧ',

            // Vowel signs
            'া': 'ꯥ', 'ি': 'ꯤ', 'ী': 'ꯤ', 'ু': 'ꯨ', 'ূ': 'ꯨ',
            'ৃ': '꯭', 'ে': 'ꯦ', 'ৈ': 'ꯩ', 'ো': 'ꯧ', 'ৌ': 'ꯧ',

            // Final consonants
            'ক্': 'ꯛ', 'ল্': 'ꯜ', 'ম্': 'ꯝ', 'প্': 'ꯞ',
            'ন্': 'ꯟ', 'ত্': 'ꯠ', 'ঙ্': 'ꯡ', 'ই্': 'ꯢ',

            // Digits
            '০': '꯰', '১': '꯱', '২': '꯲', '৩': '꯳', '৪': '꯴',
            '৫': '꯵', '৬': '꯶', '৭': '꯷', '৮': '꯸', '৯': '꯹'
        };
    }

    transliterate(text) {
        if (!text) return '';
        
        let output = [];
        let i = 0;

        while (i < text.length) {
            const char = text[i];

            if (char.match(/\s/) || '.,!?'.includes(char)) {
                output.push(char);
                i++;
                continue;
            }

            // Handle consonant + vowel sign combinations
            if (i + 1 < text.length && 'ািীুূৃেৈোৌ্'.includes(text[i + 1])) {
                const base = this.mapping[char] || char;
                const matra = this.mapping[text[i + 1]] || text[i + 1];
                output.push(base + matra);
                i += 2;
                continue;
            }

            const mapped = this.mapping[char];
            output.push(mapped || char);
            i++;
        }

        return output.join('');
    }
}

// Application State
let currentMode = 'meitei-to-roman';
let meiteiToRoman = new MeiteiToRomanTransliterator();
let bengaliToMeitei = new BengaliToMeiteiTransliterator();

// DOM Elements
const modeButtons = document.querySelectorAll('.mode-btn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const inputLabel = document.getElementById('inputLabel');
const transliterateBtn = document.getElementById('transliterateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

// Option elements
const showTones = document.getElementById('showTones');
const finalSchwaOff = document.getElementById('finalSchwaOff');
const keepPunct = document.getElementById('keepPunct');
const includeExt = document.getElementById('includeExt');
const schemeSelect = document.getElementById('schemeSelect');

// Event Listeners
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updateUI();
    });
});

// Checkbox functionality
[showTones, finalSchwaOff, keepPunct, includeExt].forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        checkbox.classList.toggle('checked');
        updateTransliteratorOptions();
    });

    // Label click handler
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (label) {
        label.addEventListener('click', (e) => {
            e.preventDefault();
            checkbox.click();
        });
    }
});

schemeSelect.addEventListener('change', updateTransliteratorOptions);

transliterateBtn.addEventListener('click', performTransliteration);
clearBtn.addEventListener('click', clearText);
copyBtn.addEventListener('click', copyOutput);

// Auto-transliterate on input
inputText.addEventListener('input', performTransliteration);

function updateUI() {
    switch (currentMode) {
        case 'meitei-to-roman':
            inputLabel.textContent = 'Meitei Mayek Text:';
            inputText.placeholder = 'Enter Meitei Mayek text...';
            break;
        case 'bengali-to-meitei':
            inputLabel.textContent = 'Bengali Text:';
            inputText.placeholder = 'Enter Bengali text...';
            break;
        case 'bengali-to-roman':
            inputLabel.textContent = 'Bengali Text:';
            inputText.placeholder = 'Enter Bengali text...';
            break;
    }
    performTransliteration();
}

function updateTransliteratorOptions() {
    const options = {
        scheme: schemeSelect.value,
        showTones: showTones.classList.contains('checked'),
        finalSchwaOff: finalSchwaOff.classList.contains('checked'),
        keepPunct: keepPunct.classList.contains('checked'),
        includeExt: includeExt.classList.contains('checked')
    };
    
    meiteiToRoman = new MeiteiToRomanTransliterator(options);
    performTransliteration();
}

function performTransliteration() {
    const input = inputText.value;
    if (!input.trim()) {
        outputText.value = '';
        return;
    }

    try {
        let result = '';
        
        switch (currentMode) {
            case 'meitei-to-roman':
                result = meiteiToRoman.transliterate(input);
                break;
            case 'bengali-to-meitei':
                result = bengaliToMeitei.transliterate(input);
                break;
            case 'bengali-to-roman':
                const meiteiResult = bengaliToMeitei.transliterate(input);
                result = meiteiToRoman.transliterate(meiteiResult);
                break;
        }
        
        outputText.value = result;
    } catch (error) {
        console.error('Transliteration error:', error);
        outputText.value = 'Error in transliteration';
    }
}

function clearText() {
    inputText.value = '';
    outputText.value = '';
    inputText.focus();
}

function copyOutput() {
    outputText.select();
    document.execCommand('copy');
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
    }, 2000);
}

// Initialize
updateTransliteratorOptions();
updateUI();
inputText.focus(); 