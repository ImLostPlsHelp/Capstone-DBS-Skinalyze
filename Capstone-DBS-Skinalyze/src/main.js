import { predictSkinType } from "./predict/predict.js";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  getIdToken,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import CONFIG from "./config";
import { image } from "@tensorflow/tfjs";
import imageCompression from "browser-image-compression";

const firebaseConfig = {
  apiKey: CONFIG.API_KEY,
  authDomain: CONFIG.DOMAIN,
  projectId: CONFIG.PROJECTID,
  appId: CONFIG.APPID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function loadComponent(id, path) {
  const slot = document.getElementById(id);
  if (!slot) return;
  const res = await fetch(path);
  const html = await res.text();
  slot.innerHTML = html;

  if (id === "navbar") {
    setupNavbarToggle();
    updateNavbarBasedOnLoginStatus();
  }

  if (id === "UVCheck") {
    initUVCheck();
  }
}

function handleLogout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userName");

  alert("Anda telah logout.");
  window.location.href = "/login.html";
}

function updateNavbarBasedOnLoginStatus() {
  const getInTouch = document.getElementById("get-in-touch-link");
  const token = sessionStorage.getItem("token");
  const firstName = sessionStorage.getItem("firstName");
  const lastName = sessionStorage.getItem("lastName");
  const userName = firstName && lastName ? `${firstName} ${lastName}` : null;

  const loginLink = document.getElementById("login-link");
  const userGreeting = document.getElementById("navbar-user-greeting");
  const logoutButton = document.getElementById("navbar-logout-button");

  if (token && userName) {
    if (loginLink) loginLink.style.display = "none";
    getInTouch.style.display = "none";

    if (userGreeting) {
      userGreeting.textContent = `Halo, ${userName}!`;
      userGreeting.style.display = "inline";
    }
    if (logoutButton) {
      logoutButton.style.display = "inline";
      logoutButton.removeEventListener('click', handleLogout);
      logoutButton.addEventListener('click', handleLogout);
    }
  } else {
    // Pengguna dianggap belum login
    if (loginLink) loginLink.style.display = "inline";

    if (userGreeting) userGreeting.style.display = "none";
    if (logoutButton) logoutButton.style.display = "none";
  }
}

function setupNavbarToggle() {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.contains("hidden");

      if (isHidden) {
        mobileMenu.classList.remove("hidden");
        void mobileMenu.offsetWidth;
        mobileMenu.classList.remove("-translate-y-5", "opacity-0");
        mobileMenu.classList.add("translate-y-0", "opacity-100");

        toggleBtn.classList.add("rotate-90");
        toggleBtn.innerText = "✕"; // ubah ke silang
      } else {
        mobileMenu.classList.remove("translate-y-0", "opacity-100");
        mobileMenu.classList.add("-translate-y-5", "opacity-0");

        toggleBtn.classList.remove("rotate-90");
        toggleBtn.innerText = "☰"; // ubah balik ke hamburger

        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);
      }
    });
  }
}

loadComponent("navbar", "/component/navbar.html");
loadComponent("hero", "/component/hero-banner.html");
loadComponent("tentang-kami", "/component/about-us.html");
loadComponent("artikel", "/component/artikel.html");
loadComponent("UVCheck", "/component/UVCheck.html");
loadComponent("faq", "/component/faq.html");
loadComponent("faq-full", "/component/faq-full.html");
loadComponent("footer", "/component/footer.html");

// // Function untuk memuat dan menjalankan UV Check script
// function loadUVCheckScript() {
//   const script = document.createElement("script");
//   script.src = "/src/uvcheck-init.js";
//   script.onload = () => {
//     // Tunggu sebentar untuk memastikan elemen sudah dimuat
//     setTimeout(() => {
//       if (typeof window.initUVCheck === "function") {
//         window.initUVCheck();
//       } else {
//         console.error("UV Check function not loaded");
//       }
//     }, 100);
//   };
//   script.onerror = () => {
//     console.error("Failed to load UV Check script");
//   };
//   document.head.appendChild(script);
// }

