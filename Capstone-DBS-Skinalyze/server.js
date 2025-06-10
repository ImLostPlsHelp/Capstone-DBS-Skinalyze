// //ini masuk route backend

// import express from 'express';
// import Groq from 'groq-sdk';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// app.use(express.json());

// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY
// });

// app.post('/get-groq-advice', async (req, res) => {
//     const { disease } = req.body;

//     if (!disease) {
//         return res.status(400).json({ error: 'Disease name is required' });
//     }

//     try {
//         const chatCompletion = await groq.chat.completions.create({
//             messages: [
//                  {
//                     role: 'system',
//                     content: "Anda adalah asisten kesehatan virtual yang memberikan informasi umum dalam Bahasa Indonesia. Jangan pernah memberikan diagnosis atau resep medis. Jelaskan secara singkat apa itu kondisi kulit yang disebutkan, lalu berikan beberapa tips perawatan umum yang aman dan tidak bersifat medis. Selalu akhiri dengan peringatan untuk berkonsultasi dengan dokter profesional."
//                 },
//                 {
//                     role: 'user',
//                     content: `Tolong berikan informasi dan saran umum untuk kondisi: ${disease}`
//                 }
//             ],
//             model: 'llama3-8b-8192',
//             temperature: 0.7,
//         });

//         const advice = chatCompletion.choices[0]?.message?.content || 'Saran tidak dapat dibuat saat ini.';
//         res.json({ advice });

//     } catch (error) {
//         console.error('Error calling Groq API:', error);
//         res.status(500).json({ error: 'Failed to generate advice' });
//     }
// });

// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => {
// //     console.log(`Server running on port ${PORT}`);
// // });