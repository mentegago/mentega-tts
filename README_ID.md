# 🧈 Mentega Text-to-Speech 🧈
Sebuah Text-to-Speech untuk chat Twitch sederhana dengan dukungan tiga bahasa (🇮🇩 Indonesian, 🇺🇸 English, and 🇯🇵 Japanese) sekaligus (meskipun tidak andal). Silakan follow Twitch saya di [https://www.twitch.tv/mentegagoreng](https://www.twitch.tv/mentegagoreng) kalau ingin melihat TTSnya. *Atau follow aja sih tanpa alasan spesifik...*

## Instalasi
Perangkat lunak ini berjalan di web, jadi Anda bisa membuka URLnya langsung di-browser atau menggunakan OBS browser source. Saya lebih suka menggunakan OBS browser source karena lebih mudah buat mengatur audionya, seperti volume atau audio track.

1. Unduh file [di sini](https://github.com/mentegago/mentega-tts/releases/latest).
2. Unzip dan buka `index.html`.
3. Tambahkan kode di bawah ini **di akhir** dari URLnya:

````
#channel={target channel}
````

4. Isi parameter-parameter tersebut dengan ketentuan sebagai berikut:

Parameters:
- `channel`: Channel Anda.
- (_Optional, currently unused_) `token`: OAuth Token akun Twitch Anda. Dapatkan token di sini: [https://twitchapps.com/tmi/](https://twitchapps.com/tmi/).
- (_Optional, currently unused_) `username`: Username Anda.
- (_Optional_) `hideNotifications`: beri nilai `true` untuk menghilangkan notifikasi status yang muncul di atas kiri layar.

Parameter-parameter tersebut ditaruh di hash (`#`), bukan query (`?`), supaya OAuth token Anda tidak terkirim kemanapun selain ke Twitch.

Peringatan! Jika Anda membuka URL tersebut di browser biasa, pastikan Anda:
1. **Refresh halamannya** tiap kali Anda mengubah nilai dari parameter di atas.
2. **Klik terlebih dahulu halamannya** kalau tidak audionya akan diblokir oleh browser. Alternatifnya, Anda bisa mengizinkan halaman tersebut untuk melakukan autoplay audio.

## Belum diimplementasikan
- TTS akan selalu mengabaikan chat yang diawali dengan tanda seru (`!`).
- TTS membatasi maksimal 200 karakter per pesan.
- *Queue* dari TTS dibatasi 5 pesan. Jika ada chat lain yang masuk ke *queue*, maka pesan paling awal akan dihapus.
- Hanya mendukung Bahasa Indonesia, Inggris, dan Jepang. Belum ada rencana menambahkan bahasa lain.

## Kontribusi
Jika Anda memiliki saran atau menemukan bug, silakan submit Issue. Jika Anda ingin mengkontribusikan kode, silakan submit Pull Request.

## Building
Mentega TTS dibangun menggunakan framework JavaScript terbaik, yakni [VanillaJS](http://vanilla-js.com/)🙂. Tidak perlu building, cukup pastikan bahwa browser Anda cukup baru karena kode dari Mentega TTS menggunakan JavaScript modern tanpa polyfill.

## Lisensi
[MIT License](LICENSE)
