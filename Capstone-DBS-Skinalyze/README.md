# Skinalyze - Deteksi Dini Kanker Kulit dengan Model Convolutional Neural Network berbasis Website Responsif.

## Akses Website

Website: https://capstone-dbs-skinalyze.vercel.app

# Fitur

- **Deteksi Kanker Kulit**: Upload gambar dan dapatkan analisis menggunakan model machine learning
- **UV Index Checker**: Cek indeks UV real-time berdasarkan lokasi
- **Saran AI**: Dapatkan saran kesehatan dari AI
- **Autentikasi**: Sistem login/register dengan Firebase
- **Responsive Design**: Interface yang mobile-friendly

# Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Machine Learning**: TensorFlow.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: AI Assistant
- **Build Tool**: Vite

# Prerequisites

- **Node.js** (v16 atau lebih tinggi)
- **npm** atau **yarn**
- **Git**

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/ImLostPlsHelp/Capstone-DBS-Skinalyze.git
cd Capstone-DBS-Skinalyze
```

## Install Dependencies

```bash
npm install
```

**Dependencies yang dibutuhkan:**

```bash
npm install express dotenv firebase @tensorflow/tfjs vite
```

## Setup Environment Variables

Buat file `.env` di root directory:

```env
# Server Port
PORT=8000
```

## Firebase Configuration

Buat file `src/config.js` dengan konfigurasi Firebase Anda sendiri.

## Model Machine Learning

Pastikan model TensorFlow.js tersedia di folder `public/model/`:

<pre>
public/
└── model/
    ├── model.json
    ├── weights.bin
    └── metadata.json
</pre>

# Running the Application

## Start Backend Server

```bash
node server.js
```

Output yang diharapkan:

```
Server running on port 8000
```

## Start Frontend

```bash
npm run dev
```

Output yang diharapkan:

```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

# Project Structure

<pre>
Capstone-DBS-Skinalyze/
├── .env                    # Environment variables
├── server.js              # Backend server
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── src/
│   ├── main.js           # Main JavaScript file
│   ├── config.js         # Firebase config
│   ├── predict/
│   │   └── predict.js    # ML prediction logic
│   └── uvcheck-init.js   # UV checker initialization
├── public/
│   ├── index.html        # Main HTML
│   ├── skin-check.html   # Skin check page
│   ├── hasil.html        # Results page
│   ├── component/        # Reusable components
│   │   ├── navbar.html
│   │   ├── hero-banner.html
│   │   ├── UVCheck.html
│   │   └── ...
│   └── model/           # TensorFlow.js model files
│       ├── model.json
│       └── weights.bin
└── README.md
</pre>

# Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start backend server
node server.js
```

# Testing

## Test Model Prediction:

1. Upload gambar kulit di halaman skin check
2. Klik "Analyze Now"
3. Tunggu hasil analisis
4. Lihat hasil dan saran AI

## Test UV Checker:

1. Allow location permission
2. Lihat indeks UV real-time
3. Baca rekomendasi perlindungan

# Troubleshooting

## Common Issues:

**1. Firebase Import Error:**

```bash
npm install firebase
```

**2. TensorFlow.js Error:**

```bash
npm install @tensorflow/tfjs
```

**3. Server Connection Error:**

```
ECONNREFUSED
```

**Solution:** Pastikan backend server berjalan di port 8000

**4. Model Loading Error:**

```
Failed to load model
```

**Solution:** Pastikan file model tersedia di `public/model/`

# Deployment

## Build for Production:

```bash
npm run build
```

## Deploy Backend:

1. **Heroku:**

   ```bash
   heroku create your-app-name
   git push heroku main
   ```

2. **Vercel/Netlify:**
   - Upload build folder
   - Set environment variables
   - Configure API routes

## Deploy Frontend:

```bash
npm run build
# Upload dist/ folder to hosting service
```
