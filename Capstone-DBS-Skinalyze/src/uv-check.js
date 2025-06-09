
const apiKey = '20e6315802e5e364852108ae4beb750d';


// Ambil elemen dari HTML untuk dimanipulasi
const statusEl = document.getElementById('status');
const uvInfoEl = document.getElementById('uv-info');
const uvValueEl = document.getElementById('uv-value');
const uvRecommendationEl = document.getElementById('uv-recommendation');


window.addEventListener('load', () => {
    // Cek apakah browser mendukung Geolocation API
    if (navigator.geolocation) {
        statusEl.textContent = 'Meminta izin lokasi...';
        // Meminta lokasi pengguna, panggil onSuccess jika berhasil, onError jika gagal
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        statusEl.textContent = 'Geolocation tidak didukung oleh browser Anda.';
    }
});

/**
 * Fungsi yang akan dipanggil jika pengguna berhasil memberikan lokasi.
 * @param {GeolocationPosition} position - Objek yang berisi data koordinat.
 */
async function onSuccess(position) {
    statusEl.textContent = 'Lokasi ditemukan, mengambil data Indeks UV...';

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // URL untuk API OpenWeather (One Call API v3.0)
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Tangani error jika API key salah atau ada masalah server
            if(response.status === 401) {
                throw new Error('API Key tidak valid atau belum aktif. Mohon periksa kembali.');
            }
            throw new Error(`Terjadi error dari server: ${response.status}`);
        }
        const data = await response.json();
        
        // Data Indeks UV ada di dalam `data.current.uvi`
        displayUvData(data.current.uvi);

    } catch (error) {
        statusEl.textContent = `Gagal mengambil data: ${error.message}`;
        uvInfoEl.classList.add('hidden'); // Sembunyikan blok info jika error
    }
}

/**
 * Fungsi yang akan dipanggil jika terjadi error saat mengambil lokasi.
 * @param {GeolocationPositionError} error - Objek yang berisi kode dan pesan error.
 */
function onError(error) {
    let message;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = 'Anda menolak permintaan untuk mengakses lokasi.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Informasi lokasi tidak tersedia saat ini.';
            break;
        case error.TIMEOUT:
            message = 'Waktu permintaan untuk mendapatkan lokasi habis.';
            break;
        default:
            message = 'Terjadi kesalahan yang tidak diketahui saat mengambil lokasi.';
            break;
    }
    statusEl.textContent = message;
}

/**
 * Fungsi untuk menampilkan data UV, rekomendasi, dan warna ke halaman.
 * VERSI INI MENGGUNAKAN KELAS-KELAS TAILWIND CSS
 * @param {number} uvi - Nilai Indeks UV yang didapat dari API.
 */
function displayUvData(uvi) {
    const uvIndex = Math.round(uvi); // Bulatkan nilai UV agar lebih mudah dibaca
    uvValueEl.textContent = uvIndex;

    let recommendation = '';
    // Kelas warna yang akan kita tambahkan adalah kelas background dari Tailwind
    let levelClass = ''; 

    if (uvIndex <= 2) {
        recommendation = 'Risiko rendah. Perlindungan dari matahari biasanya tidak diperlukan.';
        levelClass = 'bg-green-500'; // Tailwind class untuk warna hijau
    } else if (uvIndex <= 5) {
        recommendation = 'Risiko sedang. Gunakan kacamata hitam dan sedikit pelindung jika beraktivitas lama di luar.';
        levelClass = 'bg-yellow-400 text-slate-800'; // Tailwind class untuk warna kuning + teks gelap
    } else if (uvIndex <= 7) {
        recommendation = 'Risiko tinggi. Gunakan pelindung SPF 30+, topi, dan pakaian pelindung.';
        levelClass = 'bg-orange-500'; // Tailwind class untuk warna oranye
    } else if (uvIndex <= 10) {
        recommendation = 'Risiko sangat tinggi. Sebisa mungkin hindari matahari tengah hari dan cari tempat teduh.';
        levelClass = 'bg-red-600'; // Tailwind class untuk warna merah
    } else {
        recommendation = 'Risiko ekstrem. Wajib berada di dalam ruangan. Hindari keluar jika tidak perlu.';
        levelClass = 'bg-purple-700'; // Tailwind class untuk warna ungu
    }

    uvRecommendationEl.textContent = recommendation;
    
    // Reset kelas dasar lalu tambahkan kelas warna yang baru dari Tailwind
    uvValueEl.className = 'text-6xl font-bold rounded-lg py-2 px-4 inline-block transition-colors duration-300';
    uvValueEl.classList.add(...levelClass.split(' ')); // Tambahkan kelas baru (misal: 'bg-green-500')

    // Tampilkan blok info dan sembunyikan pesan status
    statusEl.classList.add('hidden');
    uvInfoEl.classList.remove('hidden');
}