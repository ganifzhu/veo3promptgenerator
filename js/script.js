document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // LANGKAH 1: PERSIAPAN VARIABEL DAN PONDASI DATA
    // =================================================================
    const form = document.getElementById('prompt-form');
    const generateBtn = document.getElementById('generate-btn');
    const promptIdOutput = document.getElementById('prompt-id');
    const promptEnOutput = document.getElementById('prompt-en');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const copyEnBtn = document.getElementById('copy-en-btn');

    const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

    // --- INILAH PONDASI BARU KITA ---
    let characters = [
        // Karakter pertama, diisi dengan data contoh Anda
        {
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

    let activeCharacterIndex = 0; // Menandakan kita sedang mengedit karakter pertama (index 0)


    // =================================================================
    // LANGKAH 2: FUNGSI-FUNGSI BARU UNTUK MENGELOLA DATA
    // =================================================================

    // FUNGSI UNTUK MENAMPILKAN DATA DARI JS KE FORM HTML
    function loadCharacterData(index) {
        const charData = characters[index];
        if (!charData) return; // Jika data karakter tidak ada, hentikan

        // Mengisi setiap kolom form dengan data dari objek karakter
        for (const key in charData) {
            const element = document.getElementById(key);
            if (element) {
                 // Untuk dropdown/select, kita cari option yang teksnya cocok
                if (element.tagName === 'SELECT') {
                    for (let i = 0; i < element.options.length; i++) {
                        if (element.options[i].text === charData[key]) {
                            element.selectedIndex = i;
                            break;
                        }
                    }
                } else {
                    element.value = charData[key];
                }
            }
        }
    }

    // FUNGSI UNTUK MENYIMPAN DATA DARI FORM HTML KE JS
    function saveCurrentCharacterData() {
        const charData = characters[activeCharacterIndex];
        if (!charData) return;

        // Mengambil nilai dari setiap kolom form dan menyimpannya ke objek karakter
        for (const key in charData) {
            const element = document.getElementById(key);
            if (element) {
                 if (element.tagName === 'SELECT') {
                    charData[key] = element.selectedOptions[0].text;
                 } else {
                    charData[key] = element.value;
                 }
            }
        }
    }
