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
    // PONDASI DATA (STATE) - Dimulai dengan data kosong
    // =================================================================
    let characters = [
        {
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
        }
    ];

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
        if (!isFirst) saveCurrentCharacterData();
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
    // FUNGSI-FUNGSI LAINNYA (
