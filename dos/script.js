// Obtener elementos del DOM
const intro = document.getElementById('intro');
const balloonContainer = document.getElementById('balloon-container');

// URLs de las imágenes de los globos
const balloonImagesSrc = [
    'https://i.pinimg.com/originals/ba/1f/45/ba1f45ff464690ef3b9e371f703907e2.png',
    'https://i.pinimg.com/originals/f8/f3/f5/f8f3f592327b258063cd9277ccc9290a.png',
    'https://i.pinimg.com/originals/62/c6/e7/62c6e7528aac2835a0a2dae848223eb3.png',
    'https://i.pinimg.com/originals/93/cf/8d/93cf8df206d6ba9e7ab836c426a33bf0.png',
    'https://i.pinimg.com/originals/c8/db/3c/c8db3c83b9f43f436463715ed58d1070.png'
];

// Arrays para globos e imágenes
const balloons = [];
const images = [];
let canvas, ctx;

// Detectar si es PC o móvil
const isPC = window.innerWidth >= 1024;
const MAX_BALLOONS = isPC ? 125 : 80;

// Precargar imágenes
balloonImagesSrc.forEach(src => {
    const img = new Image();
    img.src = src;
    images.push(img);
});

// Crear el canvas
function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'balloon-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d', { alpha: true });
    balloonContainer.appendChild(canvas);
}

setupCanvas();

// Ajustar el canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Crear un globo
function createBalloon() {
    // Evitar crear más globos del límite permitido
    if (balloons.length >= MAX_BALLOONS) return;

    // Profundidad para efecto de parallax
    const depth = Math.random();

    // Tamaño según dispositivo y profundidad
    const size = isPC ? 120 + depth * 110 : 80 + depth * 60;

    // Imagen aleatoria
    const img = images[Math.floor(Math.random() * images.length)];

    // Objeto globo
    const balloon = {
        img,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 200, // Empieza fuera de pantalla
        width: size,
        height: size * (img.naturalHeight / img.naturalWidth || 1.5), // Proporción aproximada
        speedY: 0.5 + Math.random() * 0.9 + depth, // Velocidad vertical
        accY: Math.random() * 0.002 + 0.001, // Aceleración
        sway: Math.random() * 3 + 1, // Oscilación horizontal
        swaySpeed: Math.random() * 0.01 + 0.006, // Velocidad de oscilación
        angle: Math.random() * Math.PI * 2,
        rotation: Math.random() * 10 - 5, // Rotación inicial
        opacity: 0.5 + depth * 0.5, // Opacidad según profundidad
        depth
    };

    balloons.push(balloon);
}

// Bucle de animación
let lastTime = 0;
function animateBalloons(time) {
    const deltaTime = time - lastTime;

    // Limitar la tasa de refresco
    if (deltaTime < 16) {
        requestAnimationFrame(animateBalloons);
        return;
    }
    lastTime = time;

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ordenar globos por profundidad (lejos a cerca)
    balloons.sort((a, b) => a.depth - b.depth);

    for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];

        // Actualizar física del globo
        b.speedY += b.accY;
        b.y -= b.speedY;
        b.angle += b.swaySpeed;

        // Movimiento horizontal tipo balanceo
        const driftX = Math.sin(b.angle) * b.sway;

        // Dibujar el globo si la imagen ya cargó
        if (b.img.complete) {
            ctx.save();
            ctx.globalAlpha = b.opacity;
            ctx.translate(b.x + driftX, b.y);
            ctx.rotate(b.rotation * Math.PI / 180);
            ctx.drawImage(b.img, -b.width / 2, -b.height / 2, b.width, b.height);
            ctx.restore();
        }

        // Eliminar el globo si sale de la pantalla
        if (b.y < -b.height - 100) {
            balloons.splice(i, 1);
        }
    }

    requestAnimationFrame(animateBalloons);
}

requestAnimationFrame(animateBalloons);

// Función para manejar el clic en la cámara
function handleCameraClick() {
    document.body.classList.add('intense')
    const balloonCont = document.getElementById('balloon-container');
    const elements = document.getElementById('elements');

    balloonCont.classList.add('fade-out');
    elements.classList.add('fade-out');

    // Escuchar el fin de la transición para ocultar completamente y mostrar el reproductor
    elements.addEventListener('transitionend', () => {
        balloonCont.style.display = 'none';
        elements.style.display = 'none';
        document.getElementById('music-player').style.display = 'flex';
        // Reproducir la música automáticamente
        audio.play();
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline';
    }, { once: true });
}

// Lógica del reproductor de música
const songs = ['musica/Joey_Montana-La_Melodia.mp3', 'song2.mp3', 'song3.mp3']; // Reemplaza con los nombres de tus archivos MP3 descargados (ej: 'mi_cancion1.mp3')
let currentSongIndex = 0;
let isLooping = false;

const audio = document.getElementById('player');
const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const repeatBtn = document.getElementById('repeat');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const seekBar = document.getElementById('seek-bar');

function getSongTitle(path) {
    const filename = path.split('/').pop().split('.')[0];
    return filename.replace(/_/g, ' ').replace(/-/g, ' ');
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function loadSong(index, autoPlay = true) {
    audio.src = songs[index];
    const titleEl = document.getElementById('track-title');
    titleEl.textContent = getSongTitle(songs[index]);
    audio.load();
    if (autoPlay) {
        audio.play().then(() => {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline';
        });
    }
}

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    seekBar.value = progress;
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

seekBar.addEventListener('input', () => {
    const seekTime = (seekBar.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

playBtn.addEventListener('click', () => {
    audio.play();
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'inline';
});

pauseBtn.addEventListener('click', () => {
    audio.pause();
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'inline';
});

prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
});

nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
});

repeatBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    repeatBtn.classList.toggle('active', isLooping);
});

audio.addEventListener('ended', () => {
    if (isLooping) {
        audio.play();
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
    }
});

// Cargar la primera canción al inicio (pero como el player está oculto, no reproduce hasta que se muestre)
loadSong(currentSongIndex, false);

// Lógica del libro virtual
const bookPages = [
    'img/portada.jpg',
    'img/imagen1.jpg',
    'img/imagen2.jpg',
    'img/imagen3-jpg',
    'img/portda_trasera.jpg'
];

const book = document.getElementById('virtual-book');
let currentBookPage = 0;
let startX = 0;
let endX = 0;
const swipeThreshold = 50;

function createPages() {
    for (let i = 0; i < bookPages.length; i++) {
        const page = document.createElement('div');
        page.classList.add('page');
        page.style.zIndex = bookPages.length - i;

        const front = document.createElement('div');
        front.classList.add('front');

        const img = new Image();
        img.src = bookPages[i];
        img.alt = `Página ${i + 1}`;
        front.appendChild(img);

        const back = document.createElement('div');
        back.classList.add('back');

        page.appendChild(front);
        page.appendChild(back);
        book.appendChild(page);
    }

    const indicator = document.createElement('div');
    indicator.classList.add('page-indicator');
    for (let j = 0; j < bookPages.length; j++) {
        const dot = document.createElement('div');
        dot.classList.add('page-dot');
        if (j === 0) dot.classList.add('active');
        indicator.appendChild(dot);
    }
    book.after(indicator);
}

function updatePageIndicator() {
    const dots = document.querySelectorAll('.page-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentBookPage);
    });
}

function setupBookEvents() {
    let isMouseDown = false;

    // ========== MOUSE ==========
    book.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isMouseDown = true;
        book.style.cursor = 'grabbing';
    });

    book.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            endX = e.clientX;
        }
    });

    const endMouseDrag = () => {
        if (isMouseDown) {
            handleSwipe();
            isMouseDown = false;
            book.style.cursor = 'grab';
        }
    };

    book.addEventListener('mouseup', endMouseDrag);
    book.addEventListener('mouseleave', endMouseDrag);

    // ========== TOUCH ==========
    book.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    book.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
        const deltaX = Math.abs(endX - startX);
        const deltaY = Math.abs(e.touches[0].clientY - startY);
        
        // Prevenir scroll si es swipe horizontal
        if (deltaX > deltaY && deltaX > 10) {
            e.preventDefault();
        }
    }, { passive: false });

    book.addEventListener('touchend', handleSwipe, { passive: true });

    // Cursor inicial
    book.style.cursor = 'grab';
}

function handleSwipe() {
    const diff = startX - endX;
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left: next page
            flipNext();
        } else {
            // Swipe right: previous page
            flipPrevious();
        }
    }
    startX = 0;
    endX = 0;
}

function flipNext() {
    if (currentBookPage < bookPages.length - 1) {
        const pageToFlip = book.children[currentBookPage];
        pageToFlip.classList.add('flipped');  // ← Solo esto es necesario
        
        currentBookPage++;
        updatePageIndicator();
    }
}

function flipPrevious() {
    if (currentBookPage > 0) {
        currentBookPage--;
        const pageToUnflip = book.children[currentBookPage];
        pageToUnflip.classList.remove('flipped');  // ← Solo esto es necesario
        
        updatePageIndicator();
    }
}

createPages();
setupBookEvents();

// Secuencia de introducción
window.onload = () => {
    const snoopy = document.getElementById('snoopy');

    // Esconder intro después de la animación de Snoopy
    snoopy.addEventListener('animationend', () => {
        intro.style.display = 'none';
    });

    // Abrir intro
    setTimeout(() => intro.classList.add('open'), 800);
    setTimeout(() => intro.classList.add('show-snoopy'), 2200);

    // Iniciar globos cuando comienza la animación de Snoopy
    snoopy.addEventListener('animationstart', () => {
        const duration = 3500;
        const balloonsStart = duration * 0.25;

        setTimeout(() => {
            for (let i = 0; i < MAX_BALLOONS; i++) {
                setTimeout(createBalloon, i * 45);
            }
            // Iniciar animaciones nuevas cuando empiezan los globos
            setTimeout(() => {
                document.getElementById('happy-birthday').classList.add('active');
            }, 2000);

            setTimeout(() => {
                document.getElementById('side-left').classList.add('active');
                document.getElementById('side-right').classList.add('active');
            }, 4700);
            document.getElementById('num2').classList.add('active');
            document.getElementById('num1').classList.add('active');
            setTimeout(() => {
                document.getElementById('camera-container').classList.add('active');
            }, 2000);

            // Habilitar interacción en la cámara después de que terminen las animaciones
            setTimeout(() => {
                const cameraContainer = document.getElementById('camera-container');
                cameraContainer.classList.add('interactive');
                cameraContainer.addEventListener('click', handleCameraClick);
            }, 16000); // Después del último elemento activo + duración de transición (4700 + 4000)

        }, balloonsStart);

    }, { once: true });
};