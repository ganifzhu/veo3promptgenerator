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
    let sceneData = {
        judul: '', latar: '', suasana: '', kamera: 'Tracking Shot (Mengikuti Objek)',
        pencahayaan: '', gayaVisual: 'cinematic realistis', kualitasVisual: 'Resolusi 4K',
        suaraLingkungan: '', negatif: 'teks, logo, subtitle, watermark, distorsi wajah, artefak'
    };

    let characters = [{
        nama: 'Karakter 1', karakter: '', suara: '', aksi: '', ekspresi: '', dialog: ''
    }];

    let activeCharacterIndex = 0;

    const sceneFieldIds = ['judul', 'latar', 'suasana', 'kamera', 'pencahayaan', 'gaya-visual', 'kualitas-visual', 'suara-lingkungan', 'negatif'];
    const charFieldIds = ['nama', 'karakter', 'suara', 'aksi', 'ekspresi', 'dialog'];

    // =================================================================
    // FUNGSI-FUNGSI PENGELOLA
    // =================================================================

    function loadSceneData() {
        sceneFieldIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
            if (element) {
                if(element.tagName === 'SELECT') {
                     for (let i = 0; i < element.options.length; i++) {
                        if (element.options[i].text === sceneData[key]) { element.selectedIndex = i; break; }
                    }
                } else { element.value = sceneData[key]; }
            }
        });
    }

    function saveSceneData() {
        sceneFieldIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
             if (element) {
                if(element.tagName === 'SELECT') {
                    sceneData[key] = element.options[element.selectedIndex].text;
                } else { sceneData[key] = element.value; }
            }
        });
    }

    function loadCharacterData(index) {
        if (index < 0 || index >= characters.length) return;
        const data = characters[index];
        charFieldIds.forEach(id => {
            const element = document.getElementById(id);
            if(element) element.value = data[id] || '';
        });
    }

    function saveCurrentCharacterData() {
        if (activeCharacterIndex < 0 || activeCharacterIndex >= characters.length) return;
        const data = characters[activeCharacterIndex];
        charFieldIds.forEach(id => {
            const element = document.getElementById(id);
            if(element) data[id] = element.value;
        });
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
        const previousCharacter = characters[activeCharacterIndex];
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
        saveSceneData();
        generateBtn.textContent = 'Menerjemahkan & Membuat Prompt...';
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
    // FUNGSI GENERATE PROMPT & HELPERS (DENGAN LOGIKA TRANSLATE PENUH)
    // =================================================================
    async function generatePrompts(currentSceneData, allCharacters) {
        if (allCharacters.length === 0) {
            return { promptID: "...", promptEN: "..." };
        }

        // --- PROMPT BAHASA INDONESIA (TIDAK BERUBAH) ---
        const characterDetailsID = allCharacters.map(char => {
            return `**[Karakter: ${char.nama}]**\n- Deskripsi: ${char.karakter || '(...)'}\n- Suara: ${char.suara || '(...)'}\n- Aksi: ${char.aksi || '(...)'}\n- Ekspresi: ${char.ekspresi || '(...)'}\n- Dialog: ${char.dialog || '(...)'}`;
        }).join('\n\n');
        const promptID = `**[Judul Adegan]**\n${currentSceneData.judul}\n\n**[INFORMASI KARAKTER DALAM ADEGAN]**\n${characterDetailsID}\n\n**[Latar & Suasana]**\n${currentSceneData.latar}. ${currentSceneData.suasana}.\n\n**[Detail Visual & Sinematografi]**\nGerakan Kamera: ${currentSceneData.kamera}.\nPencahayaan: ${currentSceneData.pencahayaan}.\nGaya Visual: ${currentSceneData.gayaVisual}, ${currentSceneData.kualitasVisual}.\n\n**[Audio]**\nSuara Lingkungan: ${currentSceneData.suaraLingkungan}\n\n**[Negative Prompt]**\n${currentSceneData.negatif}`;

        // --- PROMPT BAHASA INGGRIS (LOGIKA BARU) ---
        const t = (text) => translateText(text, 'en', 'id');

        // 1. Terjemahkan semua data adegan secara bersamaan
        const [
            judulEn, latarEn, suasanaEn, pencahayaanEn, 
            gayaVisualEn, kualitasVisualEn, suaraLingkunganEn, negatifEn
        ] = await Promise.all([
            t(currentSceneData.judul), t(currentSceneData.latar), t(currentSceneData.suasana), 
            t(currentSceneData.pencahayaan), t(currentSceneData.gayaVisual), t(currentSceneData.kualitasVisual), 
            t(currentSceneData.suaraLingkungan.replace('SOUND:', '')), t(currentSceneData.negatif.replace('Hindari:', ''))
        ]);
        const cameraMovementEn = currentSceneData.kamera.match(/\(([^)]+)\)/) ? currentSceneData.kamera.match(/\(([^)]+)\)/)[1] : currentSceneData.kamera;

        // 2. Terjemahkan semua data karakter secara bersamaan
        const translatedCharacters = await Promise.all(allCharacters.map(async (char) => {
            const [karakterEn, suaraEn, aksiEn, ekspresiEn] = await Promise.all([
                t(char.karakter), t(char.suara), t(char.aksi), t(char.ekspresi)
            ]);
            return {
                nama: char.nama, // Nama tidak perlu diterjemahkan
                deskripsi: karakterEn,
                suara: suaraEn,
                aksi: aksiEn,
                ekspresi: ekspresiEn,
                dialog: char.dialog // Dialog tidak diterjemahkan sesuai aturan
            };
        }));

        // 3. Susun kembali detail karakter yang sudah diterjemahkan
        const characterDetailsEN = translatedCharacters.map(char => {
            return `**[Character: ${char.nama}]**\n- Description: ${char.deskripsi || '(no description)'}\n- Voice: ${char.suara || '(no voice details)'}\n- Action: ${char.aksi || '(no action)'}\n- Expression: ${char.ekspresi || '(no expression)'}\n- Dialogue: ${extractDialog(char.dialog) || '(no dialogue)'}`;
        }).join('\n\n');

        // 4. Susun prompt Bahasa Inggris final
        const promptEN = `**[Scene Title]**\n${judulEn}\n\n**[CHARACTER INFORMATION IN SCENE]**\n${characterDetailsEN}\n\n**[Setting & Atmosphere]**\n${latarEn}. ${suasanaEn}.\n\n**[Visual & Cinematography Details]**\nCamera Movement: ${cameraMovementEn}.\nLighting: ${pencahayaanEn}.\nVisual Style: ${gayaVisualEn}, ${kualitasVisualEn}.\n\n**[Audio]**\nAmbient Sound: SOUND: ${suaraLingkunganEn}\n\n**[Negative Prompt]**\nAvoid: ${negatifEn}`;
        
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
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const result = await response.json();
            return result.responseData.translatedText;
        } catch (error) {
            console.error('Translation failed:', error);
            return `[Translation Error]`;
        }
    }
    
    function setupCopyButton(button, sourceElement) {
        button.addEventListener('click', () => {
            const textToCopy = sourceElement.isContentEditable || sourceElement.tagName === 'TEXTAREA' || sourceElement.tagName === 'INPUT' ? sourceElement.value : sourceElement.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Disalin!';
                setTimeout(() => { button.textContent = originalText; }, 2000);
            }).catch(err => { console.error('Failed to copy text: ', err); });
        });
    }

    setupCopyButton(copyIdBtn, promptIdOutput);
    setupCopyButton(copyEnBtn, promptEnOutput);
});
