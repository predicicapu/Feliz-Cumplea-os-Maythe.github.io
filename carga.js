const barraCorazones = document.querySelector('.barra-corazones');

const TOTAL_CORAZONES =  window.innerWidth > 768 ? 34 : 23;
const corazones = [];

// Crear corazones individuales
for (let i = 0; i < TOTAL_CORAZONES; i++) {
    const corazon = document.createElement('span');
    corazon.classList.add('corazon');

    // desfase de latido (latido individual real)
    corazon.style.animationDelay = `${i * 0.18}s`;

    barraCorazones.appendChild(corazon);
    corazones.push(corazon);
}

const porcentajeTexto = document.querySelector('.porcentaje');
const icono = document.querySelector('.icono-carga');
const boton = document.querySelector('.btn-continuar');

let progreso = 0;
let porcentajeAnterior = -1;

// CONFIG
const duracionCarga = 2800;
const intervalo = 20;
const incremento = 100 / (duracionCarga / intervalo);

// ⏳ Esperar aparición de barra
setTimeout(() => {
    porcentajeTexto.style.animation =
        'aparecerPorcentaje 0.6s ease-out forwards';

    iniciarCarga();
}, 1100);

function iniciarCarga() {
    const timer = setInterval(() => {
        progreso += incremento;

        if (progreso >= 100) {
            progreso = 100;
            clearInterval(timer);
            finalizarCarga();
        }

        // 🧠 Activar corazones según progreso
        const corazonesActivos = Math.floor(
            (progreso / 100) * TOTAL_CORAZONES
        );

        corazones.forEach((corazon, index) => {
            if (index < corazonesActivos) {
                corazon.style.opacity = 1;
            }
        });

        // 🥤 mover Coca-Cola
        icono.style.left = progreso + "%";

        escribirTinta(Math.floor(progreso));

    }, intervalo);
}

// ✒️ efecto tinta
function escribirTinta(valor) {
    if (valor === porcentajeAnterior) return;
    porcentajeAnterior = valor;

    porcentajeTexto.textContent = valor + "%";

    porcentajeTexto.animate(
        [
            { opacity: 0.6, filter: 'blur(0.8px)' },
            { opacity: 1, filter: 'blur(0px)' }
        ],
        { duration: 120, easing: 'ease-out' }
    );
}

// 🎉 final
function finalizarCarga() {
    icono.style.animation = 'none';

    icono.animate(
        [
            { transform: 'translate(-50%, -50%) scale(1)' },
            { transform: 'translate(-50%, -60%) scale(1.15)' },
            { transform: 'translate(-50%, -50%) scale(1)' }
        ],
        { duration: 450, easing: 'ease-out' }
    );

    setTimeout(() => {
        boton.classList.add('mostrar');
    }, 400);
}
boton.addEventListener('click', () => {
    boton.style.transform = 'scale(1.15)';

    setTimeout(() => {
        window.location.href = 'dos/segunda.html';
    }, 400);
});
