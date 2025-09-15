// ===================================================================
// KODE JAVASCRIPT FINAL - VERSI YANG SUDAH DIPERBAIKI
// ===================================================================

// URL Script Google Anda
const scriptURL =
  "https://script.google.com/macros/s/AKfycbx0ZVUEmiKDAzd4iyybj47-VbFG8_z1FL1F06I2RGSzZtbjwf8gTbnme-zuDvd3xsrA/exec";

// Menjalankan semua kode setelah halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  // --- LOGIKA NAMA TAMU DARI URL ---
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get("to");
  const guestContainer = document.getElementById("guest-container");
  const guestNameElement = document.getElementById("guest-name");

  if (guestName && guestNameElement && guestContainer) {
    const formattedGuestName = guestName.replace(/\+/g, " ").trim();
    guestNameElement.textContent = formattedGuestName;
    guestContainer.style.display = "block";
  }

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
      statusBadge = `<span class=\"card-status badge-hadir\">Akan Hadir</span>`;
    } else if (konfirmasi === "Tidak Dapat Hadir") {
      statusBadge = `<span class=\"card-status badge-tidak-hadir\">Tidak Dapat Hadir</span>`;
    }
    const newWishHTML = `
            <div class=\"wish-card\" id=\"row-${rowNumber}\">
                <button class=\"btn-delete\" data-row=\"${rowNumber}\" title=\"Hapus ucapan ini\" >&times;</button>
                <div class=\"card-name\">${nama} ${statusBadge}</div>
                <p class=\"card-text\">\"${ucapan}\"</p>
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
      }, 1500); // Samakan dengan durasi transisi
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
          console.error("Gagal menyalin: ", err);
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

  // --- BAGIAN 4: LOGIKA UNTUK NAVBAR ACTIVE LINK HIGHLIGHTING ---
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  if (sections.length > 0 && navLinks.length > 0) {
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            const sectionId = section.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.remove("active");
              if (link.getAttribute("href") === `#${sectionId}`)
                link.classList.add("active");
            });
          }
        },
      });
    });
  }

  // --- BAGIAN 5: ANIMASI GSAP & SCROLLTRIGGER (VERSI BARU) ---
  function setupGsapAnimations() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Fungsi untuk animasi smooth scroll (tetap sama)
    document.querySelectorAll('.navbar a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        gsap.to(window, {
          duration: 3,
          scrollTo: {
            y: this.getAttribute("href"),
            offsetY: 50,
          },
          ease: "power5.inOut",
        });
      });
    });

    // Helper function untuk animasi teks
    function animateText(selector, trigger) {
      const element = document.querySelector(selector);
      if (element) {
        const text = new SplitType(element, { types: "words, chars" });
        gsap.from(text.chars, {
          opacity: 0,
          y: 20,
          scale: 0.8,
          duration: 2,
          stagger: 0.03,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: trigger || selector,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }
    }

    // Helper function untuk animasi fade-in umum
    function animateFadeIn(selector, options = {}) {
      gsap.from(selector, {
        opacity: 0,
        y: options.y || 50,
        scale: options.scale || 1,
        duration: options.duration || 1.2,
        ease: options.ease || "power3.out",
        stagger: options.stagger || 0,
        scrollTrigger: {
          trigger: options.trigger || selector,
          start: options.start || "top 85%",
          toggleActions: "play none none none",
        },
      });
    }

    // 1. Animasi Section #quote (saat di-scroll)
    const quoteCard = document.querySelector("#quote .card-section");
    const quoteTl = gsap.timeline({
      scrollTrigger: {
        trigger: quoteCard,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    quoteTl
      .from(quoteCard, {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: "power3.out",
      })
      .add(() => {
        quoteCard.classList.add("is-visible");
      });

    // Also animate the children
    quoteTl.from(
      "#quote .card-section > *",
      {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      },
      "-=1.2"
    ); // Overlap with the card animation

    // 2. Animasi Section #mempelai
    animateText("#mempelai h2", "#mempelai");
    animateFadeIn("#mempelai > .container > p", {
      trigger: "#mempelai",
      start: "top 80%",
    });

    const coupleTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".mempelai-wanita",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    coupleTl
      .from(".mempelai-wanita .wayang-photo", {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      })
      .from(
        ".mempelai-wanita .col-7",
        { x: -50, opacity: 0, duration: 1 },
        "-=1"
      );

    const coupleTl2 = gsap.timeline({
      scrollTrigger: {
        trigger: ".mempelai-pria",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    coupleTl2
      .from(".mempelai-pria .wayang-photo", {
        x: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      })
      .from(".mempelai-pria .col-7", { x: 50, opacity: 0, duration: 1 }, "-=1");

    gsap.from("#mempelai .d-none.d-md-block span", {
      scale: 0,
      rotate: -360,
      duration: 2,
      ease: "elastic.out(1, 0.5)",
      scrollTrigger: {
        trigger: "#mempelai .d-none.d-md-block span",
        start: "top 80%",
      },
    });

    // 3. Animasi Section #acara
    animateText("#acara h2", "#acara");
    animateFadeIn("#acara .lead", { trigger: "#acara", start: "top 75%" });
    gsap.from("#acara .card", {
      scale: 0.7,
      opacity: 0,
      rotationZ: -15,
      duration: 2,
      ease: "back.out(1.7)",
      scrollTrigger: { trigger: "#acara .card", start: "top 80%" },
    });

    // 4. Animasi Section #countdown
    animateText("#countdown h2", "#countdown");
    gsap.from(".timer-box", {
      y: 100,
      opacity: 0,
      duration: 1.5,
      stagger: {
        amount: 0.5,
        from: "center",
      },
      ease: "back.out(1.7)",
      scrollTrigger: { trigger: ".timer-box", start: "top 90%" },
    });

    // 5. Animasi Section #rsvp
    animateText("#rsvp h2", "#rsvp");
    animateFadeIn("#rsvp .lead", { trigger: "#rsvp", start: "top 75%" });
    animateFadeIn("#rsvp .btn-jawa", {
      trigger: "#rsvp .btn-jawa",
      start: "top 85%",
      scale: 0.8,
      ease: "back.out(1.7)",
    });
    animateFadeIn("#wish-wall", {
      trigger: "#wish-wall",
      start: "top 85%",
      y: 100,
    });

    // 6. Animasi Section #gift
    animateText("#gift h2", "#gift");
    animateFadeIn("#gift .lead", { trigger: "#gift", start: "top 75%" });
    gsap.from("#gift .gift-card", {
      scale: 0.8,
      opacity: 0,
      duration: 1.5,
      stagger: 0.3,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: "#gift .gift-card",
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    // 7. Animasi Section #closing
    const closingH2 = document.querySelector("#closing h2");
    if (closingH2) {
      const closingText = new SplitType(closingH2, { types: "chars" });
      gsap.from(closingText.chars, {
        opacity: 0,
        scale: 0,
        y: 50,
        rotateX: 180,
        duration: 2,
        stagger: 0.05,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: "#closing h2",
          start: "top 85%",
        },
      });
    }
    animateFadeIn("#closing .lead", {
      trigger: "#closing .lead",
      start: "top 90%",
    });
    animateFadeIn("#closing .mt-5", {
      trigger: "#closing .mt-5",
      start: "top 90%",
      y: 30,
    });
    animateFadeIn("#closing hr", {
      trigger: "#closing hr",
      start: "top 90%",
      scale: 0,
      duration: 2,
    });
    animateFadeIn("#closing .col-md-5", {
      trigger: "#closing .col-md-5",
      start: "top 95%",
      stagger: 0.3,
    });
  }
}); // --- AKHIR DARI DOMContentLoaded ---
