// UV Check Initialization Script
function initUVCheck() {
  const apiKey = 'a80c4bd61519d218f5a6caf909efdeb7';
  
  const statusEl = document.getElementById('status');
  const uvInfoEl = document.getElementById('uv-info');
  const uvValueEl = document.getElementById('uv-value');
  const uvRecommendationEl = document.getElementById('uv-recommendation');

  // Pastikan elemen ditemukan
  if (!statusEl) {
    console.error('UV Check: Status element not found');
    return;
  }

  // Cek apakah browser mendukung Geolocation API
  if (navigator.geolocation) {
    statusEl.textContent = 'Meminta izin lokasi...';
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    statusEl.textContent = 'Geolocation tidak didukung oleh browser Anda.';
  }

  async function onSuccess(position) {
    statusEl.textContent = 'Lokasi ditemukan, mengambil data Indeks UV...';

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API Key tidak valid atau langganan belum aktif.');
        }
        throw new Error(`Terjadi error dari server: ${response.status}`);
      }
      const data = await response.json();
      displayUvData(data.current.uvi);
    } catch (error) {
      statusEl.textContent = `Gagal mengambil data: ${error.message}`;
      if (uvInfoEl) {
        uvInfoEl.classList.add('hidden');
      }
    }
  }

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

  function displayUvData(uvi) {
    const uvIndex = Math.round(uvi);
    
    if (!uvValueEl || !uvRecommendationEl || !uvInfoEl) {
      console.error('UV Check: Required elements not found');
      return;
    }

    uvValueEl.textContent = uvIndex;

    let recommendation = '';
    let levelClass = '';

    if (uvIndex <= 2) {
      recommendation = 'Risiko rendah. Perlindungan dari matahari biasanya tidak diperlukan.';
      levelClass = 'bg-green-500';
    } else if (uvIndex <= 5) {
      recommendation = 'Risiko sedang. Gunakan tabir surya dan hindari paparan langsung di siang hari.';
      levelClass = 'bg-yellow-400';
    } else if (uvIndex <= 7) {
      recommendation = 'Risiko tinggi. Gunakan tabir surya, topi, dan kacamata hitam.';
      levelClass = 'bg-orange-500';
    } else if (uvIndex <= 10) {
      recommendation = 'Risiko sangat tinggi. Hindari aktivitas di luar ruangan pada siang hari.';
      levelClass = 'bg-red-600';
    } else {
      recommendation = 'Risiko ekstrem. Jangan beraktivitas di luar ruangan tanpa perlindungan lengkap.';
      levelClass = 'bg-purple-700';
    }

    uvValueEl.className = `text-6xl font-bold rounded-lg py-2 px-4 inline-block text-white transition-colors duration-300 ${levelClass}`;
    uvRecommendationEl.textContent = recommendation;
    statusEl.textContent = '';
    uvInfoEl.classList.remove('hidden');
  }
}

// Export function untuk bisa digunakan di file lain
window.initUVCheck = initUVCheck;