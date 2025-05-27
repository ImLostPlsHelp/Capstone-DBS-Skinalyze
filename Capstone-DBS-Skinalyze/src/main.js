async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadComponent('navbar', '/src/component/navbar.html');
loadComponent('hero', '/src/component/hero-banner.html');
// loadComponent('tentang-kami', '/src/components/tentang-kami.html');
// loadComponent('artikel', '/src/components/artikel.html');
// loadComponent('faq', '/src/components/faq.html');
// loadComponent('footer', '/src/component/footer.html');