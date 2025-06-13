document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // DEKLARASI ELEMEN HTML BARU
    // =================================================================
    const form = document.getElementById('prompt-form');
    const generateBtn = document.getElementById('generate-btn');
    const generateAllBtn = document.getElementById('generate-all-btn'); // Tombol baru
    const promptIdOutput = document.getElementById('prompt-id');
    const promptEnOutput = document.getElementById('prompt-en');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const copyEnBtn = document.getElementById('copy-en-btn');
    
    // Panel Kiri (Storyboard)
    const sceneListContainer = document.getElementById('scene-list');
    const addSceneBtn = document.getElementById('add-scene-btn');
    
    // Panel Tengah (Editor Karakter)
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
    // FUNGSI-FUNGSI UTAMA (LEVEL ADEGAN)
    // =================================================================

    // Menggambar ulang daftar adegan di panel kiri
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
    
    // Menambah adegan baru
    function addScene() {
        if(activeSceneIndex !== -1) saveCurrentSceneData();

        const newScene = {
            title: `Adegan ${story.scenes.length + 1}`,
            sceneData: {
                judul: `Adegan ${story.scenes.length + 1}`, latar: '', suasana: '', kamera: 'Tracking Shot (Mengikuti Objek)',
                pencahayaan: '', gayaVisual: 'cinematic realistis', kualitasVisual: 'Resolusi 4K',
                suaraLingkungan: '', negatif: 'teks, logo, subtitle, watermark'
            },
            characters: [{
                nama: 'Karakter 1', karakter: '', suara: '', aksi: '', ekspresi: '', dialog: ''
            }],
            activeCharacterIndex: 0
        };
        story.scenes.push(newScene);
        switchScene(story.scenes.length - 1);
    }

    // Beralih adegan
    function switchScene(index) {
        if(activeSceneIndex !== -1) saveCurrentSceneData();
        activeSceneIndex = index;
        loadSceneData(index);
        renderSceneList();
    }
    
    // Memuat seluruh data adegan (umum + karakter) ke form editor
    function loadSceneData(index) {
        if (index < 0 || index >= story.scenes.length) return;
        const currentScene = story.scenes[index];
        
        // Muat data umum adegan
        Object.keys(currentScene.sceneData).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase());
            if (element) {
                if(element.tagName === 'SELECT') {
                    for (let i = 0; i < element.options.length; i++) {
                        if (element.options[i].text === currentScene.sceneData[key]) { element.selectedIndex = i; break; }
                    }
                } else { element.value = currentScene.sceneData[key] || ''; }
            }
        });
        
        // Render tab karakter untuk adegan ini dan muat karakter aktifnya
        renderCharacterTabs();
        loadCharacterData();
    }
    
    // Menyimpan seluruh data adegan dari form editor
    function saveCurrentSceneData() {
        if (activeSceneIndex < 0 || activeSceneIndex >= story.scenes.length) return;
        const currentScene = story.scenes[activeSceneIndex];
        
        // Simpan data umum adegan
        Object.keys(currentScene.sceneData).forEach(key => {
             const element = document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase());
             if (element) {
                if(element.tagName === 'SELECT') {
                    currentScene.sceneData[key] = element.options[element.selectedIndex].text;
                } else { currentScene.sceneData[key] = element.value; }
            }
        });
        currentScene.title = currentScene.sceneData.judul; // Update judul di kartu
        
        // Simpan data karakter yang sedang aktif
        saveCurrentCharacterData();
    }

    // =================================================================
    // FUNGSI-FUNGSI LEVEL KARAKTER (Sekarang Mengacu pada Adegan Aktif)
    // =================================================================
    
    function renderCharacterTabs() {
        characterTabsContainer.innerHTML = '';
        const currentScene = story.scenes[activeSceneIndex];
        if (!currentScene) return;

        currentScene.characters.forEach((char, index) => {
            const tabButton = document.createElement('button');
            tabButton.type = 'button';
            tabButton.className = 'tab-btn';
            if (index === currentScene.activeCharacterIndex) { tabButton.classList.add('active'); }
            tabButton.textContent = char.nama || `Karakter ${index + 1}`;
            tabButton.dataset.index = index;
            tabButton.addEventListener('click', () => switchCharacter(index));

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteCharacter(index); });
            tabButton.appendChild(deleteBtn);
            characterTabsContainer.appendChild(tabButton);
        });
    }

    function switchCharacter(charIndex) {
        const currentScene = story.scenes[activeSceneIndex];
        saveCurrentCharacterData();
        currentScene.activeCharacterIndex = charIndex;
        loadCharacterData();
        renderCharacterTabs();
    }
    
    function loadCharacterData() {
        const scene = story.scenes[activeSceneIndex];
        if (!scene || scene.activeCharacterIndex < 0 || scene.activeCharacterIndex >= scene.characters.length) return;
        const data = scene.characters[scene.activeCharacterIndex];
        Object.keys(data).forEach(id => {
            const element = document.getElementById(id);
            if(element) element.value = data[id] || '';
        });
    }

    function saveCurrentCharacterData() {
        const scene = story.scenes[activeSceneIndex];
        if (!scene || scene.activeCharacterIndex < 0 || scene.activeCharacterIndex >= scene.characters.length) return;
        const data = scene.characters[scene.activeCharacterIndex];
        Object.keys(data).forEach(id => {
            const element = document.getElementById(id);
            if(element) data[id] = element.value;
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
    // FUNGSI GENERATE PROMPT & HELPERS (TIDAK BERUBAH)
    // =================================================================
    async function generatePrompts(sceneData, allCharacters) {
        // ... (Fungsi ini tidak perlu diubah dari versi sebelumnya) ...
    }

    // ... (Fungsi extractDialog, translateText, setupCopyButton juga sama) ...
    
});
