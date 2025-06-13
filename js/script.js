document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // DEKLARASI ELEMEN HTML
    // =================================================================
    const form = document.getElementById('prompt-form');
    const generateBtn = document.getElementById('generate-btn');
    const promptIdOutput = document.getElementById('prompt-id');
    const promptEnOutput = document.getElementById('prompt-en');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const copyEnBtn = document.getElementById('copy-en-btn');

    const addCharacterBtn = document.getElementById('add-character-btn');
    const characterTabsContainer = document.getElementById('character-tabs');

    const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

    // =================================================================
    // PONDASI DATA (STATE)
    // =================================================================
    let characters = [{
        nama: 'Karakter 1',
        judul: '', karakter: '', suara: '', aksi: '', ekspresi: '',
        latar: '', kamera: 'Tracking Shot (Mengikuti Objek)', pencahayaan: '',
        gayaVisual: 'cinematic realistis', kualitasVisual: 'Resolusi 4K',
        suasana: '', suaraLingkungan: '', dialog: '',
        negatif: 'teks, logo, subtitle, watermark, distorsi wajah, artefak'
    }];

    let activeCharacterIndex = 0;

    // =================================================================
    // FUNGSI-FUNGSI PENGELOLA
    // =================================================================

    function renderTabs() {
        characterTabsContainer.innerHTML = '';
        characters.forEach((char, index) => {
            const tabButton = document.createElement('button');
            tabButton.type = 'button';
            tabButton.className = 'tab-btn';
            if (index === activeCharacterIndex) { tabButton.classList.add('active'); }
            const tabText = document.createTextNode(char.nama || `Karakter ${index + 1}`);
            tabButton.appendChild(tabText);
            tabButton.dataset.index = index;
            tabButton.addEventListener('click', () => { switchCharacter(index); });
            
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = `Hapus ${char.nama}`;
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteCharacter(index);
            });
            tabButton.appendChild(deleteBtn);
            characterTabsContainer.appendChild(tabButton);
        });
    }

    function switchCharacter(index) {
        saveCurrentCharacterData();
        activeCharacterIndex = index;
        loadCharacterData(index);
        renderTabs();
    }
    
    function deleteCharacter(index) {
        const charNameToDelete = characters[index].nama || `Karakter ${index + 1}`;
        if (confirm(`Anda yakin ingin menghapus "${charNameToDelete}"?`)) {
            characters.splice(index, 1);
            if (activeCharacterIndex >= index) {
                activeCharacterIndex = Math.max(0, activeCharacterIndex - 1);
            }
            if (characters.length === 0) {
                addCharacter(true);
            } else {
                switchCharacter(activeCharacterIndex);
            }
        }
    }

    function loadCharacterData(index) {
        if (index < 0 || index >= characters.length) return;
        const charData = characters[index];
        Object.keys(charData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase());
            if (element) {
                if (element.tagName === 'SELECT') {
                    for (let i = 0; i < element.options.length; i++) {
                        if (element.options[i].text === charData[key]) { element.selectedIndex = i; break; }
                    }
                } else { element.value = charData[key] || ''; }
            }
        });
    }

    function saveCurrentCharacterData() {
        if (activeCharacterIndex < 0 || activeCharacterIndex >= characters.length) return;
        const charData = characters[activeCharacterIndex];
        Object.keys(charData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase());
            if (element) {
                if (element.tagName === 'SELECT') {
                    charData[key] = element.options[element.selectedIndex].text;
                } else { charData[key] = element.value; }
            }
        });
    }

    function addCharacter(isFirst = false) {
        if (!isFirst && characters.length > 0) saveCurrentCharacterData();
        const newIndex = characters.length;
        const previousCharacter = characters[activeCharacterIndex];
        characters.push({
            nama: `Karakter ${newIndex + 1}`,
            judul: isFirst ? '' : previousCharacter.judul,
            latar: isFirst ? '' : previousCharacter.latar,
            suasana: isFirst ? '' : previousCharacter.suasana,
            kamera: 'Tracking Shot (Mengikuti Objek)',
            pencahayaan: isFirst ? '' : previousCharacter.pencahayaan,
            gayaVisual: isFirst ? 'cinematic realistis' : previousCharacter.gayaVisual,
            kualitasVisual: isFirst ? 'Resolusi 4K' : previousCharacter.kualitasVisual,
            suaraLingkungan: '',
            negatif: isFirst ? 'teks, logo, subtitle' : previousCharacter.negatif,
            karakter: '', suara: '', aksi: '', ekspresi: '', dialog: ''
        });
        switchCharacter(newIndex);
    }

    // =================================================================
    // EVENT LISTENERS DAN INISIALISASI
    // =================================================================

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveCurrentCharacterData(); // Simpan karakter terakhir yang diedit
        generateBtn.textContent = 'Membuat Prompt...';
        generateBtn.disabled = true;

        // **PERUBAHAN KUNCI 1: Mengirim seluruh array 'characters'**
        const { promptID, promptEN } = await generatePrompts(characters);

        promptIdOutput.value = promptID;
        promptEnOutput.innerHTML = promptEN.replace(/\n/g, '<br>');
        generateBtn.textContent = 'Buat Prompt';
        generateBtn.disabled = false;
    });

    addCharacterBtn.addEventListener('click', () => addCharacter(false));

    function initialize() {
        if (characters.length === 0) {
            addCharacter(true);
        } else {
            loadCharacterData(activeCharacterIndex);
            renderTabs();
        }
    }
    initialize();

    // =================================================================
    // FUNGSI-FUNGSI LAINNYA (HELPER FUNCTIONS)
    // =================================================================

    // **PERUBAHAN KUNCI 2: Mengubah total isi fungsi ini**
    async function generatePrompts(allCharacters) {
        if (allCharacters.length === 0) {
            return { promptID: "Tidak ada karakter untuk dibuatkan prompt.", promptEN: "No characters to generate a prompt for." };
        }

        // Ambil data umum adegan (dari karakter pertama sebagai acuan)
        const sceneData = allCharacters[0];

        // Gabungkan detail SEMUA karakter menjadi satu blok teks
        const characterDetails = allCharacters.map(char => {
            return `**[Karakter: ${char.nama}]**
- Deskripsi: ${char.karakter || '(tidak ada deskripsi)'}
- Suara: ${char.suara || '(tidak ada detail suara)'}
- Aksi: ${char.aksi || '(tidak ada aksi)'}
- Ekspresi: ${char.ekspresi || '(tidak ada ekspresi)'}
- Dialog: ${char.dialog || '(tidak ada dialog)'}`;
        }).join('\n\n'); // Beri jarak antar blok karakter

        // Susun prompt akhir dengan format baru
        const promptID =
`**[Judul Adegan]**
${sceneData.judul}

**[INFORMASI KARAKTER DALAM ADEGAN]**
${characterDetails}

**[Latar & Suasana]**
${sceneData.latar}. ${sceneData.suasana}.

**[Detail Visual & Sinematografi]**
Gerakan Kamera: ${sceneData.kamera}.
Pencahayaan: ${sceneData.pencahayaan}.
Gaya Visual: ${sceneData.gayaVisual}, ${sceneData.kualitasVisual}.

**[Audio]**
Suara Lingkungan: ${sceneData.suaraLingkungan}

**[Negative Prompt]**
${sceneData.negatif}`;

        // Logika terjemahan kita sederhanakan dulu untuk fokus pada fungsionalitas utama
        const judulEn = await translateText(sceneData.judul, 'en', 'id');
        const promptEN = `**[Scene Title]**\n${judulEn}\n\n(Full English prompt generation for multiple characters is the next step.)`;

        return { promptID, promptEN };
    }

    function extractDialog(dialogInput) {
        if (!dialogInput) return '';
        const match = dialogInput.match(/"(.*?)"/);
        return match ? `DIALOG in Indonesian: Character says: "${match[1]}"` : dialogInput;
    }

    async function translateText(text, targetLang = 'en', sourceLang = 'id') {
        if (!text) return "";
        const url = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`MyMemory API error! status: ${response.status}`);
            const result = await response.json();
            if (result.responseStatus !== 200) throw new Error(`MyMemory API error! message: ${result.responseDetails}`);
            return result.responseData.translatedText;
        } catch (error) {
            console.error('Translation failed:', error);
            return `[Translation Error] ${text}`;
        }
    }
    
    function setupCopyButton(button, sourceElement) {
        button.addEventListener('click', () => {
            const textToCopy = sourceElement.isContentEditable || sourceElement.tagName === 'TEXTAREA' || sourceElement.tagName === 'INPUT' ? sourceElement.value : sourceElement.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Disalin!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    setupCopyButton(copyIdBtn, promptIdOutput);
    setupCopyButton(copyEnBtn, promptEnOutput);
});
