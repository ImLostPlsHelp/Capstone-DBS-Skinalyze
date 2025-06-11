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
}

// Ambil dari public/component
loadComponent("navbar", "/component/navbar.html");
loadComponent("hero", "/component/hero-banner.html");
loadComponent("tentang-kami", "/component/about-us.html");
loadComponent("artikel", "/component/artikel.html");
// loadComponent('artikel', '/src/components/artikel.html');
loadComponent("faq", "/component/faq.html");
loadComponent("faq-full", "/component/faq-full.html");
loadComponent("footer", "/component/footer.html");

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("upload-picture");
  const fileLabel = document.querySelector('label[for="upload-picture"]');
  const fileInput = document.getElementById("upload-input");
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
  const historySectionContent = document.getElementById("history-section-content");

  let uploadedImage = null;

  uploadBtn?.addEventListener("click", () => {
    fileInput?.click();
  });

  // Handle file input
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileLabel.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.className = "w-full h-full object-contain";
      img.onload = () => (uploadedImage = img);

      // ⬇️ Store image to localStorage
      localStorage.setItem("uploadedImage", evt.target.result);

      cameraPlaceholder.innerHTML = "";
      cameraPlaceholder.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  // Handle "Check Now" button
  checkNowBtn?.addEventListener("click", async () => {
    if (!uploadedImage) {
      alert("Please upload an image first.");
      return;
    }

    // Optional: Show a loading indicator to the user
    const checkNowText = checkNowBtn.textContent;
    checkNowBtn.disabled = true;
    checkNowBtn.textContent = "Menganalisis...";

    try {
      const resultIndex = await predictSkinType(uploadedImage);

      const labelMap = [
        {
          name: "Actinic Keratoses",
          risk: "Bukan Kanker",
          status: "Berbahaya",
        },
        { name: "Basal Cell Carcinoma", risk: "Kanker", status: "Berbahaya" },
        {
          name: "Benign Keratosis-like Lesions",
          risk: "Bukan Kanker",
          status: "Berbahaya",
        },
        {
          name: "Dermatofibroma",
          risk: "Bukan Kanker",
          status: "Tidak Berbahaya",
        },
        { name: "Melanoma", risk: "Kanker", status: "Berbahaya" },
        {
          name: "Melanocytic Nevi",
          risk: "Bukan Kanker",
          status: "Tidak Berbahaya",
        },
        {
          name: "Vascular Lesions",
          risk: "Bukan Kanker",
          status: "Tidak Berbahaya",
        },
      ];

      // 1. Get the initial result from your labelMap
      const result = labelMap[resultIndex];

      const saveResultToFirestore = await fetch("http://localhost:3000/save-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: result.name,
          risk: result.risk,
          status: result.status,
          image: localStorage.getItem("uploadedImage"),
        })
    })

    if(!saveResultToFirestore.ok) {
      throw new Error("Failed to save result to Firestore.");
    }

      // 2. Call your backend to get Groq advice
      const groqResponse = await fetch("http://localhost:3000/get-groq-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disease: result.name }), // Send the disease name
      });

      if (!groqResponse.ok) {
        throw new Error("Failed to get advice from server.");
      }

      const groqData = await groqResponse.json();

      // 3. Add the new dynamic advice to your result object
      result.saran = groqData.advice; // This replaces the static 'saran'

      // 4. Save the COMPLETE result (with Groq advice) to localStorage
      localStorage.setItem("predictionResult", JSON.stringify(result));

      // 5. Redirect to the result page
      window.location.href = "/hasil.html";
    } catch (error) {
      console.error("Prediction or advice generation failed:", error);
      alert("Terjadi kesalahan saat memproses gambar atau mendapatkan saran.");
      // Reset button state on error
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
        const response = await fetch("http://localhost:3000/api/signup", {
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

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("Mohon isi semua field.");
        return;
      }

      try {
        const auth = getAuth(app);
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        if (user) {
          const idToken = await getIdToken(user);
          sessionStorage.setItem("token", idToken);
          window.location.href = "/index.html";
        } else {
          alert("Login gagal. Periksa kembali email dan password.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat login.");
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
        const response = await fetch("http://localhost:3000/get-profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const profile = await response.json();
        const profileData = profile.user;

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            alert("Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.");
            sessionStorage.removeItem("token");
            window.location.href = "/login.html";
          }
          throw new Error(`Gagal mengambil data profil: ${response.statusText}`);
        }

        if (profileName) profileName.textContent = `${profileData.firstName} ${profileData.lastName}`;
        if (profileGender) profileGender.textContent = profileData.gender || "-";
        if (profileAddress) profileAddress.textContent = profileData.address || "-";
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
      historySectionContent.innerHTML = '<p class="text-center">Memuat riwayat...</p>';

      try {
        const response = await fetch(`http://localhost:3000/get-result`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil riwayat pemeriksaan: ${response.statusText}`);
        }

        const historyList = await response.json();
        const result = historyList.results;
        historySectionContent.innerHTML = "";

        if (result.length === 0) {
          historySectionContent.innerHTML = '<p class="text-center text-gray-500">Belum ada riwayat pemeriksaan.</p>';
          return;
        }

        result.forEach(item => {
          const date = new Date(item.createdAt._seconds * 1000 + item.createdAt._nanoseconds / 1000000);
          const formattedDate = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'long' })} ${date.getFullYear()}`;
          const riskColor = item.risk === "Kanker" ? "text-red-600" : "text-green-600";

          const historyCardHtml = `
            <div class="bg-white rounded-lg shadow-md p-[40px] flex justify-between items-start gap-6 mb-6">
                <div>
                    <p class="text-xl font-semibold mb-2">Hasil: ${item.name || 'Tidak Diketahui'}</p>
                    <div class="flex items-center text-gray-600 gap-2 mb-1">
                        <span>📅</span> <span>${formattedDate}</span>
                    </div>
                    <p class="text-gray-700">
                        Risiko: <span class="${riskColor} font-bold">${item.risk}</span>
                    </p>
                     <p class="text-gray-700">
                        Status: <span class="font-bold">${item.status || '-'}</span>
                    </p>
                </div>
                <div class="text-right self-end">
                    <button data-result='${JSON.stringify(item)}' class="view-detail-btn text-sm text-blue-600 hover:underline flex items-center gap-1">
                        Lihat Detail <span>↗</span>
                    </button>
                </div>
            </div>
          `;
          historySectionContent.insertAdjacentHTML('beforeend', historyCardHtml);
        });
        
        document.querySelectorAll('.view-detail-btn').forEach(button => {
            button.addEventListener('click', (e) => {
              const resultDataString = e.currentTarget.getAttribute('data-result');
              try {
                const resultData = JSON.parse(resultDataString);
                localStorage.setItem('predictionResult', JSON.stringify({
                  name: resultData.name,
                  risk: resultData.risk,
                  status: resultData.status,
                  saran: resultData.saran || "Saran tidak tersedia untuk riwayat ini.",
                }));
                if (resultData.image) {
                    localStorage.setItem('uploadedImage', resultData.image);
                } else {
                    localStorage.removeItem('uploadedImage');
                }
                window.location.href = '/hasil.html';
              } catch (parseError) {
                  console.error("Gagal memparsing data hasil:", parseError);
                  alert("Tidak dapat menampilkan detail hasil.");
              }
            });
          });

      } catch (error) {
        console.error("Error fetching history data:", error);
        historySectionContent.innerHTML = '<p class="text-center text-red-500">Gagal memuat riwayat pemeriksaan.</p>';
      }
    }

    fetchAndDisplayProfileData();
    fetchAndDisplayHistoryData();

    filterSelectEl?.addEventListener('change', (e) => {
        fetchAndDisplayHistoryData(e.target.value);
    });
  }
});
