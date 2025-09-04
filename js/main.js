// ===================================================================
// KODE JAVASCRIPT FINAL - VERSI YANG SUDAH DIPERBAIKI
// ===================================================================

// URL Script Google Anda
const scriptURL =
  "https://script.google.com/macros/s/AKfycbx0ZVUEmiKDAzd4iyybj47-VbFG8_z1FL1F06I2RGSzZtbjwf8gTbnme-zuDvd3xsrA/exec";

// Menjalankan semua kode setelah halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  // --- BAGIAN 1: DEKLARASI SEMUA ELEMEN ---
  const cover = document.getElementById("cover");
  const content = document.getElementById("content");
  const openButton = document.getElementById("open-invitation");
  const music = document.getElementById("gamelan-music");
  const musicController = document.getElementById("music-controller");
  const musicIcon = musicController ? musicController.querySelector("i") : null;
  let isMusicPlaying = false;
  const rsvpModalElement = document.getElementById("rsvpModal");
  const rsvpModal = rsvpModalElement
    ? new bootstrap.Modal(rsvpModalElement)
    : null;
  const form = document.getElementById("rsvp-form-modal");
  const submitButton = document.getElementById("submit-button");
  const buttonText = document.getElementById("button-text");
  const buttonSpinner = document.getElementById("button-spinner");
  const konfirmasiSelect = document.getElementById("konfirmasi");
  const jumlahTamuWrapper = document.getElementById("jumlah-tamu-wrapper");
  const wishWall = document.getElementById("wish-wall");
  const loadingWishes = document.getElementById("loading-wishes");
  const copyButtons = document.querySelectorAll(".btn-copy");
  const countdownContainer = document.getElementById("timer-container");
  const countdownExpired = document.getElementById("countdown-expired");
  const footer = document.getElementById("main-footer");
  // Sembunyikan saat cover tampil
  if (musicController) musicController.style.display = "none";
  if (footer) footer.style.display = "none";

  
  // --- BAGIAN 2: FUNGSI PEMBANTU (HELPER FUNCTIONS) ---
  function addWishToWall(nama, ucapan, konfirmasi, rowNumber) {
    if (!wishWall) return;
    let statusBadge = "";
    if (konfirmasi === "Akan Hadir") {
      statusBadge = `<span class="card-status badge-hadir">Akan Hadir</span>`;
    } else if (konfirmasi === "Tidak Dapat Hadir") {
      statusBadge = `<span class="card-status badge-tidak-hadir">Tidak Dapat Hadir</span>`;
    }
    const newWishHTML = `
            <div class="wish-card" id="row-${rowNumber}">
                <button class="btn-delete" data-row="${rowNumber}" title="Hapus ucapan ini">&times;</button>
                <div class="card-name">${nama} ${statusBadge}</div>
                <p class="card-text">\"${ucapan}\"</p>
            </div>`;
    wishWall.insertAdjacentHTML("afterbegin", newWishHTML);
  }

  function updateMusicControllerVisuals() {
    if (!musicController || !musicIcon) return;
    if (isMusicPlaying) {
      musicController.classList.add("playing");
      musicIcon.className = "bi bi-pause-circle-fill";
    } else {
      musicController.classList.remove("playing");
      musicIcon.className = "bi bi-play-circle-fill";
    }
  }

  // --- BAGIAN 3: INISIALISASI & LOGIKA UTAMA ---
  // Logika untuk membuka sampul (cover)
  if (openButton) {
    openButton.addEventListener("click", () => {
      // 1. Mainkan musik & update ikon
      if (music) {
        music.play().catch((e) => console.error("Gagal memutar musik:", e));
        isMusicPlaying = true;
        updateMusicControllerVisuals();
      }

      // 2. Animasi fade out untuk cover
      cover.style.transition = "opacity 1s ease-out, transform 1s ease-out";
      cover.style.opacity = "0";
      cover.style.transform = "scale(1.2)";

      // 3. Setelah animasi selesai, tampilkan konten utama
      setTimeout(() => {
        cover.classList.add("d-none");
        if (content) content.classList.remove("d-none");
        
        // 4. Tambahkan class ke body untuk padding navbar
        document.body.classList.add("content-visible");

        // 5. Tampilkan music controller & footer
        if (musicController) musicController.style.display = "flex";
        if (footer) footer.style.display = "block";
        
        // 6. Jalankan animasi GSAP
        setupGsapAnimations();

      }, 1000); // Samakan dengan durasi transisi
    });
  }

  // Logika untuk tombol kontroler musik
  if (musicController) {
    musicController.addEventListener("click", () => {
      if (isMusicPlaying) {
        music.pause();
      } else {
        music.play();
      }
      isMusicPlaying = !isMusicPlaying;
      updateMusicControllerVisuals();
    });
  }

  // Logika auto-pause/play saat pindah tab
  document.addEventListener("visibilitychange", () => {
    if (!music) return;
    if (document.visibilityState === "hidden") {
      music.pause();
    } else if (document.visibilityState === "visible" && isMusicPlaying) {
      music.play();
    }
  });

  // Memuat ucapan awal dari Google Sheets
  if (wishWall) {
    fetch(scriptURL)
      .then((response) => response.json())
      .then((data) => {
        if (loadingWishes) loadingWishes.style.display = "none";
        data.reverse().forEach((wish) => {
          addWishToWall(
            wish.Nama,
            wish.Ucapan,
            wish.Konfirmasi,
            wish.rowNumber
          );
        });
      })
      .catch((error) => {
        if (loadingWishes) loadingWishes.textContent = "Gagal memuat ucapan.";
        console.error("Error loading wishes!", error);
      });
  }

  // ================================================= ================
  // GANTI SEMUA KODE COPY LAMA (forEach + 2 fungsi) DENGAN INI
  // ================================================= ================

  // 5a. Logika untuk tombol Salin (Copy) - VERSI TAHAN BANTING
  copyButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const buttonElement = e.currentTarget; // Simpan referensi tombol di awal
      const textToCopy = buttonElement.dataset.copy;

      // Fungsi untuk menampilkan pesan sukses, sekarang ada di dalam lingkup listener
      const showSuccess = () => {
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = "Berhasil Disalin!";
        buttonElement.disabled = true;
        setTimeout(() => {
          buttonElement.innerHTML = originalText;
          buttonElement.disabled = false;
        }, 2000);
      };

      // Metode Modern (Prioritas Utama)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(showSuccess)
          .catch((err) => {
            console.warn("Metode modern gagal, mencoba metode klasik:", err);
            // Jika gagal, coba Metode Klasik
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "absolute";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.select();
            try {
              if (document.execCommand("copy")) {
                showSuccess(); // Panggil fungsi sukses
              } else {
                throw new Error("execCommand returned false.");
              }
            } catch (e) {
              console.error("Metode klasik juga gagal:", e);
              alert(
                "Maaf, fitur salin otomatis gagal di browser Anda. Mohon salin secara manual."
              );
            } finally {
              document.body.removeChild(textArea);
            }
          });
      } else {
        // Jika browser tidak punya Clipboard API, langsung ke metode klasik
        console.warn(
          "Clipboard API tidak tersedia, menggunakan metode klasik."
        );
        // (Kode metode klasik diulang di sini untuk kasus ini)
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          if (document.execCommand("copy")) {
            showSuccess();
          } else {
            throw new Error("execCommand returned false.");
          }
        } catch (e) {
          console.error("Metode klasik gagal:", e);
          alert(
            "Maaf, fitur salin otomatis gagal di browser Anda. Mohon salin secara manual."
          );
        } finally {
          document.body.removeChild(textArea);
        }
      }
    });
  });
  // Logika untuk form RSVP
  if (form) {
    konfirmasiSelect.addEventListener("change", function () {
      if (jumlahTamuWrapper)
        jumlahTamuWrapper.style.display =
          this.value === "Akan Hadir" ? "block" : "none";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      buttonText.classList.add("d-none");
      buttonSpinner.classList.remove("d-none");
      submitButton.disabled = true;
      const formData = new FormData(form);
      const nama = formData.get("Nama");
      const ucapan = formData.get("Ucapan");
      const konfirmasi = formData.get("Konfirmasi");
      fetch(scriptURL, { method: "POST", body: formData })
        .then((res) => res.json())
        .then((data) => {
          addWishToWall(nama, ucapan, konfirmasi, data.row);
          if (rsvpModal) rsvpModal.hide();
          form.reset();
          if (jumlahTamuWrapper) jumlahTamuWrapper.style.display = "none";
        })
        .catch((error) => {
          console.error("Error!", error.message);
        })
        .finally(() => {
          buttonText.classList.remove("d-none");
          buttonSpinner.classList.add("d-none");
          submitButton.disabled = false;
        });
    });
  }

  // Logika untuk menghapus ucapan
  if (wishWall) {
    wishWall.addEventListener("click", function (e) {
      if (e.target && e.target.classList.contains("btn-delete")) {
        const rowNumber = e.target.dataset.row;
        if (!confirm("Anda yakin ingin menghapus ucapan ini?")) return;
        const password = prompt("Untuk keamanan, masukkan password admin:");
        if (password === null) return;
        const cardToDelete = document.getElementById(`row-${rowNumber}`);
        e.target.disabled = true;
        e.target.innerHTML = "...";
        const deleteFormData = new FormData();
        deleteFormData.append("action", "delete");
        deleteFormData.append("row", rowNumber);
        deleteFormData.append("password", password);
        fetch(scriptURL, { method: "POST", body: deleteFormData })
          .then((res) => res.json())
          .then((data) => {
            if (data.result === "success") {
              cardToDelete.style.transition = "opacity 0.5s";
              cardToDelete.style.opacity = "0";
              setTimeout(() => cardToDelete.remove(), 500);
            } else {
              alert(data.message || "Gagal menghapus. Cek password Anda.");
              e.target.disabled = false;
              e.target.innerHTML = "&times;";
            }
          })
          .catch((error) => {
            alert("Terjadi kesalahan. Gagal menghapus.");
            console.error("Error!", error.message);
            e.target.disabled = false;
            e.target.innerHTML = "&times;";
          });
      }
    });
  }

  // Logika untuk countdown timer
  if (countdownContainer) {
    const weddingDate = new Date("Oct 29, 2025 09:00:00").getTime();
    const countdownFunction = setInterval(function () {
      const now = new Date().getTime();
      const distance = weddingDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const daysEl = document.getElementById("days");
      const hoursEl = document.getElementById("hours");
      const minutesEl = document.getElementById("minutes");
      const secondsEl = document.getElementById("seconds");
      if (daysEl) daysEl.innerHTML = String(days).padStart(2, "0");
      if (hoursEl) hoursEl.innerHTML = String(hours).padStart(2, "0");
      if (minutesEl) minutesEl.innerHTML = String(minutes).padStart(2, "0");
      if (secondsEl) secondsEl.innerHTML = String(seconds).padStart(2, "0");
      if (distance < 0) {
        clearInterval(countdownFunction);
        countdownContainer.classList.add("d-none");
        if (countdownExpired) countdownExpired.classList.remove("d-none");
      }
    }, 1000);
  }

  // --- BAGIAN 4: LOGIKA UNTUK NAVBAR ACTIVE LINK HIGHLIGHTING ---
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  if (sections.length > 0 && navLinks.length > 0) {
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    const sectionId = section.getAttribute("id");
                    navLinks.forEach(link => {
                        link.classList.remove("active");
                        if (link.getAttribute("href") === `#${sectionId}`) {
                            link.classList.add("active");
                        }
                    });
                }
            }
        });
    });
  }
  
  // --- BAGIAN 5: ANIMASI GSAP & SCROLLTRIGGER ---
  function setupGsapAnimations() {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      // Fungsi untuk animasi smooth scroll
      const navLinks = document.querySelectorAll('.navbar a[href^="#"]');
      navLinks.forEach(link => {
          link.addEventListener('click', function(e) {
              e.preventDefault();
              const targetId = this.getAttribute('href');
              const targetElement = document.querySelector(targetId);
              if (targetElement) {
                  gsap.to(window, {
                      duration: 1.5,
                      scrollTo: {
                          y: targetElement,
                          offsetY: 20 // Offset agar tidak terlalu mepet
                      },
                      ease: "power3.inOut"
                  });
              }
          });
      });

      // Animasi default untuk elemen teks umum
      const textElements = gsap.utils.toArray('#quote p, #quote footer, #mempelai h2, #mempelai p, #acara h2, #acara p, #rsvp h2, #rsvp p, #gift h2, #gift p, #closing h2, #closing p, #closing h1');
      textElements.forEach(el => {
          gsap.from(el, {
              opacity: 0,
              y: 40,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                  trigger: el,
                  start: 'top 90%',
                  toggleActions: 'play none none none',
              }
          });
      });

      // Animasi khusus untuk #quote
      gsap.from("#quote .bi-quote", {
          scale: 0,
          rotation: 360,
          duration: 1.5,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: "#quote"
      });

      // Animasi khusus untuk #mempelai
      gsap.from(".mempelai-pria", { xPercent: -50, opacity: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: ".mempelai-pria", start: "top 80%" } });
      gsap.from(".mempelai-wanita", { xPercent: 50, opacity: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: ".mempelai-wanita", start: "top 80%" } });
      gsap.from("#mempelai .wayang-photo", {
          scale: 0.5,
          duration: 1.5,
          ease: "elastic.out(1, 0.75)",
          stagger: 0.5,
          scrollTrigger: { trigger: "#mempelai .wayang-photo", start: "top 80%" }
      });
      gsap.from("#mempelai .d-none.d-md-block span", {
          scale: 0,
          duration: 1,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: "#mempelai .d-none.d-md-block span", start: "top 80%" }
      });

      // Animasi untuk kartu #acara
      gsap.from("#acara .card", {
          scale: 0.8,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: "#acara .card", start: "top 80%" }
      });

      // Animasi untuk countdown
      gsap.from(".timer-box", {
          y: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: { trigger: ".timer-box", start: "top 90%" }
      });

      // Animasi untuk #gift cards
      gsap.from("#gift .gift-card", {
          y: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.3,
          ease: "power2.out",
          scrollTrigger: {
              trigger: "#gift .gift-card",
              start: "top 85%"
          }
      });
      
      // Animasi untuk #closing
      gsap.from("#closing h2", {
          scale: 0.5,
          duration: 1,
          ease: "back.out(1.7)",
          scrollTrigger: "#closing"
      });
  }
}); // --- AKHIR DARI DOMContentLoaded ---
