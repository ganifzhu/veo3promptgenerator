document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // DEKLARASI ELEMEN & KONSTANTA
    // =================================================================
    // ... (deklarasi elemen lama tetap sama) ...
    const addSceneBtn = document.getElementById('add-scene-btn');
    
    // Elemen baru untuk Simpan/Muat
    const saveToFileBtn = document.getElementById('save-to-file-btn');
    const loadFromFileBtn = document.getElementById('load-from-file-btn');
    const fileInput = document.getElementById('file-input');

    // ... (sisa deklarasi tetap sama) ...
    const LOCAL_STORAGE_KEY = 'veoPromptGeneratorStory';
    const SECRET_KEY = 'KunciRahasiaSuperAman_GantiDenganTeksUnikAnda';

    // ... (semua state dan fungsi lainnya) ...

    // =================================================================
    // FUNGSI BARU UNTUK OPERASI FILE
    // =================================================================
    function handleSaveToFile() {
        saveCurrentSceneData(); // Pastikan data terakhir tersimpan di state
        try {
            const jsonString = JSON.stringify(story, null, 2); // null, 2 untuk format yang rapi
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Buat nama file dinamis atau default
            const fileName = story.projectTitle ? `${story.projectTitle}.json` : 'proyek-cerita.json`;
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

                // Validasi sederhana: pastikan data yang dimuat memiliki struktur dasar yang benar
                if (loadedStory && Array.isArray(loadedStory.scenes)) {
                    story = loadedStory;
                    activeSceneIndex = 0; // Reset ke adegan pertama
                    initialize(true); // Kirim flag untuk menandakan ini dari muat file
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
        // Reset input file agar bisa memilih file yang sama lagi
        event.target.value = null;
    }

    // =================================================================
    // EVENT LISTENERS & INISIALISASI
    // =================================================================
    addSceneBtn.addEventListener('click', addScene);
    // ... (event listener lain yang sudah ada) ...

    // Event listener baru
    saveToFileBtn.addEventListener('click', handleSaveToFile);
    loadFromFileBtn.addEventListener('click', () => fileInput.click()); // Tombol palsu memicu input tersembunyi
    fileInput.addEventListener('change', handleLoadFromFile);

    // Modifikasi initialize agar bisa menangani reload data
    function initialize(isReloading = false) {
        if (!isReloading && loadStoryFromLocalStorage() && story.scenes.length > 0) {
            activeSceneIndex = 0;
            loadSceneData(activeSceneIndex);
            renderSceneList();
        } else if (isReloading) {
            loadSceneData(activeSceneIndex);
            renderSceneList();
        }
        else {
            addScene();
        }
    }
    initialize();

    // ... (SEMUA FUNGSI LAINNYA TIDAK BERUBAH) ...
});
