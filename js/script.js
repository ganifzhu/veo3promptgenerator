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
    // STRUKTUR DATA BARU (STATE)
    // =================================================================
    // Data Adegan (hanya ada satu objek) - Dikosongkan saat mulai
    let sceneData = {
        judul: '',
        latar: '',
        suasana: '',
        kamera: 'Tracking Shot (Mengikuti Objek)',
        pencahayaan: '',
        gayaVisual: 'cinematic realistis',
        kualitasVisual: 'Resolusi 4K',
        suaraLingkungan: '',
        negatif: 'teks, logo, subtitle, watermark, distorsi wajah, artefak'
    };

    // Data Karakter (dimulai dengan satu karakter kosong)
    let characters = [{
        nama: 'Karakter 1',
        karakter: '',
        suara: '',
        aksi: '',
        ekspresi: '',
        dialog: ''
    }];

    let activeCharacterIndex = 0;

    // =================================================================
    // FUNGSI-FUNGSI PENGELOLA
    // =================================================================

    function loadSceneData() {
        document.getElementById('judul').value = sceneData.judul;
        document.getElementById('latar').value = sceneData.latar;
        document.getElementById('suasana').value = sceneData.suasana;
        document.getElementById('pencahayaan').value = sceneData.pencahayaan;
        document.getElementById('gaya-visual').value = sceneData.gayaVisual;
        document.getElementById('kualitas-visual').value = sceneData.kualitasVisual;
        document.getElementById('suara-lingkungan').value = sceneData.suaraLingkungan;
        document.getElementById('negatif').value = sceneData.negatif;
        const kameraSelect = document.getElementById('kamera');
        for (let i = 0; i < kameraSelect.options.length; i++) {
            if (kameraSelect.options[i].text === sceneData.kamera) {
                kameraSelect.selectedIndex = i;
                break;
            }
        }
    }

    function saveSceneData() {
        sceneData.judul = document.getElementById('judul').value;
        sceneData.latar = document.getElementById('latar').value;
        sceneData.suasana = document.getElementById('suasana').value;
        sceneData.pencahayaan = document.getElementById('pencahayaan').value;
        sceneData.gayaVisual = document.getElementById('gaya-visual').value;
        sceneData.kualitasVisual = document.getElementById('kualitas-visual').value;
        sceneData.suaraLingkungan = document.getElementById('suara-lingkungan').value;
        sceneData.negatif = document.getElementById('negatif').value;
        const kameraSelect = document.getElementById('kamera');
        sceneData.kamera = kameraSelect.options[kameraSelect.selectedIndex].text;
    }

    function loadCharacterData(index) {
        if (index < 0 || index >= characters.length) return;
        const data = characters[index];
        document.getElementById('nama').value = data.nama || '';
        document.getElementById('karakter').value = data.karakter || '';
        document.getElementById('suara').value = data.suara || '';
        document.getElementById('aksi').value = data.aksi || '';
        document.getElementById('ekspresi').value = data.ekspresi || '';
        document.getElementById('dialog').value = data.dialog || '';
    }

    function saveCurrentCharacterData() {
        if (activeCharacterIndex < 0 || activeCharacterIndex >= characters.length) return;
        const data = characters[activeCharacterIndex];
        data.nama = document.getElementById('nama').value;
        data.karakter = document.getElementById('karakter').value;
        data.suara = document.getElementById('suara').value;
        data.aksi = document.getElementById('aksi').value;
        data.ekspresi = document.getElementById('ekspresi').value;
        data.dialog = document.getElementById('dialog').value;
    }
    
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
                addCharacter();
            } else {
                switchCharacter(activeCharacterIndex);
            }
        }
    }

    function addCharacter() {
        if (characters.length > 0) saveCurrentCharacterData();
        const newIndex = characters.length;
        characters.push({
            nama: `Karakter ${newIndex + 1}`, karakter: '', suara: '', aksi: '', ekspresi: '', dialog: ''
        });
        switchCharacter(newIndex);
    }

    // =================================================================
    // EVENT LISTENERS DAN INISIALISASI
    // =================================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveCurrentCharacterData();
        saveSceneData(); // Simpan juga data adegan terakhir
        
        generateBtn.textContent = 'Membuat Prompt...';
        generateBtn.disabled = true;

        const { promptID, promptEN } = await generatePrompts(sceneData, characters);

        promptIdOutput.value = promptID;
        promptEnOutput.innerHTML = promptEN.replace(/\n/g, '<br>');
        generateBtn.textContent = 'Buat Prompt Gabungan';
        generateBtn.disabled = false;
    });

    addCharacterBtn.addEventListener('click', addCharacter);

    function initialize() {
        loadSceneData();
        loadCharacterData(activeCharacterIndex);
        renderTabs();
    }
    initialize();

    // =================================================================
    // FUNGSI GENERATE PROMPT & HELPERS
    // =================================================================
    async function generatePrompts(currentSceneData, allCharacters) {
        if (allCharacters.length === 0) {
            return { promptID: "Tidak ada karakter untuk dibuatkan prompt.", promptEN: "No characters to generate a prompt for." };
        }

        const characterDetails = allCharacters.map(char => {
            return `**[Karakter: ${char.nama}]**
- Deskripsi: ${char.karakter || '(tidak ada deskripsi)'}
- Suara: ${char.suara || '(tidak ada detail suara)'}
- Aksi: ${char.aksi || '(tidak ada aksi)'}
- Ekspresi: ${char.ekspresi || '(tidak ada ekspresi)'}
- Dialog: ${char.dialog || '(tidak ada dialog)'}`;
        }).join('\n\n');

        const promptID = `**[Judul Adegan]**\n${currentSceneData.judul}\n\n**[INFORMASI KARAKTER DALAM ADEGAN]**\n${characterDetails}\n\n**[Latar & Suasana]**\n${currentSceneData.latar}. ${currentSceneData.suasana}.\n\n**[Detail Visual & Sinematografi]**\nGerakan Kamera: ${currentSceneData.kamera}.\nPencahayaan: ${currentSceneData.pencahayaan}.\nGaya Visual: ${currentSceneData.gayaVisual}, ${currentSceneData.kualitasVisual}.\n\n**[Audio]**\nSuara Lingkungan: ${currentSceneData.suaraLingkungan}\n\n**[Negative Prompt]**\n${currentSceneData.negatif}`;
        
        const judulEn = await translateText(currentSceneData.judul, 'en', 'id');
        const promptEN = `**[Scene Title]**\n${judulEn}\n\n(Full English prompt generation for multiple characters can be developed next.)`;

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
