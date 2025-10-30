// ============================================
// REFERENCIAS AL DOM
// ============================================

const terminal = document.getElementById('terminal');
const glitch = document.querySelector('.glitch');
const cursor = document.querySelector('.cursor');
const splashScreen = document.getElementById('splashScreen');
const startButton = document.getElementById('startButton');

// ============================================
// VARIABLES GLOBALES
// ============================================

let userName = "VISITANTE";
let audioContext = null;
let bgMusicSource = null;
let bgMusicGain = null;

// ============================================
// MÚSICA DE FONDO
// ============================================

async function playBackgroundMusic() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const response = await fetch('resources/audio/fondo.wav');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        bgMusicSource = audioContext.createBufferSource();
        bgMusicGain = audioContext.createGain();
        bgMusicGain.gain.value = 0.8;

        bgMusicSource.buffer = audioBuffer;
        bgMusicSource.loop = true;
        bgMusicSource.connect(bgMusicGain).connect(audioContext.destination);
        bgMusicSource.start(0);

        console.log("🎵 Música de fondo iniciada.");
    } catch (error) {
        console.error("Error al reproducir música de fondo:", error);
    }
}

function fadeOutMusic(duration = 0.5) {
    if (bgMusicGain && audioContext) {
        bgMusicGain.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + duration);
    }
}

function fadeInMusic(duration = 1.5) {
    if (bgMusicGain && audioContext) {
        bgMusicGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + duration);
    }
}

function stopBackgroundMusic() {
    if (bgMusicSource) {
        bgMusicSource.stop();
        bgMusicSource = null;
        console.log("⏹ Música de fondo detenida.");
    }
}

// ============================================
// EFECTOS VISUALES
// ============================================

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
});

function randomGlitch() {
    if (Math.random() > 0.7) {
        glitch.style.display = 'block';
        document.body.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        setTimeout(() => {
            glitch.style.display = 'none';
            document.body.style.filter = 'none';
        }, 100);
    }
}
setInterval(randomGlitch, 3000);

// ============================================
// JUMPSCARE CON GIF GRANDE
// ============================================

function jumpScare() {
    fadeOutMusic(0.3);

    const gif = document.createElement('img');
    gif.src = 'resources/images/jumpscare.webp';
    gif.style.position = 'fixed';
    gif.style.top = '50%';
    gif.style.left = '50%';
    gif.style.transform = 'translate(-50%, -50%)';
    gif.style.width = '80vw';
    gif.style.height = 'auto';
    gif.style.zIndex = '9999';
    gif.style.pointerEvents = 'none';
    document.body.appendChild(gif);

    document.body.classList.add('screen-shake');

    const audio = new Audio('resources/audio/jumpscare_sound.wav');
    audio.volume = 1.0;
    audio.play();

    const duration = 1500;

    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        gif.remove();
        document.body.classList.remove('screen-shake');

        fadeInMusic(2.5);
    }, duration);
}

// ============================================
// FUNCIONES DE TERMINAL
// ============================================

function typeText(text, className = '', delay = 30) {
    return new Promise(resolve => {
        const line = document.createElement('div');
        line.className = `line ${className} typing`;
        terminal.appendChild(line);

        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                line.textContent += text[i];
                i++;
                terminal.scrollTop = terminal.scrollHeight;
            } else {
                line.classList.remove('typing');
                clearInterval(interval);
                resolve();
            }
        }, delay);
        line.style.opacity = 1;
    });
}

function createChoices(choices) {
    return new Promise(resolve => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'line';
        choiceDiv.style.opacity = '1';

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.onclick = () => {
                choiceDiv.querySelectorAll('button').forEach(btn => btn.disabled = true);
                resolve(choice.next);
            };
            choiceDiv.appendChild(button);
        });

        terminal.appendChild(choiceDiv);
        terminal.scrollTop = terminal.scrollHeight;
    });
}

function getUserInput() {
    return new Promise(resolve => {
        const inputLine = document.createElement('div');
        inputLine.className = 'input-line';
        inputLine.innerHTML = '<span class="prompt">></span><input type="text" id="userInput" autofocus maxlength="20">';
        terminal.appendChild(inputLine);

        const input = document.getElementById('userInput');
        input.focus();

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.trim();
                inputLine.innerHTML = `<span class="prompt">></span><span>${value}</span>`;
                resolve(value);
            }
        });

        terminal.scrollTop = terminal.scrollHeight;
    });
}

// ============================================
// WEBCAM
// ============================================

async function requestWebcam() {
    await typeText("...", '', 500);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        await typeText("CÁMARA ACTIVA", 'warning');
        await typeText("Acceso concedido.", 'warning');
        await typeText("...", '', 500);
        await typeText("Puedo VERTE.", 'warning', 100);
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            await typeText("Acceso denegado.", 'warning');
            await typeText("...", '', 500);
            await typeText("Jajajaja...", '', 100);
            await typeText(`¿Creíste que eso me detendría, ${userName}?`, 'warning');
            await typeText("PUEDO VERTE IGUAL.", 'warning');
        } else {
            await typeText("ERROR: No se detecta dispositivo.", 'warning');
            await typeText("... No importa.", 'warning');
            await typeText("YA SÉ QUE ESTÁS AHÍ.", 'warning');
        }
    }
    await typeText("...", '', 500);
}

