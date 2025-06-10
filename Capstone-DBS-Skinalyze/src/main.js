import { predictSkinType } from './predict/predict.js';
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
  const res  = await fetch(path);
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

  let uploadedImage = null;

    uploadBtn?.addEventListener('click', () => {
    fileInput?.click();
  });

  // Handle file input
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileLabel.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.className = 'w-full h-full object-contain';
      img.onload = () => selectedImage = img;

      // ⬇️ Store image to localStorage
      localStorage.setItem('uploadedImage', evt.target.result);

      cameraPlaceholder.innerHTML = '';
      cameraPlaceholder.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  // Handle "Check Now" button
  checkNowBtn?.addEventListener('click', async () => {
  if (!selectedImage) {
    alert('Please upload an image first.');
    return;
  }

  // Optional: Show a loading indicator to the user
  const checkNowText = checkNowBtn.textContent;
  checkNowBtn.disabled = true;
  checkNowBtn.textContent = 'Menganalisis...';

  try {
    const resultIndex = await predictSkinType(selectedImage);

    const labelMap = [
        { name: 'Actinic Keratoses', risk: 'Bukan Kanker', status: 'Berbahaya' },
        { name: 'Basal Cell Carcinoma', risk: 'Kanker', status: 'Berbahaya' },
        { name: 'Benign Keratosis-like Lesions', risk: 'Bukan Kanker', status: 'Berbahaya' },
        { name: 'Dermatofibroma', risk: 'Bukan Kanker', status: 'Tidak Berbahaya' },
        { name: 'Melanoma', risk: 'Kanker', status: 'Berbahaya' },
        { name: 'Melanocytic Nevi', risk: 'Bukan Kanker', status: 'Tidak Berbahaya' },
        { name: 'Vascular Lesions', risk: 'Bukan Kanker', status: 'Tidak Berbahaya' }
    ];

    // 1. Get the initial result from your labelMap
    const result = labelMap[resultIndex];

    // 2. Call your backend to get Groq advice
    const groqResponse = await fetch('/get-groq-advice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disease: result.name }), // Send the disease name
    });

    if (!groqResponse.ok) {
        throw new Error('Failed to get advice from server.');
    }

    const groqData = await groqResponse.json();

    // 3. Add the new dynamic advice to your result object
    result.saran = groqData.advice; // This replaces the static 'saran'

    // 4. Save the COMPLETE result (with Groq advice) to localStorage
    localStorage.setItem('predictionResult', JSON.stringify(result));

    // 5. Redirect to the result page
    window.location.href = '/hasil.html';

  } catch (error) {
    console.error('Prediction or advice generation failed:', error);
    alert('Terjadi kesalahan saat memproses gambar atau mendapatkan saran.');
    // Reset button state on error
    checkNowBtn.disabled = false;
    checkNowBtn.textContent = checkNowText;
  }
});

  // Handle "Check Again" button on result page
  checkAgainBtn?.addEventListener('click', () => {
    window.location.href = '/skin-check.html';

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in:", user.email);
    } else {
      console.log("User not logged in");
    }
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

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Mohon isi semua field.');
      return;
    }

    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        const idToken = await getIdToken(user);
        localStorage.setItem('token', idToken);
        window.location.href = '/index.html';
      } else {
        alert('Login gagal. Periksa kembali email dan password.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat login.');
    }
  });
});