// UV Check Initialization Script
function initUVCheck() {
  const apiKey = process.env.WEATHER_API_KEY;
  console.log(process.env.WEATHER_API_KEY);
  console.log(process.env.APPID);
  console.log(apiKey);
  
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

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("upload-picture");
  const fileInput = document.getElementById("upload-input");
  const fileLabel = document.querySelector('label[for="upload-picture"]');
  const cameraPlaceholder = document.querySelector(".camera-placeholder");
  const checkNowBtn = document.getElementById("check-skin");
  const CheckAgainBtn = document.getElementById("check-again");
  const firstName = document.getElementById("first-name");
  const lastName = document.getElementById("last-name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const signUpBtn = document.getElementById("sign-up-button");
  const loginForm = document.getElementById("loginForm");
  const profileName = document.getElementById("profile-name");
  const profileGender = document.getElementById("profile-gender");
  const profileAddress = document.getElementById("profile-address");
  const profileAge = document.getElementById("profile-age");
  const profilePicture = document.getElementById("profile-picture");
  const historySectionContent = document.getElementById(
    "history-section-content"
  );

  let uploadedImageObject = null;

  uploadBtn?.addEventListener("click", () => {
    fileInput?.click();
  });

  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) {
      fileLabel.textContent = "No Files Chosen.jpg";
      cameraPlaceholder.innerHTML = '<img src="/assets/photo.png" alt="Take a photo" class="w-1/2 h-1/2 object-contain" />';
      localStorage.removeItem("uploadedImage");
      uploadedImageObject = null;
      return;
    }

    fileLabel.textContent = `Compressing ${file.name}...`;
    cameraPlaceholder.innerHTML = '<p class="text-center">Mengompres gambar...</p>';

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    try {
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      const compressedFile = await imageCompression(file, options); // Kompres File object
      console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

      fileLabel.textContent = compressedFile.name;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.src = evt.target.result; // base64 dari gambar TERKOMPRESI
        img.className = "w-full h-full object-contain";
        img.onload = () => (uploadedImageObject = img); // Simpan objek Image untuk predictSkinType

        // Simpan base64 dari gambar TERKOMPRESI ke localStorage
        localStorage.setItem("uploadedImage", evt.target.result);

        cameraPlaceholder.innerHTML = "";
        cameraPlaceholder.appendChild(img);
      };
      reader.readAsDataURL(compressedFile); // Baca File object yang sudah dikompres

    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Gagal mengompres gambar. Silakan coba lagi.");
      fileLabel.textContent = "No Files Chosen.jpg";
      cameraPlaceholder.innerHTML = '<img src="/assets/photo.png" alt="Take a photo" class="w-1/2 h-1/2 object-contain" />';
      localStorage.removeItem("uploadedImage");
      uploadedImageObject = null;
    }
  });

  // Handle "Check Now" button
  checkNowBtn?.addEventListener("click", async () => {
    const compressedBase64Image = localStorage.getItem("uploadedImage");

    if (!uploadedImageObject || !compressedBase64Image) {
      alert("Silakan unggah dan kompres gambar terlebih dahulu.");
      return;
    }

    const checkNowText = checkNowBtn.textContent;
    checkNowBtn.disabled = true;
    checkNowBtn.textContent = "Menganalisis...";

    try {
      const resultIndex = await predictSkinType(uploadedImageObject);

      const labelMap = [
        { name: "Actinic Keratoses", risk: "Bukan Kanker", status: "Berbahaya" },
        { name: "Basal Cell Carcinoma", risk: "Kanker", status: "Berbahaya" },
        { name: "Benign Keratosis-like Lesions", risk: "Bukan Kanker", status: "Berbahaya" },
        { name: "Dermatofibroma", risk: "Bukan Kanker", status: "Tidak Berbahaya" },
        { name: "Melanoma", risk: "Kanker", status: "Berbahaya" },
        { name: "Melanocytic Nevi", risk: "Bukan Kanker", status: "Tidak Berbahaya" },
        { name: "Vascular Lesions", risk: "Bukan Kanker", status: "Tidak Berbahaya" },
      ];

      const result = labelMap[resultIndex];

    
      // Ambil description and advice dari Groq.
      const groqResponse = await fetch(
        "https://back-end-skinalyze.onrender.com/api/get-groq-advice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ disease: result.name }),
        }
      );

      if (!groqResponse.ok) {
        throw new Error("Gagal mendapatkan saran dari server.");
      }

      const groqData = await groqResponse.json();
      const fullContent = groqData.advice; 

      // Pisah teks deskripsi dan saran
      const separator = '---PEMISAH---';
      let descriptionText = 'Deskripsi tidak tersedia.';
      let adviceText = fullContent; 

      if (fullContent.includes(separator)) {
        const parts = fullContent.split(separator);
        descriptionText = parts[0].trim(); // Part 1 description
        adviceText = parts[1].trim();      // Part 2 advice
      }

      result.deskripsi = descriptionText;
      result.saran = adviceText;

      const saveResultToFirestore = await fetch(
        "https://back-end-skinalyze.onrender.com/api/save-result",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: result.name,
            risk: result.risk,
            status: result.status,
            deskripsi: result.deskripsi,
            saran: result.saran,
            image: compressedBase64Image,
          }),
        }
      );

      if (!saveResultToFirestore.ok) {
        const errorData = await saveResultToFirestore.json();
        console.error("Failed to save result to Firestore:", errorData);
        throw new Error(`Gagal menyimpan hasil ke Firestore: ${errorData.message || saveResultToFirestore.statusText}`);
      }
      console.log("Result saved to Firestore successfully.");

      localStorage.setItem("predictionResult", JSON.stringify(result));
      window.location.href = "/hasil.html";

    } catch (error) {
      console.error("Prediction, saving, or advice generation failed:", error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      checkNowBtn.disabled = false;
      checkNowBtn.textContent = checkNowText;
    }
  });

  // Handle "Check Again" button on result page
  CheckAgainBtn?.addEventListener("click", () => {
    window.location.href = "/skin-check.html";

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in:", user.email);
      } else {
        console.log("User not logged in");
      }
    });
  });

  const logoutBtn = document.getElementById("logout");
  logoutBtn?.addEventListener("click", () => {
    signOut(auth).then(() => {
      alert("Berhasil logout");
      window.location.reload();
    });
  });

  signUpBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    // Validasi field
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      alert("Lengkapi semua data terlebih dahulu!");
      return;
    }

    const emailValue = email.value;
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;

    if (passwordValue !== confirmPasswordValue) {
      alert("Password tidak cocok");
      return;
    }

    try {
      const response = await fetch("https://back-end-skinalyze.onrender.com/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value,
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan data ke server");

      alert("Akun berhasil dibuat!");
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Error signing up:", error);
      alert(error.message);
    }
  });

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginButton = document.getElementById("login-button");
  loginButton.disabled = true;
  loginButton.textContent = "Memproses...";

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Mohon isi semua field.");
    loginButton.disabled = false;
    loginButton.textContent = "Login";
    return;
  }

  try {
    // Panggil endpoint login di backend Anda
    const response = await fetch("https://back-end-skinalyze.onrender.com/api/login", { // Sesuaikan path jika berbeda
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login berhasil, backend mengembalikan data pengguna termasuk token
      if (data.user && data.user.token) {
        sessionStorage.setItem("token", data.user.token);
        // Anda juga bisa menyimpan data lain jika diperlukan, misalnya nama pengguna
        if (data.user.firstName) {
          sessionStorage.setItem("firstName", data.user.firstName);
        }
        if (data.user.lastName) {
          sessionStorage.setItem("lastName", data.user.lastName);
        }
        // Simpan UID jika diperlukan untuk referensi di frontend tanpa decode token
        if (data.user.uid) {
            sessionStorage.setItem("uid", data.user.uid);
        }

        alert(data.message || "Login berhasil!");
        window.location.href = "/index.html"; // Arahkan ke halaman utama atau dashboard
      } else {
        // Respons OK tapi tidak ada token atau data user
        alert(data.error || "Login gagal. Data pengguna tidak lengkap.");
      }
    } else {
      // Login gagal, tampilkan pesan error dari backend
      alert(data.error || `Login gagal (Status: ${response.status})`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat mencoba login. Periksa koneksi Anda.");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});

  if (window.location.pathname.includes("/profile.html")) {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk melihat halaman profil.");
      window.location.href = "/login.html";
      return;
    }

    async function fetchAndDisplayProfileData() {
      try {
        const response = await fetch("https://back-end-skinalyze.onrender.com/api/get-profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const profile = await response.json();
        const profileData = profile.user;

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            alert(
              "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali."
            );
            sessionStorage.removeItem("token");
            window.location.href = "/login.html";
          }
          throw new Error(
            `Gagal mengambil data profil: ${response.statusText}`
          );
        }

        if (profileName)
          profileName.textContent = `${profileData.firstName} ${profileData.lastName}`;
        if (profileGender)
          profileGender.textContent = profileData.gender || "-";
        if (profileAddress)
          profileAddress.textContent = profileData.address || "-";
        if (profileAge) profileAge.textContent = profileData.age || "-";
        if (profilePicture && profileData.profilePictureUrl) {
          profilePicture.src = profileData.profilePictureUrl;
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        if (profileName) profileName.textContent = "Gagal memuat data profil.";
      }
    }

    async function fetchAndDisplayHistoryData() {
      if (!historySectionContent) return;
      historySectionContent.innerHTML =
        '<p class="text-center">Memuat riwayat...</p>';

      try {
        const response = await fetch(`https://back-end-skinalyze.onrender.com/api/get-result`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil riwayat pemeriksaan: ${response.statusText}`
          );
        }

        const historyList = await response.json();
        const result = historyList.results;
        historySectionContent.innerHTML = "";

        if (result.length === 0) {
          historySectionContent.innerHTML =
            '<p class="text-center text-gray-500">Belum ada riwayat pemeriksaan.</p>';
          return;
        }

        result.forEach((item) => {
          const date = new Date(
            item.createdAt._seconds * 1000 +
              item.createdAt._nanoseconds / 1000000
          );
          const formattedDate = `${date.getDate()} ${date.toLocaleString(
            "id-ID",
            { month: "long" }
          )} ${date.getFullYear()}`;
          const riskColor =
            item.risk === "Kanker" ? "text-red-600" : "text-green-600";

          const historyCardHtml = `
            <div class="bg-white rounded-lg shadow-md p-[40px] flex justify-between items-start gap-6 mb-6">
                <div>
                    <p class="text-xl font-semibold mb-2">Hasil: ${
                      item.name || "Tidak Diketahui"
                    }</p>
                    <div class="flex items-center text-gray-600 gap-2 mb-1">
                        <span>📅</span> <span>${formattedDate}</span>
                    </div>
                    <p class="text-gray-700">
                        Risiko: <span class="${riskColor} font-bold">${
            item.risk
          }</span>
                    </p>
                     <p class="text-gray-700">
                        Status: <span class="font-bold">${
                          item.status || "-"
                        }</span>
                    </p>
                </div>
                <div class="text-right self-end">
                    <button data-result='${JSON.stringify(
                      item
                    )}' class="view-detail-btn text-sm text-blue-600 hover:underline flex items-center gap-1">
                        Lihat Detail <span>↗</span>
                    </button>
                </div>
            </div>
          `;
          historySectionContent.insertAdjacentHTML(
            "beforeend",
            historyCardHtml
          );
        });

        document.querySelectorAll(".view-detail-btn").forEach((button) => {
          button.addEventListener("click", (e) => {
            const resultDataString =
              e.currentTarget.getAttribute("data-result");
            try {
              const resultData = JSON.parse(resultDataString);
              localStorage.setItem(
                "predictionResult",
                JSON.stringify({
                  name: resultData.name,
                  risk: resultData.risk,
                  status: resultData.status,
                  saran:
                    resultData.saran ||
                    "Saran tidak tersedia untuk riwayat ini.",
                })
              );
              if (resultData.image) {
                localStorage.setItem("uploadedImage", resultData.image);
              } else {
                localStorage.removeItem("uploadedImage");
              }
              window.location.href = "/hasil.html";
            } catch (parseError) {
              console.error("Gagal memparsing data hasil:", parseError);
              alert("Tidak dapat menampilkan detail hasil.");
            }
          });
        });
      } catch (error) {
        console.error("Error fetching history data:", error);
        historySectionContent.innerHTML =
          '<p class="text-center text-red-500">Gagal memuat riwayat pemeriksaan.</p>';
      }
    }

    fetchAndDisplayProfileData();
    fetchAndDisplayHistoryData();

    filterSelectEl?.addEventListener("change", (e) => {
      fetchAndDisplayHistoryData(e.target.value);
    });
  }
});
