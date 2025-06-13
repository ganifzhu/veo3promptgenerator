document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // DEKLARASI ELEMEN HTML
    // =================================================================
    const form = document.getElementById('prompt-form');
    const generateBtn = document.getElementById('generate-btn');
    const generateAllBtn = document.getElementById('generate-all-btn');
    const translateBtn = document.getElementById('translate-btn');
    const promptIdOutput = document.getElementById('prompt-id');
    const promptEnOutput = document.getElementById('prompt-en');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const copyEnBtn = document.getElementById('copy-en-btn');
    const sceneListContainer = document.getElementById('scene-list');
    const addSceneBtn = document.getElementById('add-scene-btn');
    const addCharacterBtn = document.getElementById('add-character-btn');
    const characterTabsContainer = document.getElementById('character-tabs');
    // Elemen baru untuk Simpan/Muat
    const saveToFileBtn = document.getElementById('save-to-file-btn');
    const loadFromFileBtn = document.getElementById('load-from-file-btn');
    const fileInput = document.getElementById('file-input');

    const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';
    const LOCAL_STORAGE_KEY = 'veoPromptGeneratorStory';
    const SECRET_KEY = 'KunciRahasiaSuperAman_GantiDenganTeksUnikAnda';
    const translationCache = {};

    // =================================================================
    // STRUKTUR DATA UTAMA (THE STORY)
    // =================================================================
    let story = {
        projectTitle: 'Proyek Tanpa Judul',
        scenes: []
    };
    let activeSceneIndex = -1;

    // =================================================================
    // FUNGSI-FUNGSI BARU UNTUK OPERASI FILE
    // =================================================================
    function handleSaveToFile() {
        saveCurrentSceneData(); // Pastikan data terakhir dari form tersimpan ke state
        try {
            // Tambahkan judul proyek ke dalam data yang akan disimpan
            story.projectTitle = prompt("Masukkan nama untuk file proyek Anda:", story.projectTitle || "Proyek Cerita");
            if (!story.projectTitle) return; // Batalkan jika pengguna menekan cancel

            const jsonString = JSON.stringify(story, null, 2); // null, 2 untuk format yang rapi
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const fileName = `${story.projectTitle.replace(/ /g, '_')}.json`;
            a.download = fileName;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(`Proyek berhasil disimpan sebagai ${fileName}`);
        } catch (error) {
            console.error("Gagal menyimpan file:", error);
            alert("Gagal menyimpan proyek ke dalam file.");
        }
    }

    function handleLoadFromFile(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target.result;
                const loadedStory = JSON.parse(jsonString);

                if (loadedStory && Array.isArray(loadedStory.scenes)) {
                    story = loadedStory;
                    activeSceneIndex = 0; 
                    initialize(true); // Kirim flag untuk re-render total
                    alert(`Proyek "${story.projectTitle || 'Tanpa Judul'}" berhasil dimuat!`);
                } else {
                    throw new Error("Format file tidak valid.");
                }
            } catch (error) {
                console.error("Gagal memuat atau membaca file:", error);
                alert("Gagal memuat file. Pastikan file adalah file proyek yang valid.");
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    }


    // =================================================================
    // FUNGSI SIMPAN & MUAT LOCAL STORAGE
    // =================================================================
    function saveStoryToLocalStorage() {
        // ... (fungsi ini tidak berubah) ...
    }

    function loadStoryFromLocalStorage() {
        // ... (fungsi ini tidak berubah) ...
    }

    // =================================================================
    // FUNGSI-FUNGSI MANAJEMEN ADEGAN & KARAKTER
    // =================================================================
    // ... (Semua fungsi manajemen (add, switch, delete, save, load) tidak berubah) ...

    // =================================================================
    // EVENT LISTENERS & INISIALISASI
    // =================================================================
    addSceneBtn.addEventListener('click', addScene);
    addCharacterBtn.addEventListener('click', addCharacter);
    form.addEventListener('input', saveStoryToLocalStorage);
    window.addEventListener('beforeunload', saveStoryToLocalStorage);

    // Event listener baru untuk Simpan/Muat
    saveToFileBtn.addEventListener('click', handleSaveToFile);
    loadFromFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleLoadFromFile);

    // ... (event listener untuk generate & translate tidak berubah) ...

    // Modifikasi initialize agar bisa menangani reload data
    function initialize(isReloading = false) {
        // Jika tidak sedang me-reload dari file, coba muat dari local storage
        if (!isReloading && loadStoryFromLocalStorage() && story.scenes.length > 0) {
            activeSceneIndex = 0;
            loadSceneData(activeSceneIndex);
            renderSceneList();
        } 
        // Jika sedang me-reload dari file, langsung tampilkan
        else if (isReloading) {
            loadSceneData(activeSceneIndex);
            renderSceneList();
        }
        // Jika tidak ada apa-apa, buat adegan baru
        else {
            addScene();
        }
    }
    initialize();

    // =================================================================
    // FUNGSI GENERATE PROMPT & HELPERS
    // =================================================================
    // ... (Semua fungsi generate dan helper tidak berubah) ...
    
    setupCopyButton(copyIdBtn, promptIdOutput);
    setupCopyButton(copyEnBtn, promptEnOutput);
});
