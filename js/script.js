document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // DEKLARASI ELEMEN HTML
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

    // =================================================================
    // STRUKTUR DATA UTAMA (THE STORY)
    // =================================================================
    let story = {
        scenes: []
    };
    let activeSceneIndex = -1;

    // =================================================================
    // FUNGSI SIMPAN & MUAT (DENGAN ENKRIPSI)
    // =================================================================
    function saveStoryToLocalStorage() {
        try {
            if (activeSceneIndex > -1) {
                saveCurrentSceneData();
            }
            const jsonString = JSON.stringify(story);
            const encryptedData = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
            localStorage.setItem(LOCAL_STORAGE_KEY, encryptedData);
            console.log("Proyek dienkripsi dan disimpan.");
        } catch (error) {
            console.error("Gagal menyimpan proyek:", error);
        }
    }

    function loadStoryFromLocalStorage() {
        const encryptedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (encryptedData) {
            try {
                const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
                const decryptedJsonString = bytes.toString(CryptoJS.enc.Utf8);
                if (!decryptedJsonString) {
                    throw new Error("Gagal mendekripsi data, kemungkinan kunci salah atau data rusak.");
                }
                story = JSON.parse(decryptedJsonString);
                console.log("Proyek berhasil didekripsi dan dimuat.");
                return true;
            } catch (error) {
                console.error("Gagal memuat data proyek:", error);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                return false;
            }
        }
        return false;
    }

    // =================================================================
    // FUNGSI-FUNGSI UTAMA (LEVEL ADEGAN)
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
            deleteSceneBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteScene(index);
            });
            sceneCard.appendChild(deleteSceneBtn);
            sceneListContainer.appendChild(sceneCard);
        });
    }

    function addScene() {
        saveCurrentSceneData();
        const newScene = {
            title: `Adegan ${story.scenes.length + 1}`,
            sceneData: {
                judul: `Adegan ${story.scenes.length + 1}`, latar: '', suasana: '', kamera: 'Tracking Shot (Mengikuti Objek)',
                pencahayaan: '', gayaVisual: '', kualitasVisual: '', suaraLingkungan: '', negatif: ''
            },
            characters: [{ nama: 'Karakter 1', karakter: '', suara: '', aksi: '', ekspresi: '', dialog: '' }],
            activeCharacterIndex: 0
        };
        story.scenes.push(newScene);
        switchScene(story.scenes.length - 1);
    }

    function switchScene(index) {
        saveCurrentSceneData();
        activeSceneIndex = index;
        loadSceneData(index);
        renderSceneList();
    }

    function deleteScene(index) {
        const sceneNameToDelete = story.scenes[index].title || `Adegan ${index + 1}`;
        if (confirm(`Anda yakin ingin menghapus "${sceneNameToDelete}"?`)) {
            story.scenes.splice(index, 1);
            if (activeSceneIndex >= index) {
                activeSceneIndex = Math.max(0, activeSceneIndex - 1);
            }
            if (story.scenes.length === 0) {
                addScene();
            } else {
                switchScene(activeSceneIndex);
            }
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
    // FUNGSI-FUNGSI LEVEL KARAKTER
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
        scene.characters.push({
            nama: `Karakter ${newIndex + 1}`, karakter: '', suara: '', aksi: '', ekspresi: '', dialog: ''
        });
        switchCharacter(newIndex);
    }

    function deleteCharacter(charIndex) {
        const scene = story.scenes[activeSceneIndex];
        if (!scene) return;
        if (confirm(`Hapus ${scene.characters[charIndex].nama}?`)) {
            scene.characters.splice(charIndex, 1);
            if (scene.activeCharacterIndex >= charIndex) {
                scene.activeCharacterIndex = Math.max(0, scene.activeCharacterIndex - 1);
            }
            if (scene.characters.length === 0) {
                addCharacter();
            } else {
                switchCharacter(scene.activeCharacterIndex);
            }
        }
    }

    // =================================================================
    // EVENT LISTENERS & INISIALISASI
    // =================================================================
    if (addSceneBtn) addSceneBtn.addEventListener('click', addScene);
    if (addCharacterBtn) addCharacterBtn.addEventListener('click', addCharacter);
    
    if (form) form.addEventListener('input', saveStoryToLocalStorage);
    window.addEventListener('beforeunload', saveStoryToLocalStorage);

    if (form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveCurrentSceneData();
        generateBtn.textContent = 'Membuat Prompt...';
        generateBtn.disabled = true;
        const currentScene = story.scenes[activeSceneIndex];
        if (!currentScene) { generateBtn.textContent = 'Buat Prompt untuk Adegan Ini'; generateBtn.disabled = false; return; }
        const { promptID, promptEN } = await generatePrompts(currentScene.sceneData, currentScene.characters);
        if(promptIdOutput) promptIdOutput.value = promptID;
        if(promptEnOutput) promptEnOutput.innerHTML = promptEN.replace(/\n/g, '<br>');
        generateBtn.textContent = 'Buat Prompt untuk Adegan Ini';
        generateBtn.disabled = false;
    });

    if (generateAllBtn) generateAllBtn.addEventListener('click', async () => {
        saveCurrentSceneData();
        generateAllBtn.textContent = 'Membuat Naskah...';
        generateAllBtn.disabled = true;
        try {
            let fullScriptID = `PROYEK: Naskah Lengkap\n====================\n\n`;
            let fullScriptEN = `PROJECT: Full Script\n====================\n\n`;
            for (const scene of story.scenes) {
                const { promptID, promptEN } = await generatePrompts(scene.sceneData, scene.characters);
                fullScriptID += `--- ADEGAN: ${scene.title} ---\n\n${promptID}\n\n\n`;
                fullScriptEN += `--- SCENE: ${scene.title} ---\n\n${promptEN}\n\n\n`;
            }
            if(promptIdOutput) promptIdOutput.value = fullScriptID;
            if(promptEnOutput) promptEnOutput.innerHTML = fullScriptEN.replace(/\n/g, '<br>');
        } catch (error) {
            console.error("Error saat membuat naskah lengkap:", error);
            alert("Gagal membuat naskah lengkap.");
        } finally {
            generateAllBtn.textContent = 'Buat Naskah Lengkap';
            generateAllBtn.disabled = false;
        }
    });

    function initialize() {
        if (loadStoryFromLocalStorage() && story.scenes.length > 0) {
            activeSceneIndex = 0;
            switchScene(0);
        } else {
            addScene();
        }
    }
    initialize();

    // =================================================================
    // FUNGSI GENERATE PROMPT & HELPERS
    // =================================================================
    async function generatePrompts(sceneData, allCharacters) {
        if (!sceneData || !allCharacters || allCharacters.length === 0) return { promptID: "", promptEN: "" };
        const characterDetails = allCharacters.map(char => {
            return `**[Karakter: ${char.nama}]**\n- Deskripsi: ${char.karakter || '(tidak ada deskripsi)'}\n- Suara: ${char.suara || '(tidak ada detail suara)'}\n- Aksi: ${char.aksi || '(tidak ada aksi)'}\n- Ekspresi: ${char.ekspresi || '(tidak ada ekspresi)'}\n- Dialog: ${char.dialog || '(tidak ada dialog)'}`;
        }).join('\n\n');
        const promptID = `**[Judul Adegan]**\n${sceneData.judul}\n\n**[INFORMASI KARAKTER DALAM ADEGAN]**\n${characterDetails}\n\n**[Latar & Suasana]**\n${sceneData.latar}. ${sceneData.suasana}.\n\n**[Detail Visual & Sinematografi]**\nGerakan Kamera: ${sceneData.kamera}.\nPencahayaan: ${sceneData.pencahayaan}.\nGaya Visual: ${sceneData.gayaVisual}, ${sceneData.kualitasVisual}.\n\n**[Audio]**\nSuara Lingkungan: ${sceneData.suaraLingkungan}\n\n**[Negative Prompt]**\n${sceneData.negatif}`;
        const t = (text) => translateText(text, 'en', 'id');
        const [judulEn, latarEn, suasanaEn, pencahayaanEn, gayaVisualEn, kualitasVisualEn, suaraLingkunganEn, negatifEn] = await Promise.all([t(sceneData.judul), t(sceneData.latar), t(sceneData.suasana), t(sceneData.pencahayaan), t(sceneData.gayaVisual), t(sceneData.kualitasVisual), t(sceneData.suaraLingkungan.replace('SOUND:', '')), t(sceneData.negatif.replace('Hindari:', ''))]);
        const cameraMovementEn = sceneData.kamera.match(/\(([^)]+)\)/) ? sceneData.kamera.match(/\(([^)]+)\)/)[1] : sceneData.kamera;
        const translatedCharacters = await Promise.all(allCharacters.map(async (char) => {
            const [karakterEn, suaraEn, aksiEn, ekspresiEn] = await Promise.all([t(char.karakter), t(char.suara), t(char.aksi), t(char.ekspresi)]);
            return { nama: char.nama, deskripsi: karakterEn, suara: suaraEn, aksi: aksiEn, ekspresi: ekspresiEn, dialog: char.dialog };
        }));
        const characterDetailsEN = translatedCharacters.map(char => {
            return `**[Character: ${char.nama}]**\n- Description: ${char.deskripsi || '(no description)'}\n- Voice: ${char.suara || '(no voice details)'}\n- Action: ${char.aksi || '(no action)'}\n- Expression: ${char.ekspresi || '(no expression)'}\n- Dialogue: ${extractDialog(char.dialog) || '(no dialogue)'}`;
        }).join('\n\n');
        const promptEN = `**[Scene Title]**\n${judulEn}\n\n**[CHARACTER INFORMATION IN SCENE]**\n${characterDetailsEN}\n\n**[Setting & Atmosphere]**\n${latarEn}. ${suasanaEn}.\n\n**[Visual & Cinematography Details]**\nCamera Movement: ${cameraMovementEn}.\nLighting: ${pencahayaanEn}.\nVisual Style: ${gayaVisualEn}, ${kualitasVisualEn}.\n\n**[Audio]**\nAmbient Sound: SOUND: ${suaraLingkunganEn}\n\n**[Negative Prompt]**\nAvoid: ${negatifEn}`;
        return { promptID, promptEN };
    }
    
    function extractDialog(dialogInput) {
        if (!dialogInput) return '';
        const match = dialogInput.match(/"(.*?)"/);
        return match ? `DIALOG in Indonesian: Character says: "${match[1]}"` : dialogInput;
    }

    async function translateText(text, targetLang = 'en', sourceLang = 'id') {
        if (!text || text.trim() === '') return "";
        const url = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const result = await response.json();
            if (result.responseStatus !== 200) throw new Error(`MyMemory API error: ${result.responseDetails}`);
            return result.responseData.translatedText;
        } catch (error) {
            console.error('Translation failed:', error);
            return `[Translation Error]`;
        }
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
});
