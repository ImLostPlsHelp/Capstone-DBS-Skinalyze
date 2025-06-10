async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
  
  // Khusus untuk UV Check, load script dan jalankan
  if (id === 'UVCheck') {
    loadUVCheckScript();
  }
}

// Function untuk memuat dan menjalankan UV Check script
function loadUVCheckScript() {
  const script = document.createElement('script');
  script.src = '/src/uvcheck-init.js';
  script.onload = () => {
    // Tunggu sebentar untuk memastikan elemen sudah dimuat
    setTimeout(() => {
      if (typeof window.initUVCheck === 'function') {
        window.initUVCheck();
      } else {
        console.error('UV Check function not loaded');
      }
    }, 100);
  };
  script.onerror = () => {
    console.error('Failed to load UV Check script');
  };
  document.head.appendChild(script);
}

// Ambil dari public/component
loadComponent('navbar', '/component/navbar.html');
loadComponent('hero', '/component/hero-banner.html');
loadComponent('tentang-kami', '/component/about-us.html');
loadComponent('artikel', '/component/artikel.html');
loadComponent('UVCheck', '/component/UVCheck.html');
loadComponent('faq', '/component/faq.html');
loadComponent('faq-full', '/component/faq-full.html');
loadComponent('footer', '/component/footer.html');

document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('upload-picture');
  const fileLabel = document.querySelector('label[for="upload-picture"]');
  const fileInput = document.getElementById('upload-input');
  const cameraPlaceholder = document.querySelector('.camera-placeholder');
  const checkNowBtn = document.getElementById('check-skin');
  const CheckAgainBtn = document.getElementById('check-again');

  uploadBtn?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileLabel.textContent = file.name;

      const reader = new FileReader();
      reader.onload = function(evt) {
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

  checkNowBtn?.addEventListener('click', () => {
    // TODO: Call API periksa gambar pakai model dari tensorflow.js
    window.location.href = '/hasil.html';
  });

  CheckAgainBtn?.addEventListener('click', () => {
    window.location.href = '/skin-check.html';
  });
});