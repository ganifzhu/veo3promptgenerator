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
        judul: '',
        karakter: '',
        suara: '',
        aksi: '',
        ekspresi: '',
        latar: '',
        kamera: 'Tracking Shot (Mengikuti Objek)',
        pencahayaan: '',
        gayaVisual: 'cinematic realistis',
        kualitasVisual: 'Resolusi 4K',
        suasana: '',
        suaraLingkungan: '',
        dialog: '',
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
            if (index === activeCharacterIndex) {
                tabButton.classList.add('active');
            }
            const tabText = document.createTextNode(char.nama || `Karakter ${index + 1}`);
            tabButton.appendChild(tabText);
            tabButton.dataset.index = index;
            tabButton.addEventListener('click', () => {
                switchCharacter(index);
            });
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
        const allKeys = Object.keys(charData);
        allKeys.forEach(key => {
            const elementId = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            const element = document.getElementById(elementId);
            if (element) {
                if (element.tagName === 'SELECT') {
                    for (let i = 0; i < element.options.length; i++) {
                        if (element.options[i].text === charData[key]) {
                            element.selectedIndex = i;
                            break;
                        }
                    }
                } else {
                    element.value = charData[key] || '';
                }
            }
        });
    }

    function saveCurrentCharacterData() {
        if (activeCharacterIndex < 0 || activeCharacterIndex >= characters.length) return;
        const charData = characters[activeCharacterIndex];
        const allKeys = Object.keys(charData);
        allKeys.forEach(key => {
            const elementId = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            const element = document.getElementById(elementId);
            if (element) {
                if (element.tagName === 'SELECT') {
                    charData[key] = element.options[element.selectedIndex].text;
                } else {
                    charData[key] = element.value;
                }
            }
        });
    }

    function addCharacter(isFirst = false) {
        if (!isFirst && characters.length > 0) {
            saveCurrentCharacterData();
        }
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
        saveCurrentCharacterData();
        generateBtn.textContent = 'Membuat Prompt...';
        generateBtn.disabled = true;
        const currentCharacterData = characters[activeCharacterIndex];
        const { promptID, promptEN } = await generatePrompts(currentCharacterData);
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

    async function generatePrompts(data) {
        const promptID = `**[Judul Adegan]**\n${data.judul}\n\n**[Deskripsi Karakter Utama]**\n${data.karakter}\n\n**[Detail Suara Karakter]**\n${data.suara}\n\n**[Aksi & Ekspresi Karakter]**\n${data.aksi}. <span class="math-inline">\{data\.ekspresi\}\.\\n\\n\*\*\[Latar & Suasana\]\*\*\\n</span>{data.latar}. ${data.suasana}.\n\n**[Detail Visual & Sinematografi]**\nGerakan Kamera: ${data.kamera}.\nPencahayaan: ${data.pencahayaan}.\nGaya Visual: ${data.gayaVisual}, ${data.kualitasVisual}.\n\n**[Audio]**\nSuara Lingkungan: <span class="math-inline">\{data\.suaraLingkungan\}\\n</span>{data.dialog}\n\n**[Negative Prompt]**\n${data.negatif}`;
        const dialogText = extractDialog(data.dialog);
        const t = (text) => translateText(text, 'en', 'id');
        const [judulEn, karakterEn, suaraEn, aksiEn, ekspresiEn, latarEn, suasanaEn, pencahayaanEn, gayaVisualEn, kualitasVisualEn, suaraLingkunganEn, negatifEn] = await Promise.all([t(data.judul), t(data.karakter), t(data.suara.replace('PENTING: Seluruh dialog harus dalam Bahasa Indonesia dengan pengucapan natural dan jelas. Pastikan suara karakter ini konsisten di seluruh video.', '')), t(data.aksi), t(data.ekspresi), t(data.latar), t(data.suasana), t(data.pencahayaan), t(data.gayaVisual), t(data.kualitasVisual), t(data.suaraLingkungan.replace('SOUND:', '')), t(data.negatif.replace('Hindari:', ''))]);
        const cameraMovementEn = data.kamera.match(/\(([^)]+)\)/) ? data.kamera.match(/\(([^)]+)\)/)[1] : data.kamera;
        const promptEN = `**[Scene Title]**\n${judulEn}\n\n**[Main Character Description]**\n${karakterEn}\n\n**[Character Voice Details]**\n${suaraEn} IMPORTANT: All dialogue must be in natural and clear Indonesian. Ensure this character's voice is consistent throughout the video.\n\n**[Character Action & Expression]**\n${aksiEn}. <span class="math-inline">\{ekspresiEn\}\.\\n\\n\*\*\[Setting & Atmosphere\]\*\*\\n</span>{latarEn}. ${suasanaEn}.\n\n**[Visual & Cinematography Details]**\nCamera Movement: ${cameraMovementEn}.\nLighting: ${pencahayaanEn}.\nVisual Style: ${gayaVisualEn}, ${kualitasVisualEn}.\n\n**[Audio]**\nAmbient Sound: SOUND: <span class="math-inline">\{suaraLingkunganEn\}\\n</span>{dialogText}\n\n**[Negative Prompt]**\nAvoid: ${negatifEn}`;
        return { promptID, promptEN };
    }

    function extractDialog(dialogInput) {
        const match = dialogInput.match(/"(.*?)"/);
        return match ? `DIALOG in Indonesian: Character says: "${match[1]}"` : dialogInput;
    }

    async function translateText(text, targetLang = 'en', sourceLang = 'id') {
        if (!text) return "";
        const url = `<span class="math-inline">\{MYMEMORY\_API\_URL\}?q\=</span>{encodeURIComponent(text)}&langpair=<span class="math-inline">\{sourceLang\}\|</span>{targetLang}`;
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
            const textToCopy = sourceElement.isContentEditable || sourceElement.tagName === 'TEXTAREA' || sourceElement.tagName === 'INPUT
});
