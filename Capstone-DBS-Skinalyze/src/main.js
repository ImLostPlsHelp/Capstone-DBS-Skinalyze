async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadComponent("navbar", "/src/components/navbar.html");
loadComponent("hero", "/src/components/hero-banner.html");
