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
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
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

  uploadBtn?.addEventListener("click", () => {
    fileInput?.click();
  });

  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadedImage = file;
      fileLabel.textContent = file.name;

      const reader = new FileReader();
      reader.onload = function (evt) {
        cameraPlaceholder.innerHTML = `
          <img
            src="${evt.target.result}"
            alt="Preview"
            class="w-full h-full object-contain"
          />
        `;
      };
      reader.readAsDataURL(file);
    }
  });

  checkNowBtn?.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    const idToken = await user.getIdToken();

    const formData = new FormData();
    formData.append("image", uploadedImage);

    const response = await fetch("https://your-backend-url.com/api/scan", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem("scanResult", JSON.stringify(result));
      window.location.href = "/hasil.html";
    } else {
      alert("Gagal menganalisis gambar.");
      console.error(result);
    }
  });

  CheckAgainBtn?.addEventListener("click", () => {
    window.location.href = "/skin-check.html";
  });

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
