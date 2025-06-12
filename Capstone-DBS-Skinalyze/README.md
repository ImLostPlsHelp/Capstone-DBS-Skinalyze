# Skinalyze - Deteksi Dini Kanker Kulit dengan Model Convolutional Neural Network berbasis Website Responsif.

# Live Demo

# Fitur

- **Deteksi Kanker Kulit**: Upload gambar dan dapatkan analisis menggunakan model machine learning
- **UV Index Checker**: Cek indeks UV real-time berdasarkan lokasi
- **Saran AI**: Dapatkan saran kesehatan dari Groq AI
- **Autentikasi**: Sistem login/register dengan Firebase
- **Responsive Design**: Interface yang mobile-friendly

# Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Machine Learning**: TensorFlow.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: Groq API
- **Build Tool**: Vite
- **Weather API**: OpenWeatherMap

# Prerequisites

- **Node.js** (v16 atau lebih tinggi)
- **npm** atau **yarn**
- **Git**

# Installation & Setup

## Clone Repository

git clone https://github.com/ImLostPlsHelp/Capstone-DBS-Skinalyze.git
cd Capstone-DBS-Skinalyze

## Install Dependencies

npm install

## Dependencies yang dibutuhkan:

npm install express groq-sdk dotenv firebase @tensorflow/tfjs vite

## Setup Environment Variables

Buat file `.env` di root directory:

env

## Server Port

PORT=8000

## Model Machine Learning

Pastikan model TensorFlow.js tersedia di folder `public/model/`:

public/
└── model/
├── model.json
├── weights.bin
└── metadata.json

## Running the Application

## Start Backend Server

node server.js

Output yang diharapkan:
Server running on port 8000

## Start Frontend

npm run dev

Output yang diharapkan:
VITE v4.x.x ready in xxx ms

➜ Local: http://localhost:5173/
➜ Network: use --host to expose

# Akses Aplikasi

Buka browser dan kunjungi:

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:8000/

# Project Structure

Capstone-DBS-Skinalyze/
├── .env # Environment variables
├── server.js # Backend server
├── package.json # Dependencies
├── vite.config.js # Vite configuration
├── src/
│ ├── main.js # Main JavaScript file
│ ├── config.js # Firebase config
│ ├── predict/
│ │ └── predict.js # ML prediction logic
│ └── uvcheck-init.js # UV checker initialization
├── public/
│ ├── index.html # Main HTML
│ ├── skin-check.html # Skin check page
│ ├── hasil.html # Results page
│ ├── component/ # Reusable components
│ │ ├── navbar.html
│ │ ├── hero-banner.html
│ │ ├── UVCheck.html
│ │ └── ...
│ └── model/ # TensorFlow.js model files
│ ├── model.json
│ └── weights.bin
└── README.md

# Available Scripts

# Start development server

npm run dev

# Build for production

npm run build

# Preview production build

npm run preview

# Start backend server

node server.js

# API Endpoints

### Backend API Routes:

- `POST /get-groq-advice`: Mendapatkan saran AI berdasarkan hasil deteksi
- `POST /api/signup`: Registrasi user baru
- `GET /health`: Health check endpoint

# Testing

# Test Model Prediction:

1. Upload gambar kulit di halaman skin check
2. Klik "Analyze Now"
3. Tunggu hasil analisis
4. Lihat hasil dan saran AI

# Test UV Checker:

1. Allow location permission
2. Lihat indeks UV real-time
3. Baca rekomendasi perlindungan

#Deploy Backend:

1. **Heroku:**

   ```bash
   heroku create your-app-name
   heroku config:set GROQ_API_KEY=your_key
   git push heroku main
   ```

2. **Vercel/Netlify:**
   - Upload build folder
   - Set environment variables
   - Configure API routes

### Deploy Frontend:

```bash
npm run build
```
