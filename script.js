
// ============================================
// ELEMENTOS PRINCIPALES
// ============================================

const inicio = document.getElementById("inicio");
const sorpresa = document.getElementById("sorpresa");
const botonEntrar = document.getElementById("entrar");

const canvas = document.getElementById("particulas");
const ctx = canvas.getContext("2d");

let ancho = window.innerWidth;
let alto = window.innerHeight;

let particulas = [];
let animacionActiva = false;
let tiempoInicio = 0;


// ============================================
// AJUSTAR CANVAS
// ============================================

function ajustarCanvas() {

    ancho = window.innerWidth;
    alto = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = ancho * dpr;
    canvas.height = alto * dpr;

    canvas.style.width = ancho + "px";
    canvas.style.height = alto + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

}


// ============================================
// FORMULA MATEMATICA DEL CORAZON
// ============================================

function formaCorazon(t, radio, centroX, centroY) {

    const x = 16 * Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

    // Escalas independientes para que
    // el corazon sea ancho y alto.

    const escalaX = Math.min(
        ancho * 0.46 / 16,
        alto * 0.75 / 29
    );

    const escalaY = Math.min(
        alto * 0.75 / 29,
        ancho * 0.46 / 16
    );

    return {

        x: centroX + x * escalaX * radio,

        y: centroY - y * escalaY * radio

    };

}


// ============================================
// CREAR 2500 PARTICULAS
// ============================================

function crearParticulas() {

    particulas = [];

    const centroX = ancho / 2;
    const centroY = alto * 0.50;

    const cantidadInterior = ancho < 650 ? 1050 : 1800;
    const cantidadContorno = ancho < 650 ? 400 : 700;

    const cantidadTotal = cantidadInterior + cantidadContorno;

    for (let i = 0; i < cantidadTotal; i++) {

        const inicialX = Math.random() * ancho;
        const inicialY = Math.random() * alto;

        const t = Math.random() * Math.PI * 2;

        let radio;

        // PARTICULAS DEL INTERIOR

        if (i < cantidadInterior) {

            radio = Math.sqrt(Math.random());

        }

        // PARTICULAS DEL CONTORNO

        else {

            radio = 0.94 + Math.random() * 0.08;

        }

        const destino = formaCorazon(
            t,
            radio,
            centroX,
            centroY
        );

        particulas.push({

            x: inicialX,
            y: inicialY,

            inicialX: inicialX,
            inicialY: inicialY,

            destinoX: destino.x,
            destinoY: destino.y,

            tamano: Math.random() * 1.8 + 0.8,

            fase: Math.random() * Math.PI * 2,

            velocidad: Math.random() * 2 + 1,

            esContorno: i >= cantidadInterior

        });

    }

}


// ============================================
// INICIAR FORMACION DEL CORAZON
// ============================================

function iniciarParticulas() {

    ajustarCanvas();

    crearParticulas();

    tiempoInicio = performance.now();

    if (!animacionActiva) {

        animacionActiva = true;

        requestAnimationFrame(animarParticulas);

    }

}


// ============================================
// ANIMACION DEL CORAZON
// ============================================

