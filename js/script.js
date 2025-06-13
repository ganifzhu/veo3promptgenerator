document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // DEKLARASI ELEMEN & KONSTANTA
    // =================================================================
    const form = document.getElementById('prompt-form');
    const generateBtn = document.getElementById('generate-btn');
    const generateAllBtn = document.getElementById('generate-all-btn');
    const promptIdOutput = document.getElementById('prompt-id');
    const promptEnOutput = document.getElementById('prompt-en');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const copyEnBtn = document.getElementById('copy-en-btn');
    const sceneListContainer = document.getElementById('scene-list');
    const addSceneBtn = document.getElementById('add-scene-btn');
    const addCharacterBtn = document.getElementById('add-character-btn');
    const characterTabsContainer = document.getElementById('character-tabs');
    const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

    const LOCAL_STORAGE_KEY = 'veoPromptGeneratorStory';
    const SECRET_KEY = 'KunciRahasiaSuperAman_GantiDenganTeksUnikAnda';
    const translationCache = {};

    // =================================================================
    // STRUKTUR DATA UTAMA (THE STORY)
    // =================================================================
    let story = { scenes: [] };
    let activeSceneIndex = -1;

    // =================================================================
    // FUNGSI SIMPAN & MUAT
    // =================================================================
    function saveStoryToLocalStorage() {
        try {
            if (activeSceneIndex > -1) { saveCurrentSceneData(); }
            const jsonString = JSON.stringify(story);
            const encryptedData = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
            localStorage.setItem(LOCAL_STORAGE_KEY, encryptedData);
            console.log("Proyek disimpan.");
        } catch (error) { console.error("Gagal menyimpan:", error); }
    }

    function loadStoryFromLocalStorage() {
        const encryptedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (encryptedData) {
            try {
                const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
                const decryptedJsonString = bytes.toString(CryptoJS.enc.Utf8);
                if (!decryptedJsonString) { throw new Error("Gagal dekripsi."); }
                story = JSON.parse(decryptedJsonString);
                return true;
            } catch (error) {
                console.error("Gagal memuat:", error);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                return false;
            }
        }
        return false;
    }

    // =================================================================
    // FUNGSI MANAJEMEN ADEGAN
    // =================================================================
    function renderSceneList() {
        sceneListContainer.innerHTML = '';
        story.scenes.forEach((scene, index) => {
            const sceneCard = document.createElement('div');
            sceneCard.className = 'scene-card';
            if (index === activeSceneIndex) { sceneCard.classList.add('active'); }
            sceneCard.dataset.index = index;
            sceneCard.innerHTML = `<h3>${scene.title || `Adegan ${index + 1}`}</h3>`;
            sceneCard.addEventListener('click', () => switchScene(index));
            const deleteSceneBtn = document.createElement('span');
            deleteSceneBtn.className = 'delete-btn';
            deleteSceneBtn.innerHTML = '&times;';
            deleteSceneBtn.title = `Hapus Adegan Ini`;
            deleteSceneBtn.addEventListener('click', (event) => { event.stopPropagation(); deleteScene(index); });
            sceneCard.appendChild(deleteSceneBtn);
            sceneListContainer.appendChild(sceneCard);
        });
    }
    function addScene() {
        if (activeSceneIndex > -1) saveCurrentSceneData();
        const newScene = {
            title: `Adegan ${story.scenes.length + 1}`,
            sceneData: { judul: `Adegan ${story.scenes.length + 1}`, latar: '', suasana: '', kamera: 'Tracking Shot (Mengikuti Objek)', pencahayaan: '', gayaVisual: '', kualitasVisual: '', suaraLingkungan: '', negatif: '' },
            characters: [{ nama: 'Karakter 1', karakter: '', suara: '', aksi: '', ekspresi: '', dialog: '' }],
            activeCharacterIndex: 0
        };
        story.scenes.push(newScene);
        switchScene(story.scenes.length - 1);
    }
    function switchScene(index) {
        if (activeSceneIndex > -1) saveCurrentSceneData();
        activeSceneIndex = index;
        loadSceneData(index);
        renderSceneList();
        saveStoryToLocalStorage();
    }
    function deleteScene(index) {
        const sceneNameToDelete = story.scenes[index].title || `Adegan ${index + 1}`;
        if (confirm(`Anda yakin ingin menghapus "${sceneNameToDelete}"?`)) {
            story.scenes.splice(index, 1);
            if (activeSceneIndex >= index) { activeSceneIndex = Math.max(0, activeSceneIndex - 1); }
            if (story.scenes.length === 0) { addScene(); } else { switchScene(activeSceneIndex); }
        }
    }
    function loadSceneData(index) {
        if (index < 0 || index >= story.scenes.length) return;
        const currentScene = story.scenes[index];
        Object.keys(currentScene.sceneData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase());
            if (element) {
                if (element.tagName === 'SELECT') {
                    for (let i = 0; i < element.options.length; i++) {
                        if (element.options[i].text === currentScene.sceneData[key]) { element.selectedIndex = i; break; }
                    }
                } else { element.value = currentScene.sceneData[key] || ''; }
            }
        });
        renderCharacterTabs();
        loadCharacterData();
    }
    function saveCurrentSceneData() {
        if (activeSceneIndex < 0 || activeSceneIndex >= story.scenes.length) return;
        const currentScene = story.scenes[activeSceneIndex];
        Object.keys(currentScene.sceneData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase());
            if (element) {
                if (element.tagName === 'SELECT') {
                    currentScene.sceneData[key] = element.options[element.selectedIndex].text;
                } else { currentScene.sceneData[key] = element.value; }
            }
        });
        currentScene.title = currentScene.sceneData.judul;
        saveCurrentCharacterData();
    }
    // =================================================================
    // FUNGSI MANAJEMEN KARAKTER
    // =================================================================
    function renderCharacterTabs() {
        characterTabsContainer.innerHTML = '';
        const scene = story.scenes[activeSceneIndex];
        if (!scene) return;
        scene.characters.forEach((char, index) => {
            const tabButton = document.createElement('button');
            tabButton.type = 'button';
            tabButton.className = 'tab-btn';
            if (index === scene.activeCharacterIndex) { tabButton.classList.add('active'); }
            tabButton.textContent = char.nama || `Karakter ${index + 1}`;
            tabButton.dataset.index = index;
            tabButton.addEventListener('click', () => switchCharacter(index));
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = `Hapus ${char.nama}`;
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteCharacter(index); });
            tabButton.appendChild(deleteBtn);
            characterTabsContainer.appendChild(tabButton);
        });
    }
    function switchCharacter(charIndex) {
        saveCurrentCharacterData();
        const scene = story.scenes[activeSceneIndex];
        if (!scene) return;
        scene.activeCharacterIndex = charIndex;
        loadCharacterData();
        renderCharacterTabs();
        saveStoryToLocalStorage();
    }
    function loadCharacterData() {
        const scene = story.scenes[activeSceneIndex];
        if (!scene || scene.activeCharacterIndex < 0 || scene.activeCharacterIndex >= scene.characters.length) return;
        const data = scene.characters[scene.activeCharacterIndex];
        Object.keys(data).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = data[id] || '';
        });
    }
    function saveCurrentCharacterData() {
        const scene = story.scenes[activeSceneIndex];
        if (!scene || scene.activeCharacterIndex < 0 || scene.activeCharacterIndex >= scene.characters.length) return;
        const data = scene.characters[scene.activeCharacterIndex];
        Object.keys(data).forEach(id => {
            const element = document.getElementById(id);
            if (element) data[id] = element.value;
        });
    }
    function addCharacter() {
        const scene = story.scenes[activeSceneIndex];
        if (!scene) return;
        saveCurrentCharacterData();
        const newIndex = scene.characters.length;
        scene.characters.push({ nama: `Karakter ${newIndex + 1}`, karakter: '', suara: '', aksi: '', ekspresi: '', dialog: '' });
        switchCharacter(newIndex);
    }
    function deleteCharacter(charIndex) {
        const scene = story.scenes[activeSceneIndex];
        if (!scene) return;
        if (confirm(`Hapus ${scene.characters[charIndex].nama}?`)) {
            scene.characters.splice(charIndex, 1);
            if (scene.activeCharacterIndex >= charIndex) { scene.activeCharacterIndex = Math.max(0, scene.activeCharacterIndex - 1); }
            if (scene.characters.length === 0) { addCharacter(); } else { switchCharacter(scene.activeCharacterIndex); }
        }
    }
    // =================================================================
    // EVENT LISTENERS & INISIALISASI
    // =================================================================
    addSceneBtn.addEventListener('click', addScene);
    addCharacterBtn.addEventListener('click', addCharacter);
    form.addEventListener('input', saveStoryToLocalStorage);
    window.addEventListener('beforeunload', saveStoryToLocalStorage);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCurrentSceneData();
        const currentScene = story.scenes[activeSceneIndex];
        if (!currentScene) return;
        const promptID = generateIndonesianPrompt(currentScene.sceneData, currentScene.characters);
        promptIdOutput.value = promptID;
        promptEnOutput.innerHTML = '';
    });

    generateAllBtn.addEventListener('click', () => {
        saveCurrentSceneData();
        let fullScriptID = `PROYEK: Naskah Lengkap\n====================\n\n`;
        for (const [index, scene] of story.scenes.entries()) {
            const promptID = generateIndonesianPrompt(scene.sceneData, scene.characters);
            fullScriptID += `--- ADEGAN ${index + 1}: ${scene.title} ---\n\n${promptID}\n\n\n`;
        }
        promptIdOutput.value = fullScriptID;
        promptEnOutput.innerHTML = '';
    });

    translateBtn.addEventListener('click', async () => {
        saveCurrentSceneData();
        translateBtn.textContent = 'Menerjemahkan...';
        translateBtn.disabled = true;
        try {
            let fullScriptEN = `PROJECT: Full Script\n====================\n\n`;
            for (const [index, scene] of story.scenes.entries()) {
                const promptEN = await translateSceneToEnglish(scene.sceneData, scene.characters);
                fullScriptEN += `--- SCENE ${index + 1}: ${scene.title} ---\n\n${promptEN}\n\n\n`;
            }
            promptEnOutput.innerHTML = fullScriptEN.replace(/\n/g, '<br>');
        } catch (error) {
            console.error("Error saat menerjemahkan:", error);
            alert("Gagal menerjemahkan. Coba lagi sesaat.");
        } finally {
            translateBtn.textContent = 'Terjemahkan ke Inggris';
            translateBtn.disabled = false;
        }
    });

    function initialize() {
        if (loadStoryFromLocalStorage() && story.scenes.length > 0) {
            activeSceneIndex = 0;
            loadSceneData(activeSceneIndex);
            renderSceneList();
        } else {
            addScene();
        }
    }
    
    // =================================================================
    // FUNGSI GENERATE PROMPT & HELPERS
    // =================================================================
    function generateIndonesianPrompt(sceneData, allCharacters) {
        const characterDetails = allCharacters.map(char => `**[Karakter: ${char.nama}]**\n- Deskripsi: ${char.karakter||'(...)'}\n- Suara: ${char.suara||'(...)'}\n- Aksi: ${char.aksi||'(...)'}\n- Ekspresi: ${char.ekspresi||'(...)'}\n- Dialog: ${char.dialog||'(...)'}`).join('\n\n');
        return `**[Judul Adegan]**\n${sceneData.judul}\n\n**[INFORMASI KARAKTER DALAM ADEGAN]**\n${characterDetails}\n\n**[Latar & Suasana]**\n${sceneData.latar}. ${sceneData.suasana}.\n\n**[Detail Visual & Sinematografi]**\nGerakan Kamera: ${sceneData.kamera}.\nPencahayaan: ${sceneData.pencahayaan}.\nGaya Visual: ${sceneData.gayaVisual}, ${sceneData.kualitasVisual}.\n\n**[Audio]**\nSuara Lingkungan: ${sceneData.suaraLingkungan}\n\n**[Negative Prompt]**\n${sceneData.negatif}`;
    }

    async function translateSceneToEnglish(sceneData, allCharacters) {
        const t = (text) => translateText(text, 'en', 'id');
        const delay = ms => new Promise(res => setTimeout(res, ms));
        const sceneDataEn = {};
        const sceneKeys = ['judul', 'latar', 'suasana', 'pencahayaan', 'gayaVisual', 'kualitasVisual', 'suaraLingkungan', 'negatif'];
        for (const key of sceneKeys) {
            let textToTranslate = sceneData[key];
            if (key === 'suaraLingkungan') textToTranslate = textToTranslate.replace('SOUND:', '');
            if (key === 'negatif') textToTranslate = textToTranslate.replace('Hindari:', '');
            sceneDataEn[key] = await t(textToTranslate);
            await delay(150);
        }

        const translatedCharacters = [];
        for (const char of allCharacters) {
            const charEn = { nama: char.nama, dialog: char.dialog };
            // KESALAHAN ADA DI SINI, SEHARUSNYA 'deskripsi' BUKAN 'karakter'
            charEn.deskripsi = await t(char.karakter); await delay(150);
            charEn.suara = await t(char.suara); await delay(150);
            charEn.aksi = await t(char.aksi); await delay(150);
            charEn.ekspresi = await t(char.ekspresi); await delay(150);
            translatedCharacters.push(charEn);
        }
        
        const cameraMovementEn = sceneData.kamera.match(/\(([^)]+)\)/) ? sceneData.kamera.match(/\(([^)]+)\)/)[1] : sceneData.kamera;
        const characterDetailsEN = translatedCharacters.map(c=>`**[Character: ${c.nama}]**\n- Description: ${c.deskripsi||'(...)'}\n- Voice: ${c.suara||'(...)'}\n- Action: ${c.aksi||'(...)'}\n- Expression: ${c.ekspresi||'(...)'}\n- Dialogue: ${extractDialog(c.dialog)||'(...)'}`).join('\n\n');
        return `**[Scene Title]**\n${sceneDataEn.judul}\n\n**[CHARACTER INFORMATION IN SCENE]**\n${characterDetailsEN}\n\n**[Setting & Atmosphere]**\n${sceneDataEn.latar}. ${sceneDataEn.suasana}.\n\n**[Visual & Cinematography Details]**\nCamera Movement: ${cameraMovementEn}.\nLighting: ${sceneDataEn.pencahayaan}.\nVisual Style: ${sceneDataEn.gayaVisual}, ${sceneDataEn.kualitasVisual}.\n\n**[Audio]**\nAmbient Sound: SOUND: ${sceneDataEn.suaraLingkungan.trim()}\n\n**[Negative Prompt]**\nAvoid: ${sceneDataEn.negatif.trim()}`;
    }

    async function translateText(text, targetLang = 'en', sourceLang = 'id') {
        if (!text || text.trim() === '') return "";
        if (translationCache[text]) { return translationCache[text]; }
        const url = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const result = await response.json();
            if (result.responseStatus !== 200) throw new Error(`MyMemory API error: ${result.responseDetails}`);
            const translatedText = result.responseData.translatedText;
            translationCache[text] = translatedText;
            return translatedText;
        } catch (error) {
            console.error('Translation failed:', error);
            throw error;
        }
    }
    
    function extractDialog(dialogInput) {
        if (!dialogInput) return '';
        const match = dialogInput.match(/"(.*?)"/);
        return match ? `DIALOG in Indonesian: Character says: "${match[1]}"` : dialogInput;
    }
    
    function setupCopyButton(button, sourceElement) {
        if (!button || !sourceElement) return;
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
    
    initialize();
});
