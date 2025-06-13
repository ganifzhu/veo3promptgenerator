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

    // =================================================================
    // STRUKTUR DATA UTAMA (THE STORY)
    // =================================================================
    let story = {
        scenes: []
    };
    let activeSceneIndex = -1;

    // =================================================================
    // FUNGSI-FUNGSI LEVEL ADEGAN (SCENE)
    // =================================================================

    function renderSceneList() {
        sceneListContainer.innerHTML = '';
        story.scenes.forEach((scene, index) => {
            const sceneCard = document.createElement('div');
            sceneCard.className = 'scene-card';
            if (index === activeSceneIndex) {
                sceneCard.classList.add('active');
            }
            sceneCard.dataset.index = index;
            sceneCard.innerHTML = `<h3>${scene.title || `Adegan ${index + 1}`}</h3>`;
            sceneCard.addEventListener('click', () => switchScene(index));
            sceneListContainer.appendChild(sceneCard);
        });
    }

    function addScene() {
        if (activeSceneIndex !== -1) saveCurrentSceneData();
        const newScene = {
            title: `Adegan ${story.scenes.length + 1}`,
            sceneData: {
                judul: `Adegan ${story.scenes.length + 1}`,
                latar: '', suasana: '', kamera: 'Tracking Shot (Mengikuti Objek)',
                pencahayaan: '', gayaVisual: 'cinematic realistis', kualitasVisual: 'Resolusi 4K',
                suaraLingkungan: '', negatif: 'teks, logo, subtitle'
            },
            characters: [{
                nama: 'Karakter 1', karakter: '', suara: '', aksi: '', ekspresi: '', dialog: ''
            }],
            activeCharacterIndex: 0
        };
        story.scenes.push(newScene);
        switchScene(story.scenes.length - 1);
    }

    function switchScene(index) {
        if (activeSceneIndex !== -1) saveCurrentSceneData();
        activeSceneIndex = index;
        loadSceneData(index);
        renderSceneList();
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
        const scene = story.scenes[activeSceneIndex];
        if (!scene) return;
        saveCurrentCharacterData();
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
            if (scene.characters.length === 0) addCharacter();
            else switchCharacter(scene.activeCharacterIndex);
        }
    }

    // =================================================================
    // EVENT LISTENERS & INISIALISASI
    // =================================================================
    addSceneBtn.addEventListener('click', addScene);
    addCharacterBtn.addEventListener('click', addCharacter);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveCurrentSceneData();
        generateBtn.textContent = 'Membuat Prompt...';
        generateBtn.disabled = true;
        const currentScene = story.scenes[activeSceneIndex];
        const { promptID, promptEN } = await generatePrompts(currentScene.sceneData, currentScene.characters);
        promptIdOutput.value = promptID;
        promptEnOutput.innerHTML = promptEN.replace(/\n/g, '<br>');
        generateBtn.textContent = 'Buat Prompt untuk Adegan Ini';
        generateBtn.disabled = false;
    });

    function initialize() {
        if (story.scenes.length === 0) {
            addScene();
        } else {
            switchScene(0);
        }
    }
    initialize();

    // =================================================================
    // FUNGSI GENERATE PROMPT & HELPERS
    // =================================================================
    async function generatePrompts(sceneData, allCharacters) {
        if (allCharacters.length === 0) return { promptID: "...", promptEN: "..." };
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
