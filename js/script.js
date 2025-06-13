document.addEventListener('DOMContentLoaded', () => {
    // ... (Semua deklarasi elemen di atas tetap sama)
    const translateBtn = document.getElementById('translate-btn'); // Tombol baru

    // ... (Semua fungsi manajemen data dan state tidak berubah)

    // =================================================================
    // EVENT LISTENERS & INISIALISASI (Perubahan Besar di Sini)
    // =================================================================
    
    // Tombol Generate utama sekarang HANYA membuat prompt ID
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCurrentSceneData();
        const currentScene = story.scenes[activeSceneIndex];
        if (!currentScene) return;
        
        const promptID = generateIndonesianPrompt(currentScene.sceneData, currentScene.characters);
        promptIdOutput.value = promptID;
        promptEnOutput.innerHTML = ''; // Kosongkan output Inggris
    });
    
    // Tombol Generate All sekarang HANYA membuat naskah ID
    generateAllBtn.addEventListener('click', () => {
        saveCurrentSceneData();
        let fullScriptID = `PROYEK: Naskah Lengkap\n====================\n\n`;
        for (const scene of story.scenes) {
            const promptID = generateIndonesianPrompt(scene.sceneData, scene.characters);
            fullScriptID += `--- ADEGAN: ${scene.title} ---\n\n${promptID}\n\n\n`;
        }
        promptIdOutput.value = fullScriptID;
        promptEnOutput.innerHTML = ''; // Kosongkan output Inggris
    });
    
    // Tombol BARU untuk menerjemahkan
    translateBtn.addEventListener('click', async () => {
        saveCurrentSceneData(); // Selalu simpan state terakhir
        translateBtn.textContent = 'Menerjemahkan...';
        translateBtn.disabled = true;

        try {
            let fullScriptEN = `PROJECT: Full Script\n====================\n\n`;
            for (const scene of story.scenes) {
                const promptEN = await translateSceneToEnglish(scene.sceneData, scene.characters);
                fullScriptEN += `--- SCENE: ${scene.title} ---\n\n${promptEN}\n\n\n`;
            }
            promptEnOutput.innerHTML = fullScriptEN.replace(/\n/g, '<br>');

        } catch (error) {
            console.error("Terjadi error saat proses terjemahan:", error);
            alert("Gagal menerjemahkan. Coba lagi sesaat.");
        } finally {
            translateBtn.textContent = 'Terjemahkan ke Inggris';
            translateBtn.disabled = false;
        }
    });

    // ... (Fungsi initialize dan setup lainnya tidak berubah)

    // =================================================================
    // FUNGSI GENERATE PROMPT & HELPERS (DIPISAH)
    // =================================================================
    
    // Fungsi ini sekarang SINKRON dan CEPAT
    function generateIndonesianPrompt(sceneData, allCharacters) {
        const characterDetails = allCharacters.map(char => {
            return `**[Karakter: ${char.nama}]**\n- Deskripsi: ${char.karakter || '(...)'}\n- Suara: ${char.suara || '(...)'}\n- Aksi: ${char.aksi || '(...)'}\n- Ekspresi: ${char.ekspresi || '(...)'}\n- Dialog: ${char.dialog || '(...)'}`;
        }).join('\n\n');
        return `**[Judul Adegan]**\n${sceneData.judul}\n\n**[INFORMASI KARAKTER DALAM ADEGAN]**\n${characterDetails}\n\n**[Latar & Suasana]**\n${sceneData.latar}. ${sceneData.suasana}.\n\n**[Detail Visual & Sinematografi]**\nGerakan Kamera: ${sceneData.kamera}.\nPencahayaan: ${sceneData.pencahayaan}.\nGaya Visual: ${sceneData.gayaVisual}, ${sceneData.kualitasVisual}.\n\n**[Audio]**\nSuara Lingkungan: ${sceneData.suaraLingkungan}\n\n**[Negative Prompt]**\n${sceneData.negatif}`;
    }

    // Fungsi BARU yang ASINKRON dan LAMBAT (hanya untuk terjemahan)
    async function translateSceneToEnglish(sceneData, allCharacters) {
        const t = (text) => translateText(text, 'en', 'id');
        const delay = ms => new Promise(res => setTimeout(res, ms));

        const sceneDataEn = {};
        const sceneKeys = ['judul', 'latar', 'suasana', 'pencahayaan', 'gayaVisual', 'kualitasVisual', 'suaraLingkungan', 'negatif'];
        for (const key of sceneKeys) {
            let textToTranslate = sceneData[key];
            if (key === 'suaraLingkungan') textToTranslate = textToTranslate.replace('SOUND:', '');
            if (key === 'negatif') textToTranslate = textToTranslate.replace('Hindari:', '');
            sceneDataEn[key] = await t(textToTranslate);
            await delay(200); // Beri jeda lebih lama antar permintaan
        }

        const translatedCharacters = [];
        for (const char of allCharacters) {
            const charEn = { nama: char.nama, dialog: char.dialog };
            charEn.karakter = await t(char.karakter); await delay(200);
            charEn.suara = await t(char.suara); await delay(200);
            charEn.aksi = await t(char.aksi); await delay(200);
            charEn.ekspresi = await t(char.ekspresi); await delay(200);
            translatedCharacters.push(charEn);
        }
        
        const cameraMovementEn = sceneData.kamera.match(/\(([^)]+)\)/) ? sceneData.kamera.match(/\(([^)]+)\)/)[1] : sceneData.kamera;
        const characterDetailsEN = translatedCharacters.map(c=>`**[Character: ${c.nama}]**\n- Description: ${c.deskripsi||'(...)'}\n- Voice: ${c.suara||'(...)'}\n- Action: ${c.aksi||'(...)'}\n- Expression: ${c.ekspresi||'(...)'}\n- Dialogue: ${extractDialog(c.dialog)||'(...)'}`).join('\n\n');
        
        return `**[Scene Title]**\n${sceneDataEn.judul}\n\n**[CHARACTER INFORMATION IN SCENE]**\n${characterDetailsEN}\n\n**[Setting & Atmosphere]**\n${sceneDataEn.latar}. ${sceneDataEn.suasana}.\n\n**[Visual & Cinematography Details]**\nCamera Movement: ${cameraMovementEn}.\nLighting: ${sceneDataEn.pencahayaan}.\nVisual Style: ${sceneDataEn.gayaVisual}, ${sceneDataEn.kualitasVisual}.\n\n**[Audio]**\nAmbient Sound: SOUND: ${sceneDataEn.suaraLingkungan.trim()}\n\n**[Negative Prompt]**\nAvoid: ${sceneDataEn.negatif.trim()}`;
    }
    
    // ... (Fungsi translateText, extractDialog, setupCopyButton tidak berubah)
});
