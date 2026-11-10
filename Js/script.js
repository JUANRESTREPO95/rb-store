/* R&B Store Universo — comportamiento de la página.
   Todo es opcional: los enlaces de WhatsApp y el catálogo funcionan sin este archivo. */

(function () {
  "use strict";

  var NUMERO = "573126238264";

  /* ---- Utilidades de fecha: Medellín es UTC-5 todo el año ---- */
  function ahoraEnMedellin() {
    return new Date(Date.now() - 5 * 60 * 60 * 1000);
  }

  function dosDigitos(n) {
    return (n < 10 ? "0" : "") + n;
  }

  /* ---- WhatsApp: abrir en pestaña nueva ---- */
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---- Año del pie ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Reloj y estado de la tienda ---- */
  var reloj = document.querySelector("[data-clock]");
  var abierto = document.querySelector("[data-open]");

  function pintarHorario() {
    var d = ahoraEnMedellin();
    if (reloj) {
      reloj.textContent = dosDigitos(d.getUTCHours()) + ":" + dosDigitos(d.getUTCMinutes());
    }
    if (abierto) {
      var minutos = d.getUTCHours() * 60 + d.getUTCMinutes();
      var dia = d.getUTCDay();
      var estaAbierto = dia !== 0 && minutos >= 540 && minutos < 1020;
      abierto.textContent = estaAbierto ? "Abierto ahora" : "Cerrado ahora";
    }
  }
  pintarHorario();
  setInterval(pintarHorario, 60000);

  /* ---- Entrada de las secciones al hacer scroll ---- */
  var pendientes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("in");
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    pendientes.forEach(function (el) { observador.observe(el); });
    document.documentElement.classList.add("js-ready");

    /* Si algo no llegó a entrar, se muestra igual. */
    setTimeout(function () {
      pendientes.forEach(function (el) { el.classList.add("in"); });
    }, 3000);
  } else {
    pendientes.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Portada: la foto más cercana al centro de la tira ---- */
  var tira = document.querySelector("[data-strip]");
  var leyenda = document.querySelector("[data-strip-caption]");
  if (tira) {
    var fotos = Array.prototype.slice.call(tira.querySelectorAll("figure"));
    var pendiente = false;

    function marcarCentro() {
      pendiente = false;
      var medio = tira.scrollLeft + tira.clientWidth / 2;
      var cerca = null;
      var distancia = Infinity;
      fotos.forEach(function (f) {
        var centro = f.offsetLeft + f.offsetWidth / 2;
        var d = Math.abs(centro - medio);
        if (d < distancia) { distancia = d; cerca = f; }
      });
      fotos.forEach(function (f) { f.classList.toggle("near", f === cerca); });
      if (cerca && leyenda && cerca.dataset.name) {
        leyenda.textContent = cerca.dataset.name;
      }
    }

    tira.addEventListener("scroll", function () {
      if (!pendiente) {
        pendiente = true;
        window.requestAnimationFrame(marcarCentro);
      }
    }, { passive: true });

    window.addEventListener("resize", marcarCentro);
    marcarCentro();
  }

  /* ---- Portada: la fila que se arrastra ---- */
  var fila = document.querySelector("[data-row-track]");
  if (fila) {
    var barra = document.querySelector("[data-row-progress]");

    function pintarBarra() {
      if (!barra) return;
      var recorrido = fila.scrollWidth - fila.clientWidth;
      var parte = recorrido > 0 ? fila.scrollLeft / recorrido : 0;
      barra.style.width = Math.max(12, Math.round(parte * 100)) + "%";
    }

    fila.addEventListener("scroll", pintarBarra, { passive: true });
    window.addEventListener("resize", pintarBarra);
    pintarBarra();

    document.querySelectorAll("[data-row-prev]").forEach(function (b) {
      b.addEventListener("click", function () {
        fila.scrollBy({ left: -fila.clientWidth * 0.7, behavior: "smooth" });
      });
    });
    document.querySelectorAll("[data-row-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        fila.scrollBy({ left: fila.clientWidth * 0.7, behavior: "smooth" });
      });
    });
  }

  /* ---- Categorías: elegir productos y armar el pedido ---- */
  var panel = document.querySelector("[data-picks]");
  if (panel) {
    var elegidos = [];
    var contador = panel.querySelector("[data-pick-count]");
    var enviar = panel.querySelector("[data-pick-send]");

    function pintarPedido() {
      contador.textContent = elegidos.length;
      panel.hidden = elegidos.length === 0;
      document.body.classList.toggle("has-picks", elegidos.length > 0);
      if (elegidos.length) {
        var texto = "Hola, quiero consultar por:\n" + elegidos.map(function (n) {
          return "· " + n;
        }).join("\n");
        enviar.href = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(texto);
        enviar.target = "_blank";
        enviar.rel = "noopener";
      }
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

  /* ---- Hoja del catálogo: filas que llegan justas al margen derecho ----
     Sin este bloque la hoja se ve igual, solo que con el borde derecho irregular. */
  var hoja = document.querySelector(".sheet");
  if (hoja) {
    var marcos = Array.prototype.slice.call(hoja.querySelectorAll(".frame"));
    var relaciones = marcos.map(function (m) {
      var img = m.querySelector("img");
      var w = parseFloat(img.getAttribute("width")) || 1;
      var h = parseFloat(img.getAttribute("height")) || 1;
      return w / h;
    });

    function justificar() {
      marcos.forEach(function (m) {
        m.style.flex = "";
        var img = m.querySelector("img");
        img.style.width = "";
        img.style.height = "";
      });

      var estilo = getComputedStyle(hoja);
      var ancho = hoja.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight);
      var hueco = parseFloat(estilo.columnGap) || 8;
      var alto = marcos[0].querySelector("img").getBoundingClientRect().height || 200;

      var fila = [];
      var suma = 0;
      marcos.forEach(function (m, i) {
        fila.push(i);
        suma += relaciones[i];
        var llena = suma * alto + hueco * (fila.length - 1) >= ancho;
        if (llena || i === marcos.length - 1) {
          var altoFila = Math.min(alto * 1.3, (ancho - hueco * (fila.length - 1)) / suma);
          fila.forEach(function (k) {
            var w = Math.floor(relaciones[k] * altoFila);
            marcos[k].style.flex = "0 0 " + w + "px";
            var img = marcos[k].querySelector("img");
            img.style.width = w + "px";
            img.style.height = Math.floor(altoFila) + "px";
          });
          fila = [];
          suma = 0;
        }
      });
    }

    justificar();
    var reajuste;
    window.addEventListener("resize", function () {
      clearTimeout(reajuste);
      reajuste = setTimeout(justificar, 140);
    });
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
