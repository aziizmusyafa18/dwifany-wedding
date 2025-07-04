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
  const animatedElements = document.querySelectorAll(".anim-child");

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
                <p class="card-text">"${ucapan}"</p>
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

  // Logika untuk animasi on scroll kustom
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  // Logika untuk membuka sampul (cover)
  if (openButton) {
    openButton.addEventListener("click", () => {
      if (music) {
        music.play().catch((e) => console.error("Gagal memutar musik:", e));
        isMusicPlaying = true;
        updateMusicControllerVisuals();
      }
      cover.style.transition = "opacity 1s ease-out, transform 1s ease-out";
      cover.style.opacity = "0";
      cover.style.transform = "scale(1.2)";
      setTimeout(() => {
        cover.classList.add("d-none");
        if (content) content.classList.remove("d-none");
      }, 1000);
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

  // Logika untuk tombol Salin (Copy)
  copyButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const textToCopy = e.currentTarget.dataset.copy;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          const originalText = e.currentTarget.innerHTML;
          e.currentTarget.innerHTML = "Berhasil Disalin!";
          e.currentTarget.disabled = true;
          setTimeout(() => {
            e.currentTarget.innerHTML = originalText;
            e.currentTarget.disabled = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("Gagal menyalin teks: ", err);
          alert("Gagal menyalin nomor.");
        });
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
}); // --- AKHIR DARI DOMContentLoaded ---