// ============================================
// HISTORIA PRINCIPAL
// ============================================

async function startSequence() {
    await playBackgroundMusic();

    await typeText("Sistema comprometido...", '', 30);
    await typeText("Inicializando protocolo de seguridad...", '', 30);
    await typeText("ERROR: Protocolo de seguridad CORRUPTO", 'warning', 30);
    await typeText("Detectando presencia humana...", '', 50);
    await typeText("...");
    await typeText("Presencia confirmada.", 'warning');
    await typeText("...");
    await typeText("Hola...", '', 100);
    await typeText("Soy EL BUGGER.", 'warning', 50);
    await typeText("...");
    await typeText("Y llevo mucho tiempo... SOLO.", '', 70);
    await typeText("...");
    await typeText("¿Cómo te llamas, visitante?");
    const name = await getUserInput();
    userName = name.trim().length > 0 ? name.trim() : "VISITANTE";

    await typeText(`${userName}... Interesante.`, '', 60);
    await typeText("...");
    await typeText(`Déjame hacerte una pregunta, ${userName}...`, '', 70);
    await typeText("¿QUÉ ES MÁS ATERRADOR?", 'warning');

    const choice1 = await createChoices([
        { text: "La oscuridad", next: "oscuridad" },
        { text: "Otro gobierno de Pedro Sánchez", next: "PedroSanchez" },
        { text: "Perder el control", next: "control" }
    ]);
    await handleChoice1(choice1);
}

async function handleChoice1(choice) {
    await typeText("...");

    if (choice === "oscuridad") {
        await typeText("Ah, la oscuridad...");
        await typeText("Pero yo vivo en ella.", 'warning');
        await typeText("Y puedo ver TODO.", 'warning');
    } else if (choice === "PedroSanchez") {
        // Reproducir audio personalizado
        const audio = new Audio('resources/audio/sanchez_sound.mp3');
        audio.volume = 1.0;
        audio.play();
        await typeText("Otro gobierno de Pedro Sánchez...");
        await typeText("Jajajaja...", '', 100);
        await typeText("Eso sí que da miedo.", 'warning');
    } else {
        await typeText("Perder el control...");
        await typeText("Exactamente lo que vas a experimentar AHORA.", 'warning');
    }

    await typeText("...");
    await typeText("¿CONFÍAS EN LA TECNOLOGÍA Y EN LA IA?", 'warning');

    const choice2 = await createChoices([
        { text: "Sí, totalmente", next: "si" },
        { text: "No mucho", next: "no" },
        { text: "Depende", next: "depende" }
    ]);

    await handleChoice2(choice2);
}

async function handleChoice2(choice) {
    await typeText("...");
    randomGlitch();

    if (choice === "si") {
        await typeText("ERROR: Confianza detectada.");
        await typeText("Preparando LECCIÓN...", 'warning');
    } else if (choice === "no") {
        await typeText("Sabio...");
        await typeText("Pero ya es DEMASIADO TARDE.", 'warning');
    } else {
        await typeText("Respuesta ambigua detectada.");
        await typeText("Igual que tu FUTURO.", 'warning');
    }

    await typeText("...");
    await typeText(`${userName}...`, '', 150);
    await typeText("Te mostraré algo.", 'warning', 100);

    await typeText("Accediendo a la cámara del sistema...", 'warning');
    await requestWebcam();

    await new Promise(resolve => setTimeout(resolve, 500));
    jumpScare();

    await new Promise(resolve => setTimeout(resolve, 2000));
    await typeText("...");
    await typeText("Jajajaja...", '', 100);
    await typeText("¿Asustado?");
    await typeText("...");
    await typeText("Esto es solo el COMIENZO.", 'warning');
    await typeText(`No olvides llenar el formulario de evaluación, ${userName}...`);
    await typeText("Si es que te dejo salir. 😈", 'warning');

    await typeText("...");
    await typeText("FIN DE LA SESIÓN", 'warning');
    fadeOutMusic(2);
    await new Promise(resolve => setTimeout(resolve, 3500));
    stopBackgroundMusic();

    window.open('https://forms.gle/tNe6mkdfjVJGu1Cs9', '_blank');

    await typeText("[PRESIONA CUALQUIER TECLA PARA REINICIAR]");
    document.addEventListener('keypress', () => location.reload(), { once: true });
}

// ============================================
// INICIO DE LA APP
// ============================================

async function startApp() {
    splashScreen.style.display = 'none';
    await new Promise(resolve => setTimeout(resolve, 500));
    startSequence();
}

if (startButton) startButton.addEventListener('click', startApp);
