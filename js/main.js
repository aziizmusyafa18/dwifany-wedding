// ===================================================================
// KODE JAVASCRIPT FINAL UNTUK FILE main.js
// ===================================================================

// URL Script Google Anda
const scriptURL =
  "https://script.google.com/macros/s/AKfycbx0ZVUEmiKDAzd4iyybj47-VbFG8_z1FL1F06I2RGSzZtbjwf8gTbnme-zuDvd3xsrA/exec";

// Menjalankan semua kode setelah halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  // --- BAGIAN 1: INISIALISASI LIBRARY & ANIMASI SAMPUL ---

  // Inisialisasi AOS (Animasi on Scroll)
  AOS.init({
    duration: 1000,
    once: true,
  });

  // Logika untuk membuka sampul (cover)
  const cover = document.getElementById("cover");
  const content = document.getElementById("content");
  const openButton = document.getElementById("open-invitation");
  const music = document.getElementById("gamelan-music");

  if (openButton) {
    openButton.addEventListener("click", () => {
      if (music)
        music.play().catch((e) => console.error("Gagal memutar musik:", e));

      cover.style.transition = "opacity 1s ease-out, transform 1s ease-out";
      cover.style.opacity = "0";
      cover.style.transform = "scale(1.2)";

      setTimeout(() => {
        cover.classList.add("d-none");
        if (content) content.classList.remove("d-none");
      }, 1000);
    });
  }

  // --- BAGIAN 2: DEKLARASI ELEMEN UNTUK FITUR LAIN ---
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

  // --- BAGIAN 3: FUNGSI PEMBANTU (HELPER FUNCTION) ---
  function addWishToWall(nama, ucapan, konfirmasi, rowNumber) {
    if (!wishWall) return;
    let statusBadge = "";
    if (konfirmasi === "Akan Hadir") {
      statusBadge = `<span class="card-status badge-hadir">Akan Hadir</span>`;
    } else if (konfirmasi === "Tidak Dapat Hadir") {
      statusBadge = `<span class="card-status badge-tidak-hadir">Tidak Dapat Hadir</span>`;
    }

    const newWishHTML = `
            <div class="wish-card" id="row-${rowNumber}" data-aos="zoom-in-up">
                <button class="btn-delete" data-row="${rowNumber}" title="Hapus ucapan ini">&times;</button>
                <div class="card-name">${nama} ${statusBadge}</div>
                <p class="card-text">"${ucapan}"</p>
            </div>
        `;
    wishWall.insertAdjacentHTML("afterbegin", newWishHTML);
  }

  // --- BAGIAN 4: MEMUAT UCAPAN AWAL DARI GOOGLE SHEETS ---
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

  // --- BAGIAN 5: EVENT LISTENER UNTUK SEMUA FITUR ---

  // 5a. Logika untuk tombol Salin (Copy)
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

  // 5b. Logika untuk form RSVP
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
          document
            .getElementById("modal-error-alert")
            ?.classList.remove("d-none");
        })
        .finally(() => {
          buttonText.classList.remove("d-none");
          buttonSpinner.classList.add("d-none");
          submitButton.disabled = false;
        });
    });
  }

  // 5c. Logika untuk menghapus ucapan
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
}); // --- AKHIR DARI DOMContentLoaded ---
