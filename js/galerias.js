"use strict";

// Un único visor sirve para las tres galerías de la primera entrada.
const visor = document.querySelector("#visor");
const fotoGrande = document.querySelector("#visor-imagen");
const pieFoto = document.querySelector("#visor-pie");
const contador = document.querySelector("#visor-contador");
let fotosActivas = [];
let posicion = 0;
let origen = null;

function mostrarFoto(paso) {
  posicion = (posicion + paso + fotosActivas.length) % fotosActivas.length;
  const foto = fotosActivas[posicion].querySelector("img");
  fotoGrande.src = foto.src;
  fotoGrande.alt = foto.alt;
  pieFoto.textContent = foto.alt;
  contador.textContent = (posicion + 1) + " / " + fotosActivas.length;
}

// Pointer Events cubre ratón, pantalla táctil y lápiz.
function permitirArrastre(elemento, cambiar) {
  let inicio = null;
  let arrastrado = false;

  elemento.addEventListener("pointerdown", (evento) => {
    if (!evento.isPrimary || evento.button !== 0) return;
    inicio = { x: evento.clientX, y: evento.clientY, id: evento.pointerId };
    arrastrado = false;
    // Los gestos se reconocen al soltar el puntero dentro de la imagen o la pista.
  });

  elemento.addEventListener("pointerup", (evento) => {
    if (!inicio || inicio.id !== evento.pointerId) return;
    const dx = evento.clientX - inicio.x;
    const dy = evento.clientY - inicio.y;
    inicio = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      arrastrado = true;
      cambiar(dx < 0 ? 1 : -1);
    }
  });

  elemento.addEventListener("pointercancel", () => { inicio = null; });
  elemento.addEventListener("click", (evento) => {
    // Evita abrir una miniatura al terminar un arrastre.
    if (arrastrado) {
      evento.preventDefault();
      evento.stopImmediatePropagation();
      arrastrado = false;
    }
  }, true);
}

document.querySelectorAll(".galeria").forEach((galeria) => {
  const pista = galeria.querySelector(".galeria-pista");
  const fotos = Array.from(galeria.querySelectorAll(".miniatura"));
  const estado = galeria.querySelector(".galeria-posicion");
  let actual = 0;

  function mover(paso) {
    actual = (actual + paso + fotos.length) % fotos.length;
    pista.scrollTo({ left: fotos[actual].offsetLeft - pista.offsetLeft, behavior: "smooth" });
    estado.textContent = (actual + 1) + " / " + fotos.length;
  }

  galeria.querySelectorAll("[data-paso]").forEach((boton) => {
    boton.addEventListener("click", () => mover(Number(boton.dataset.paso)));
  });

  // Mantiene el contador sincronizado al deslizar con un panel táctil.
  pista.addEventListener("scroll", () => {
    const ancho = fotos[0].getBoundingClientRect().width + 16;
    actual = Math.round(pista.scrollLeft / ancho);
    estado.textContent = (actual + 1) + " / " + fotos.length;
  });

  permitirArrastre(pista, mover);
  galeria.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
      evento.preventDefault();
      mover(evento.key === "ArrowRight" ? 1 : -1);
    }
  });

  fotos.forEach((boton, indice) => {
    boton.addEventListener("click", () => {
      fotosActivas = fotos;
      posicion = indice;
      origen = boton;
      mostrarFoto(0);
      visor.showModal();
      document.body.classList.add("visor-abierto");
    });
  });
});

document.querySelector("#visor-anterior").addEventListener("click", () => mostrarFoto(-1));
document.querySelector("#visor-siguiente").addEventListener("click", () => mostrarFoto(1));
document.querySelector("#cerrar-visor").addEventListener("click", () => visor.close());
visor.addEventListener("keydown", (evento) => {
  if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
    evento.preventDefault();
    mostrarFoto(evento.key === "ArrowRight" ? 1 : -1);
  }
});
visor.addEventListener("click", (evento) => {
  if (evento.target === visor) {
    const zona = visor.getBoundingClientRect();
    if (evento.clientX < zona.left || evento.clientX > zona.right ||
        evento.clientY < zona.top || evento.clientY > zona.bottom) visor.close();
  }
});
visor.addEventListener("close", () => {
  document.body.classList.remove("visor-abierto");
  if (origen) origen.focus({ preventScroll: true });
});
permitirArrastre(fotoGrande, mostrarFoto);
