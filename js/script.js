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
    let characters = [
        {
            nama: 'Karakter 1',
            judul: 'Terminal dalam Senja',
            karakter: 'Seorang vlogger wanita muda asal Minang berusia 27 tahun. Perawakan/Bentuk Tubuh: tubuh mungil, tinggi 158cm, bentuk badan proporsional. Warna kulit: sawo matang cerah. Rambut: ikal sebahu, hitam kecokelatan, diikat setengah ke belakang. Wajah: wajah oval, alis tebal alami, mata hitam besar, senyum ramah, pipi merona, bibir natural dengan sentuhan lip tint. Pakaian: mengenakan jaket parasut warna kuning mustard dan celana panjang hitam, membawa ransel kecil.',
            suara: 'Dia berbicara dengan suara wanita muda yang hangat dan penuh semangat. Nada: mezzo-soprano. Timbre: bersahabat dan enerjik. Aksen/Logat: logat Indonesia dengan sentuhan khas Minang halus, berbicara murni dalam Bahasa Indonesia. Cara Berbicara: tempo sedang-cepat, gaya bicara lincah dan ekspresif. PENTING: Seluruh dialog harus dalam Bahasa Indonesia dengan pengucapan natural dan jelas. Pastikan suara karakter ini konsisten di seluruh video.',
            aksi: 'berjalan di sekitar terminal bus malam sambil melihat-lihat aktivitas penumpang dan pedagang.',
            ekspresi: 'Karakter menunjukkan ekspresi kagum dan antusias, sering tersenyum sambil melirik kamera.',
            latar: 'Latar tempat: di terminal bus antar kota malam hari, terdapat pedagang kaki lima di pinggir jalur keberangkatan, beberapa bus berjajar dengan lampu menyala. Waktu: malam hari, hujan rintik-rintik.',
            kamera: 'Tracking Shot (Mengikuti Objek)',
            pencahayaan: 'natural dari lampu jalan dan lampu bus, pantulan cahaya pada aspal basah.',
            gayaVisual: 'cinematic realistis',
            kualitasVisual: 'Resolusi 4K',
            suasana: 'Suasana sibuk, ramai, dengan kesan perjalanan malam yang hidup dan dinamis meskipun hujan.',
            suaraLingkungan: 'SOUND: suara mesin bus menyala, pengumuman dari pengeras suara, derai hujan ringan, dan percakapan samar antar penumpang dan pedagang.',
            dialog: 'DIALOG dalam Bahasa Indonesia: Karakter berkata: "Tiap kota punya terminal kayak gini, dan aku suka banget suasana malamnya… hangat walau gerimis begini. Rasanya kayak perjalanan baru mau dimulai."',
            negatif: 'Hindari: teks di layar, subtitle, tulisan di video, font, logo, distorsi, artefak, anomali, wajah ganda, anggota badan cacat, tangan tidak normal, orang tambahan, objek mengganggu, kualitas rendah, buram, glitch, suara robotik, suara pecah.'
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
            tabButton.textContent = char.nama || `Karakter ${index + 1}`;
            tabButton.dataset.index = index;

            tabButton.addEventListener('click', () => {
                switchCharacter(index);
            });
            
            characterTabsContainer.appendChild(tabButton);
        });
    }

    function switchCharacter(index) {
        saveCurrentCharacterData();
        activeCharacterIndex = index;
        loadCharacterData(index);
        renderTabs();
    }

    function loadCharacterData(index) {
        const charData = characters[index];
        if (!charData) return;
        
        const allKeys = ['nama', 'judul', 'karakter', 'suara', 'aksi', 'ekspresi', 'latar', 'kamera', 'pencahayaan', 'gayaVisual', 'kualitasVisual', 'suasana', 'suaraLingkungan', 'dialog', 'negatif'];

        allKeys.forEach(key => {
            const elementId = key.replace('gayaVisual', 'gaya-visual').replace('kualitasVisual', 'kualitas-visual').replace('suaraLingkungan', 'suara-lingkungan');
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
        if (!charData) return;

        const allKeys = ['nama', 'judul', 'karakter', 'suara', 'aksi', 'ekspresi', 'latar', 'kamera', 'pencahayaan', 'gayaVisual', 'kualitasVisual', 'suasana', 'suaraLingkungan', 'dialog', 'negatif'];
        
        allKeys.forEach(key => {
            const elementId = key.replace('gayaVisual', 'gaya-visual').replace('kualitasVisual', 'kualitas-visual').replace('suaraLingkungan', 'suara-lingkungan');
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
    
    function addCharacter() {
        saveCurrentCharacterData(); 
        const newIndex = characters.length;
        const previousCharacter = characters[activeCharacterIndex];
        
        characters.push({
            // Data umum adegan dibawa dari karakter sebelumnya
            nama: `Karakter ${newIndex + 1}`,
            judul: previousCharacter.judul,
            latar: previousCharacter.latar,
            suasana: previousCharacter.suasana,
            kamera: previousCharacter.kamera,
            pencahayaan: previousCharacter.pencahayaan,
            gayaVisual: previousCharacter.gayaVisual,
            kualitasVisual: previousCharacter.kualitasVisual,
            suaraLingkungan: previousCharacter.suaraLingkungan,
            negatif: previousCharacter.negatif,
            // Data spesifik karakter dikosongkan
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

    addCharacterBtn.addEventListener('click', addCharacter);

    function initialize() {
        loadCharacterData(activeCharacterIndex);
        renderTabs();
    }
    
    initialize();

    // =================================================================
    // FUNGSI-FUNGSI LAINNYA (HELPER FUNCTIONS)
    // =================================================================

    async function generatePrompts(data) {
        const promptID =
`**[Judul Adegan]**
${data.judul}

**[Deskripsi Karakter Utama]**
${data.karakter}

**[Detail Suara Karakter]**
${data.suara}

**[Aksi & Ekspresi Karakter]**
${data.aksi}. ${data.ekspresi}.

**[Latar & Suasana]**
${data.latar}. ${data.suasana}.

**[Detail Visual & Sinematografi]**
Gerakan Kamera: ${data.kamera}.
Pencahayaan: ${data.pencahayaan}.
Gaya Visual: ${data.gayaVisual}, ${data.kualitasVisual}.

**[Audio]**
Suara Lingkungan: ${data.suaraLingkungan}
${data.dialog}

**[Negative Prompt]**
${data.negatif}`;

        const dialogText = extractDialog(data.dialog);
        const t = (text) => translateText(text, 'en', 'id');
        const [
            judulEn, karakterEn, suaraEn, aksiEn, ekspresiEn, latarEn,
            suasanaEn, pencahayaanEn, gayaVisualEn, kualitasVisualEn,
            suaraLingkunganEn, negatifEn
        ] = await Promise.all([
            t(data.judul), t(data.karakter), t(data.suara.replace('PENTING: Seluruh dialog harus dalam Bahasa Indonesia dengan pengucapan natural dan jelas. Pastikan suara karakter ini konsisten di seluruh video.', '')),
            t(data.aksi), t(data.ekspresi), t(data.latar), t(data.suasana),
            t(data.pencahayaan), t(data.gayaVisual), t(data.kualitasVisual),
            t(data.suaraLingkungan.replace('SOUND:', '')), t(data.negatif.replace('Hindari:', ''))
        ]);
        const cameraMovementEn = data.kamera.match(/\(([^)]+)\)/)[1];
        const promptEN =
`**[Scene Title]**
${judulEn}

**[Main Character Description]**
${karakterEn}

**[Character Voice Details]**
${suaraEn} IMPORTANT: All dialogue must be in natural and clear Indonesian. Ensure this character's voice is consistent throughout the video.

**[Character Action & Expression]**
${aksiEn}. ${ekspresiEn}.

**[Setting & Atmosphere]**
${latarEn}. ${suasanaEn}.

**[Visual & Cinematography Details]**
Camera Movement: ${cameraMovementEn}.
Lighting: ${pencahayaanEn}.
Visual Style: ${gayaVisualEn}, ${kualitasVisualEn}.

**[Audio]**
Ambient Sound: SOUND: ${suaraLingkunganEn}
${dialogText}

**[Negative Prompt]**
Avoid: ${negatifEn}`;
        return { promptID, promptEN };
    }

    function extractDialog(dialogInput) {
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
            const textToCopy = sourceElement.isContentEditable || sourceElement.tagName === 'TEXTAREA' || sourceElement.tagName === 'INPUT'
                ? sourceElement.value 
                : sourceElement.innerText;
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
