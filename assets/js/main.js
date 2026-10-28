// Theme: remember light/dark between visits
const body = document.body;
const themeToggleBtn = document.querySelector('#theme-toggle-btn');

if (localStorage.getItem('currentTheme')) {
    body.classList.add('light-theme');
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');

        if (body.classList.contains('light-theme')) {
            localStorage.setItem('currentTheme', 'themeActive');
        } else {
            localStorage.removeItem('currentTheme');
        }

        drawKoiPictures();
    });
}


// Koi page: draw one of each kind of koi
function drawKoiPictures() {
    if (!window.KoiArt) return;
    document.querySelectorAll('.koi-art').forEach((canvas) => {
        window.KoiArt.drawPreview(canvas, canvas.dataset.variety);
    });
}

drawKoiPictures();


// Menu: highlight the page you're on
const currentPage = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav a').forEach((link) => {
    if (link.getAttribute('href').replace('./', '') === currentPage) {
        link.classList.add('current');
    }
});


// Images: if a photo is missing, show the empty box instead of a broken icon
document.querySelectorAll('.media img').forEach((img) => {
    const hide = () => img.remove();

    if (img.complete && img.naturalWidth === 0) {
        hide();
    } else {
        img.addEventListener('error', hide);
    }
});

// Home typewriter: types one sentence, once
const typewriterText = document.querySelector('#typewriter-text');

const sentence = 'pushing some buttons with slightly more intention';

let characterIndex = 0;

const typewriter = () => {
    characterIndex++;
    typewriterText.textContent = sentence.substring(0, characterIndex);

    // Keep going until the whole sentence is typed, then stop
    if (characterIndex < sentence.length) {
        setTimeout(typewriter, 65);
    }
};

if (typewriterText) {
    typewriter();
}
// Home: my current time in Toronto
const localTime = document.querySelector('#local-time');

const showTime = () => {
    const time = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/Toronto',
        hour: 'numeric',
        minute: '2-digit',
    });
    localTime.textContent = `${time.toLowerCase()} in Toronto`;
};

if (localTime) {
    showTime();
    setInterval(showTime, 1000); // update every second
}


// // Home typewriter
// const typewriterText = document.querySelector('#typewriter-text');

// const messages = [
//     'aespa',
//     'cooking',
//     'my gf',
//     'chuddling',
//     'adding the tism'
// ];

// let messageIndex = 0;
// let characterIndex = 0;
// let isDeleting = false;

// const typewriter = () => {
//     const currentMessage = messages[messageIndex];

//     if (isDeleting) {
//         characterIndex--;
//     } else {
//         characterIndex++;
//     }

//     typewriterText.textContent = currentMessage.substring(0, characterIndex);

//     let delay = isDeleting ? 35 : 65;

//     // Pause after typing the full phrase
//     if (!isDeleting && characterIndex === currentMessage.length) {
//         isDeleting = true;
//         delay = 1600;
//     }

//     // Move to the next phrase after deleting
//     else if (isDeleting && characterIndex === 0) {
//         isDeleting = false;
//         messageIndex = (messageIndex + 1) % messages.length;
//         delay = 300;
//     }

//     setTimeout(typewriter, delay);
// };


// if (typewriterText) {
//     typewriter();
// }



