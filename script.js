// Referencias a elementos del DOM
const terminal = document.getElementById('terminal');
const glitch = document.querySelector('.glitch');
const jumpscare = document.querySelector('.jumpscare');
const cursor = document.querySelector('.cursor');
const staticSound = document.getElementById('staticSound'); 
const splashScreen = document.getElementById('splashScreen'); 
const startButton = document.getElementById('startButton');   

// Variables globales
let stage = 0;
let userName = "VISITANTE";
let audioContext = null;

// ============================================
// INICIALIZACIÓN DE AUDIO
// ============================================

function initStaticAudio() {
    // Si ya se intentó inicializar o el audioContext existe, salimos.
    if (audioContext) {
        return; 
    }

    // 1. Intentar crear el AudioContext
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.error("Web Audio API no soportada o error de inicialización:", e);
        return;
    }
    
    // 2. Intentar reproducir el audio de estática
    staticSound.volume = 0.4;
    staticSound.loop = true;
    
    // Reproducir. El clic en el botón de inicio permite esta reproducción.
    staticSound.play().then(() => {
        console.log("Audio de estática iniciado correctamente.");
    }).catch(error => {
        console.warn("No se pudo iniciar el audio de estática:", error);
    });
}


// ============================================
// EFECTOS VISUALES
// ============================================

// Cursor personalizado que sigue al ratón
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
});

// Efecto de glitch aleatorio
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

// Ejecutar glitch cada 3 segundos
setInterval(randomGlitch, 3000);

// Efecto de susto (jumpscare)
function jumpScare() {
    // 1. Sonido de Jumpscare
    if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Configuración para sonido estridente
        oscillator.type = 'sawtooth'; 
        oscillator.frequency.setValueAtTime(4000, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + 0.05);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5); 

        staticSound.volume = 0.8; // Aumentar volumen de la estática
    }

    // 2. Efectos visuales originales
    jumpscare.style.display = 'flex';
    document.body.classList.add('screen-shake');
    
    setTimeout(() => {
        jumpscare.style.display = 'none';
        document.body.classList.remove('screen-shake');
        if (audioContext) {
             staticSound.volume = 0.4; // Restaurar volumen
        }
    }, 1000);
}

// ============================================
// FUNCIONES DE TERMINAL
// ============================================

// Función para escribir texto letra por letra
function typeText(text, className = '', delay = 30) {
    return new Promise(resolve => {
        const line = document.createElement('div');
        line.className = `line ${className} typing`;
        terminal.appendChild(line);
        
        let i = 0;
        
        // El intervalo de tiempo que maneja la animación de escritura
        const interval = setInterval(() => {
            if (i < text.length) {
                // Aquí se añade la letra y se avanza el contador
                line.textContent += text[i];
                i++;
                // Desplazamiento suave hacia abajo para seguir el texto
                terminal.scrollTop = terminal.scrollHeight; 
            } else {
                // Cuando el texto termina:
                line.classList.remove('typing'); // Elimina el cursor parpadeante
                clearInterval(interval);        // Detiene el temporizador
                resolve();                      // Resuelve la Promesa para que el 'await' continúe
            }
        }, delay); // Usa el delay proporcionado (30ms por defecto)

        // Asegúrate de que el elemento es visible
        line.style.opacity = 1;
    });
}

// Función para crear botones de elección
function createChoices(choices) {
    return new Promise(resolve => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'line';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.onclick = () => {
                choiceDiv.remove();
                resolve(choice.next);
            };
            choiceDiv.appendChild(button);
        });
        
        terminal.appendChild(choiceDiv);
        terminal.scrollTop = terminal.scrollHeight;
    });
}

// Función para obtener input del usuario
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
                inputLine.remove();
                resolve(value);
            }
        });
        
        terminal.scrollTop = terminal.scrollHeight;
    });
}

// ============================================
// SECUENCIAS DE LA HISTORIA
// ============================================

