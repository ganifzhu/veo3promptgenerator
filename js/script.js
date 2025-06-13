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

    // --- FUNGSI renderTabs (DIMODIFIKASI untuk menambahkan tombol hapus) ---
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

            // MEMBUAT TOMBOL HAPUS [x]
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = ' [x]';
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Mencegah event klik tab utama berjalan
                deleteCharacter(index);
            });

            tabButton.appendChild(deleteBtn); // Menambahkan tombol [x] ke dalam tombol tab
            characterTabsContainer.appendChild(tabButton);
        });
    }

    function switchCharacter(index) {
        saveCurrentCharacterData();
        activeCharacterIndex = index;
        loadCharacterData(index);
        renderTabs();
    }
    
    // --- FUNGSI BARU UNTUK MENGHAPUS KARAKTER ---
    function deleteCharacter(index) {
        // Minta konfirmasi dari pengguna sebelum menghapus
        const charNameToDelete = characters[index].nama || `Karakter ${index + 1}`;
        if (confirm(`Anda yakin ingin menghapus "${charNameToDelete}"?`)) {
            // Hapus karakter dari array menggunakan splice
            characters.splice(index, 1);

            // Logika untuk menentukan karakter aktif selanjutnya
            if (activeCharacterIndex >= index) {
                activeCharacterIndex = Math.max(0, activeCharacterIndex - 1);
            }
            
            // Jika tidak ada karakter tersisa, kosongkan form
            if (characters.length === 0) {
                // Bisa tambahkan karakter default atau kosongkan form
                addCharacter(); // Opsi: langsung tambah karakter baru
            } else {
                // Muat data karakter yang sekarang aktif
                loadCharacterData(activeCharacterIndex);
            }

            renderTabs(); // Gambar ulang semua tab
        }
    }


    function loadCharacterData(index) {
        // ... (FUNGSI INI TETAP SAMA SEPERTI SEBELUMNYA) ...
    }

    function saveCurrentCharacterData() {
        // ... (FUNGSI INI TETAP SAMA SEPERTI SEBELUMNYA) ...
    }
    
    function addCharacter() {
        // ... (FUNGSI INI TETAP SAMA SEPERTI SEBELUMNYA) ...
    }

    // =================================================================
    // EVENT LISTENERS DAN INISIALISASI
    // =================================================================
    
    // ... (SEMUA EVENT LISTENER DAN INISIALISASI TETAP SAMA) ...

    // =================================================================
    // FUNGSI-FUNGSI LAINNYA (HELPER FUNCTIONS)
    // =================================================================

    // ... (SEMUA FUNGSI LAINNYA SEPERTI generatePrompts, translateText, dll. TETAP SAMA) ...
});
