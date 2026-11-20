"use strict";

// El script usa defer: el HTML ya está disponible cuando se ejecuta.
// 1. Modo oscuro: clases CSS, eventos y persistencia con localStorage.
const botonTema = document.querySelector("#cambiar-tema");

function aplicarTema(oscuro) {
  document.body.classList.toggle("modo-oscuro", oscuro);
  botonTema.setAttribute("aria-pressed", String(oscuro));
  botonTema.textContent = oscuro ? "Modo claro" : "Modo oscuro";
}

// OJO: El almacenamiento puede estar bloqueado; el botón sigue funcionando.
try {
  aplicarTema(localStorage.getItem("tema") === "oscuro");
} catch (error) {
  aplicarTema(false);
}

botonTema.addEventListener("click", () => {
  const oscuro = !document.body.classList.contains("modo-oscuro");
  aplicarTema(oscuro);
  try {
    localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
  } catch (error) {
    // Sin almacenamiento, el cambio se mantiene en la página actual.
  }
});

// 2. Buscador: solo existe en la portada; las entradas comparten este archivo.
const buscador = document.querySelector("#buscar");
if (buscador) {
  const tarjetas = document.querySelectorAll(".entrada");
  const resultado = document.querySelector("#resultado-busqueda");

  // 3.Permite encontrar palabras sin tener en cuenta las tildes.
  function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  buscador.addEventListener("input", () => {
    const consulta = normalizar(buscador.value.trim());
    let visibles = 0;
    tarjetas.forEach((tarjeta) => {
      const coincide = normalizar(tarjeta.textContent).includes(consulta);
      tarjeta.hidden = !coincide;
      if (coincide) visibles++;
    });
    resultado.textContent = visibles === 0
      ? "No hay entradas que coincidan con tu búsqueda."
      : visibles + (visibles === 1 ? " entrada encontrada." : " entradas encontradas.");
  });
}
