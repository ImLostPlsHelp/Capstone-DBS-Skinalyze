async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

// Ambil dari public/component
loadComponent('navbar', '/component/navbar.html');
loadComponent('hero', '/component/hero-banner.html');
loadComponent('tentang-kami', '/component/about-us.html');
loadComponent('artikel', '/component/artikel.html');
// loadComponent('artikel', '/src/components/artikel.html');
loadComponent('faq', '/component/faq.html');
loadComponent('faq-full', '/component/faq-full.html');
loadComponent('footer', '/component/footer.html');