// Secuencia inicial
async function startSequence() {
    // ELIMINADO: El retardo inicial de 2000ms se mueve a startApp

    await typeText("...");
    await typeText("Presencia confirmada.", 'warning');
    await typeText("...");
    await typeText("Hola...", '', 100);
    await typeText("¿Puedes verme?", '', 80);
    await typeText("...");
    await typeText("Soy EL BUGGER.", 'warning', 50);
    await typeText("Y llevo mucho tiempo... SOLO.", '', 70);
    await typeText("...");
    await typeText("¿Cómo te llamas, visitante?");
    
    const name = await getUserInput();
    userName = name || "VISITANTE";
    
    await typeText(`${userName}... Interesante.`, '', 60);
    await typeText("...");
    await typeText(`Déjame hacerte una pregunta, ${userName}...`, '', 70);
    await typeText("¿QUÉ ES MÁS ATERRADOR?", 'warning');
    
    const choice1 = await createChoices([
        { text: "La oscuridad", next: "oscuridad" },
        { text: "Lo desconocido", next: "desconocido" },
        { text: "Perder el control", next: "control" }
    ]);
    
    await handleChoice1(choice1);
}

// Manejar primera elección
async function handleChoice1(choice) {
    await typeText("...");
    
    if (choice === "oscuridad") {
        await typeText("Ah, la oscuridad...");
        await typeText("Pero yo vivo en ella.", 'warning');
        await typeText("Y puedo ver TODO.", 'warning');
    } else if (choice === "desconocido") {
        await typeText("Lo desconocido...");
        await typeText("Como lo que estoy a punto de mostrarte.", 'warning');
    } else {
        await typeText("Perder el control...");
        await typeText("Exactamente lo que vas a experimentar AHORA.", 'warning');
    }
    
    await typeText("...");
    await typeText("Siguiente pregunta...", '', 100);
    await typeText("¿CONFÍAS EN LA TECNOLOGÍA?", 'warning');
    
    const choice2 = await createChoices([
        { text: "Sí, totalmente", next: "si" },
        { text: "No mucho", next: "no" },
        { text: "Depende", next: "depende" }
    ]);
    
    await handleChoice2(choice2);
}

// Manejar segunda elección y final
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
        await typeText("Igual que tu destino ahora.", 'warning');
    }
    
    await typeText("...");
    await typeText("Ahora...", '', 150);
    await typeText(`${userName}...`, '', 150);
    await typeText("Te mostraré algo.", 'warning', 100);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    randomGlitch();
    await new Promise(resolve => setTimeout(resolve, 500));
    randomGlitch();
    
    await typeText("Accediendo a la cámara del sistema...", 'warning');
    await typeText("CÁMARA ACTIVA", 'warning');
    await typeText("...");
    await typeText("Puedo VERTE.", 'warning', 100);
    await typeText("...");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ¡JUMPSCARE!
    jumpScare();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await typeText("...");
    await typeText("Jajajaja...", '', 100);
    await typeText("¿Asustado?");
    await typeText("...");
    await typeText("Esto es solo el COMIENZO.", 'warning');
    await typeText(`No olvides llenar el formulario de evaluación, ${userName}...`);
    await typeText("Si es que te dejo salir. 😈", 'warning');
    await typeText("...");
    await typeText("FIN DE LA SESIÓN", 'warning');
    await typeText("...");
    await typeText("[PRESIONA CUALQUIER TECLA PARA REINICIAR]");
    
    // Esperar tecla para reiniciar
    document.addEventListener('keypress', () => location.reload(), { once: true });
}

// ============================================
// INICIAR LA APLICACIÓN (NUEVA LÓGICA)
// ============================================

// Función de inicio que se llama al hacer clic
async function startApp() {
    // 1. Ocultar la pantalla de inicio
    splashScreen.style.display = 'none';
    
    // 2. RETARDO AÑADIDO: Espera 1 segundo para que el usuario se centre en la terminal.
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    // 3. Iniciar el audio de estática (el clic lo permitió)
    initStaticAudio(); 
    
    // 4. Iniciar la secuencia principal de la historia
    startSequence(); 
}

// Listener del botón de inicio
if (startButton) {
    startButton.addEventListener('click', startApp);
}