function animarParticulas(tiempo) {

    if (!animacionActiva) return;

    ctx.clearRect(0, 0, ancho, alto);

    const transcurrido = tiempo - tiempoInicio;

    // El corazon se forma durante 5 segundos.

    const progreso = Math.min(
        transcurrido / 5000,
        1
    );

    // Movimiento suave de las particulas.

    const suavizado =
        1 - Math.pow(1 - progreso, 3);

    // Latido despues de formarse.

    let latido = 1;

    if (progreso >= 1) {

        latido =
            1 + Math.sin(tiempo * 0.003) * 0.018;

    }

    const centroX = ancho / 2;
    const centroY = alto * 0.50;

    for (const p of particulas) {

        const destinoX =
            centroX +
            (p.destinoX - centroX) * latido;

        const destinoY =
            centroY +
            (p.destinoY - centroY) * latido;

        // Las particulas viajan desde toda
        // la pantalla hasta su posicion final.

        p.x = p.inicialX +
            (destinoX - p.inicialX) * suavizado;

        p.y = p.inicialY +
            (destinoY - p.inicialY) * suavizado;

        // Brillo individual.

        const brillo =
            0.55 +
            Math.sin(
                tiempo * 0.003 * p.velocidad + p.fase
            ) * 0.35;

        const movimiento =
            Math.sin(
                tiempo * 0.0015 + p.fase
            ) * 0.55;

        const tamano = p.esContorno
            ? p.tamano * 1.15
            : p.tamano;

        ctx.beginPath();

        ctx.arc(
            p.x + movimiento,
            p.y,
            tamano,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255,255,255,${Math.max(0.25, brillo)})`;

        ctx.shadowBlur = p.esContorno ? 12 : 7;
        ctx.shadowColor = "#ffffff";

        ctx.fill();

    }

    ctx.shadowBlur = 0;

    requestAnimationFrame(animarParticulas);

}


// ============================================
// BOTON ENTRAR
// ============================================

botonEntrar.addEventListener("click", () => {

    inicio.style.display = "none";

    sorpresa.style.display = "block";

    iniciarParticulas();

    reproducirMusica();

});


// ============================================
// REDIMENSIONAR PANTALLA
// ============================================

window.addEventListener("resize", () => {

    if (sorpresa.style.display === "block") {

        ajustarCanvas();

        crearParticulas();

        tiempoInicio = performance.now();

    }

});


// ============================================
// REPRODUCTOR MUSICAL
// ============================================

const musica = document.getElementById("musica");

const controlMusica =
    document.getElementById("controlMusica");

const progresoMusica =
    document.getElementById("progresoMusica");

const tiempoActual =
    document.getElementById("tiempoActual");

const duracionMusica =
    document.getElementById("duracionMusica");


function formatoTiempo(segundos) {

    if (!Number.isFinite(segundos)) {
        return "0:00";
    }

    const minutos = Math.floor(segundos / 60);

    const segundosRestantes =
        Math.floor(segundos % 60);

    return minutos + ":" +
        String(segundosRestantes).padStart(2, "0");

}


async function reproducirMusica() {

    try {

        await musica.play();

        controlMusica.textContent = "Ⅱ";

    } catch (error) {

        console.log("No se pudo iniciar la música:", error);

        controlMusica.textContent = "▶";

    }

}


controlMusica.addEventListener("click", () => {

    if (musica.paused) {

        reproducirMusica();

    } else {

        musica.pause();

        controlMusica.textContent = "▶";

    }

});


musica.addEventListener("loadedmetadata", () => {

    duracionMusica.textContent =
        formatoTiempo(musica.duration);

});


musica.addEventListener("timeupdate", () => {

    if (musica.duration) {

        const porcentaje =
            musica.currentTime / musica.duration * 100;

        progresoMusica.style.width =
            porcentaje + "%";

        tiempoActual.textContent =
            formatoTiempo(musica.currentTime);

    }

});


musica.addEventListener("play", () => {

    controlMusica.textContent = "Ⅱ";

});


musica.addEventListener("pause", () => {

    controlMusica.textContent = "▶";

});


// ============================================
// CARTA ROMANTICA
// ============================================

const abrirCarta =
    document.getElementById("abrirCarta");

const cerrarCarta =
    document.getElementById("cerrarCarta");

const overlayCarta =
    document.getElementById("overlayCarta");

const textoCarta =
    document.getElementById("textoCarta");


const carta = `Mi amor:

Hoy es un día muy especial, porque el mundo celebra la llegada de una persona maravillosa. Y yo quiero aprovechar este momento para recordarte lo mucho que vales y lo especial que eres.

Deseo que la vida te regale miles de motivos para sonreír, que tus sueños se conviertan en realidad y que nunca te falten fuerzas para luchar por todo aquello que deseas.

Si pudiera regalarte algo, sería la oportunidad de verte con mis ojos, para que pudieras descubrir lo increíble que eres, lo hermosa que es tu esencia y lo mucho que iluminas mis días.

Quiero que sepas que no necesitas ser perfecta para ser maravillosa. Me encantan esos pequeños detalles que te hacen ser tú, tu sonrisa, tu manera de expresarte y esa forma tan especial que tienes de hacer que un momento sencillo se convierta en algo inolvidable.

Ojalá pudiera guardar cada sonrisa tuya en una estrella, para que incluso en los días difíciles mires al cielo y recuerdes lo especial que eres.

No sé qué sorpresas tendrá preparado el futuro, pero sí deseo seguir compartiendo contigo momentos bonitos, abrazos interminables, risas espontáneas y recuerdos que algún día podamos mirar con una sonrisa.

Que este nuevo año de vida llegue cargado de bendiciones, salud, amor, éxitos y muchísimas experiencias hermosas.

Nunca olvides lo valiosa que eres, mi niña hermosa. Mereces un amor bonito, una vida llena de felicidad y todo aquello que haga sonreír a tu corazón.

Hoy y siempre deseo que seas muy feliz.

Feliz cumpleaños, mi amor. ❤️

Con todo mi cariño, para ti. ♥`;


let temporizadorCarta = null;


// ============================================
// ABRIR PERGAMINO
// ============================================

abrirCarta.addEventListener("click", () => {

    overlayCarta.classList.add("mostrar");

    textoCarta.textContent = "";

    clearTimeout(temporizadorCarta);

    let i = 0;

    function escribir() {

        if (!overlayCarta.classList.contains("mostrar")) {
            return;
        }

        if (i < carta.length) {

            textoCarta.textContent += carta.charAt(i);

            i++;

            temporizadorCarta =
                setTimeout(escribir, 25);

        }

    }

    temporizadorCarta =
        setTimeout(escribir, 800);

});


// ============================================
// CERRAR PERGAMINO
// ============================================

function cerrarPergamino() {

    overlayCarta.classList.remove("mostrar");

    clearTimeout(temporizadorCarta);

}


cerrarCarta.addEventListener("click", cerrarPergamino);


overlayCarta.addEventListener("click", (evento) => {

    if (evento.target === overlayCarta) {

        cerrarPergamino();

    }

});


document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape") {

        cerrarPergamino();

    }

});
