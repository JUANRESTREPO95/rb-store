/* R&B Store Universo — lo poco que la página necesita en JavaScript.
   Sin este archivo el catálogo, los enlaces y el WhatsApp funcionan igual. */

(function () {
  "use strict";

  var NUMERO = "573126238264";

  /* ---- WhatsApp en pestaña nueva ---- */
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---- Año del pie ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Hora y estado de la tienda (Medellín es UTC-5 todo el año) ---- */
  function ahoraEnMedellin() {
    return new Date(Date.now() - 5 * 60 * 60 * 1000);
  }

  function dosDigitos(n) {
    return (n < 10 ? "0" : "") + n;
  }

  var relojes = document.querySelectorAll("[data-clock]");
  var abierto = document.querySelector("[data-open]");
  var punto = document.querySelector("[data-open-dot]");

  function pintarHorario() {
    var d = ahoraEnMedellin();
    var hora = dosDigitos(d.getUTCHours()) + ":" + dosDigitos(d.getUTCMinutes());
    relojes.forEach(function (el) { el.textContent = hora; });

    if (abierto) {
      var minutos = d.getUTCHours() * 60 + d.getUTCMinutes();
      var estaAbierto = d.getUTCDay() !== 0 && minutos >= 540 && minutos < 1020;
      abierto.textContent = estaAbierto ? "Abierto ahora" : "Cerrado ahora";
      if (punto) punto.classList.toggle("abierto", estaAbierto);
    }
  }

  pintarHorario();
  setInterval(pintarHorario, 60000);

  /* ---- Varios productos en una sola consulta ---- */
  var panel = document.querySelector("[data-picks]");
  if (panel) {
    var elegidos = [];
    var contador = panel.querySelector("[data-pick-count]");
    var enviar = panel.querySelector("[data-pick-send]");

    function pintarPedido() {
      contador.textContent = elegidos.length;
      panel.hidden = elegidos.length === 0;

      var texto = "Hola, quiero consultar por:\n" + elegidos.map(function (n) {
        return "· " + n;
      }).join("\n");
      enviar.href = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(texto);
      enviar.target = "_blank";
      enviar.rel = "noopener";
    }

    document.querySelectorAll("[data-pick]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var nombre = boton.dataset.pick;
        var yaEsta = boton.getAttribute("aria-pressed") === "true";
        boton.setAttribute("aria-pressed", yaEsta ? "false" : "true");
        if (yaEsta) {
          elegidos = elegidos.filter(function (n) { return n !== nombre; });
        } else {
          elegidos.push(nombre);
        }
        pintarPedido();
      });
    });

    var limpiar = panel.querySelector("[data-pick-clear]");
    if (limpiar) {
      limpiar.addEventListener("click", function () {
        elegidos = [];
        document.querySelectorAll("[data-pick]").forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
        });
        pintarPedido();
      });
    }
  }

  /* ---- Control de edad ---- */
  var puerta = document.querySelector("[data-gate]");
  if (puerta) {
    var confirmado = false;
    try {
      confirmado = sessionStorage.getItem("rbAdulto") === "si";
    } catch (e) {
      confirmado = false;
    }
    if (confirmado) {
      puerta.hidden = true;
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    var si = puerta.querySelector("[data-gate-yes]");
    if (si) {
      si.addEventListener("click", function () {
        try { sessionStorage.setItem("rbAdulto", "si"); } catch (e) {}
        puerta.hidden = true;
        document.body.style.overflow = "";
      });
    }
  }
})();
