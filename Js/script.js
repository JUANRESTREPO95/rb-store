document.addEventListener("DOMContentLoaded", function () {
  const numeroWhatsApp = "573126238264";
  const mensajePredeterminado = encodeURIComponent("¡Hola! Quisiera recibir información y realizar una consulta sobre los productos de R&B Store.");

  const elementosWhatsApp = document.querySelectorAll("[data-whatsapp]");

  elementosWhatsApp.forEach((elemento) => {
    elemento.addEventListener("click", function (e) {
      e.preventDefault();
      const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajePredeterminado}`;
      window.open(urlWhatsApp, "_blank");
    });
  });

  const spanAnio = document.querySelector("[data-year]");
  if (spanAnio) {
    spanAnio.textContent = new Date().getFullYear();
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true" || false;
      menuToggle.setAttribute("aria-expanded", !expanded);
      mainNav.classList.toggle("open");
    });
  }

  const gate = document.querySelector("[data-age-gate]");
  if (gate) {
    if (sessionStorage.getItem("rbAdultConfirmed") !== "yes") gate.classList.add("show");
    gate.querySelector("[data-age-yes]")?.addEventListener("click", () => {
      sessionStorage.setItem("rbAdultConfirmed", "yes"); gate.classList.remove("show");
    });
    gate.querySelector("[data-age-no]")?.addEventListener("click", () => location.href = "../../index.html");
  }
});

/* Inicio: al bajar, el logo aparece fijo en el menú superior */
(function () {
  var fila = document.querySelector(".top-row");
  if (!fila) return;
  function revisar() {
    document.body.classList.toggle("scrolled", fila.getBoundingClientRect().bottom <= 0);
  }
  window.addEventListener("scroll", revisar, { passive: true });
  revisar();
})();
