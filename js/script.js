document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prompt-form');
    const generateBtn = document.getElementById('generate-btn');
    const promptIdOutput = document.getElementById('prompt-id');
    const promptEnOutput = document.getElementById('prompt-en');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const copyEnBtn = document.getElementById('copy-en-btn');

    // Menggunakan MyMemory API untuk terjemahan gratis tanpa kunci
    const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

    // Prefill with example data
    function prefillForm() {
        document.getElementById('judul').value = 'Terminal dalam Senja';
        document.getElementById('karakter').value = 'Seorang vlogger wanita muda asal Minang berusia 27 tahun. Perawakan/Bentuk Tubuh: tubuh mungil, tinggi 158cm, bentuk badan proporsional. Warna kulit: sawo matang cerah. Rambut: ikal sebahu, hitam kecokelatan, diikat setengah ke belakang. Wajah: wajah oval, alis tebal alami, mata hitam besar, senyum ramah, pipi merona, bibir natural dengan sentuhan lip tint. Pakaian: mengenakan jaket parasut warna kuning mustard dan celana panjang hitam, membawa ransel kecil.';
        document.getElementById('suara').value = 'Dia berbicara dengan suara wanita muda yang hangat dan penuh semangat. Nada: mezzo-soprano. Timbre: bersahabat dan enerjik. Aksen/Logat: logat Indonesia dengan sentuhan khas Minang halus, berbicara murni dalam Bahasa Indonesia. Cara Berbicara: tempo sedang-cepat, gaya bicara lincah dan ekspresif. PENTING: Seluruh dialog harus dalam Bahasa Indonesia dengan pengucapan natural dan jelas. Pastikan suara karakter ini konsisten di seluruh video.';
        document.getElementById('aksi').value = 'berjalan di sekitar terminal bus malam sambil melihat-lihat aktivitas penumpang dan pedagang.';
        document.getElementById('ekspresi').value = 'Karakter menunjukkan ekspresi kagum dan antusias, sering tersenyum sambil melirik kamera.';
        document.getElementById('latar').value = 'Latar tempat: di terminal bus antar kota malam hari, terdapat pedagang kaki lima di pinggir jalur keberangkatan, beberapa bus berjajar dengan lampu menyala. Waktu: malam hari, hujan rintik-rintik.';
        document.getElementById('kamera').value = 'Tracking Shot (Mengikuti Objek)';
        document.getElementById('pencahayaan').value = 'natural dari lampu jalan dan lampu bus, pantulan cahaya pada aspal basah.';
        document.getElementById('gaya-visual').value = 'cinematic realistis';
        document.getElementById('kualitas-visual').value = 'Resolusi 4K';
        document.getElementById('suasana').value = 'Suasana sibuk, ramai, dengan kesan perjalanan malam yang hidup dan dinamis meskipun hujan.';
        document.getElementById('suara-lingkungan').value = 'SOUND: suara mesin bus menyala, pengumuman dari pengeras suara, derai hujan ringan, dan percakapan samar antar penumpang dan pedagang.';
        document.getElementById('dialog').value = 'DIALOG dalam Bahasa Indonesia: Karakter berkata: "Tiap kota punya terminal kayak gini, dan aku suka banget suasana malamnya… hangat walau gerimis begini. Rasanya kayak perjalanan baru mau dimulai."';
        document.getElementById('negatif').value = 'Hindari: teks di layar, subtitle, tulisan di video, font, logo, distorsi, artefak, anomali, wajah ganda, anggota badan cacat, tangan tidak normal, orang tambahan, objek mengganggu, kualitas rendah, buram, glitch, suara robotik, suara pecah.';
    }
    
    prefillForm();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        generateBtn.textContent = 'Membuat Prompt...';
        generateBtn.disabled = true;

        const formData = {
            judul: document.getElementById('judul').value,
            karakter: document.getElementById('karakter').value,
            suara: document.getElementById('suara').value,
            aksi: document.getElementById('aksi').value,
            ekspresi: document.getElementById('ekspresi').value,
            latar: document.getElementById('latar').value,
            kamera: document.getElementById('kamera').selectedOptions[0].text,
            pencahayaan: document.getElementById('pencahayaan').value,
            gayaVisual: document.getElementById('gaya-visual').value,
            kualitasVisual: document.getElementById('kualitas-visual').value,
            suasana: document.getElementById('suasana').value,
            suaraLingkungan: document.getElementById('suara-lingkungan').value,
            dialog: document.getElementById('dialog').value,
            negatif: document.getElementById('negatif').value,
        };

        const { promptID, promptEN } = await generatePrompts(formData);

        promptIdOutput.value = promptID;
        promptEnOutput.innerHTML = promptEN.replace(/\n/g, '<br>');

        generateBtn.textContent = 'Buat Prompt';
        generateBtn.disabled = false;
    });

    async function generatePrompts(data) {
        // --- PROMPT BAHASA INDONESIA ---
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

        // --- PROMPT BAHASA INGGRIS (DENGAN TRANSLASI) ---
        const dialogText = extractDialog(data.dialog);

        // Translate sections
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
        if (!text) {
            return ""; // Jangan menerjemahkan string kosong
        }
        
        const url = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`MyMemory API error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.responseStatus !== 200) {
                 throw new Error(`MyMemory API error! message: ${result.responseDetails}`);
            }
            return result.responseData.translatedText;
        } catch (error) {
            console.error('Translation failed:', error);
            return `[Translation Error] ${text}`;
        }
    }

    // Copy to clipboard functionality
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