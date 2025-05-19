import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";

document.querySelector("#app").innerHTML = `
  <div class="relative top-0 bg-cover bg-center opcaity-70" style="background-image: url('../public/skin-check.png')">
    <div class="absolute top-0 right-0 w-48 h-48 bg-teal-300 rounded-full opacity-70 z-0"></div>
    <div class="absolute bottom-0 right-0 w-48 h-48 bg-teal-300 rounded-full opacity-70 z-0"></div>

    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-xl px-4 z-10">
        <h1 class="text-6xl font-bold text-blue-900 mb-6">Skinalyze</h1>
        <p class="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat.
        </p>
        <button class="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all text-sm">
          Check Now
        </button>
      </div>
    </div>
  </div>
`;
