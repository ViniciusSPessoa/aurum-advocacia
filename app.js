"use strict";

// ============================================================
// AURUM — Interações da landing page
// ============================================================

// 01. Configurações gerais

const CONFIG = {
    whatsappNumber: "",
    revealThreshold: 0.08,
    parallax: {
        smoothing: 0.09,
        horizontalIntensity: 18,
        verticalIntensity: 12,
        scale: 1.035,
        precision: 0.1,
    },
};

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

// 02. Menu de navegação

function initializeNavigation() {
    const menuButton = document.querySelector("#menu");
    const navigation = document.querySelector("#nav");

    if (!menuButton || !navigation) {
        return;
    }

    function toggleMenu() {
        const isOpen = navigation.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    }

    function closeMenu() {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.addEventListener("click", toggleMenu);

    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });
}

// 03. Animações de entrada durante a rolagem

function initializeRevealAnimations() {
    // Sem suporte ao observador ou com movimento reduzido,
    // mantém o conteúdo visível sem animação JavaScript.
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        return;
    }

    const animatedElements = document.querySelectorAll(".reveal");

    function revealVisibleElements(entries, observer) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }

    const observer = new IntersectionObserver(revealVisibleElements, {
        threshold: CONFIG.revealThreshold,
    });

    document.documentElement.classList.add("js");

    animatedElements.forEach((element) => {
        observer.observe(element);
    });
}

// 04. Áreas de atuação e troca de imagens

function initializePracticeAreas() {
    const panels = document.querySelectorAll(".panels details");
    const practiceImages = document.querySelectorAll(".practice-photo");

    // A ordem dos painéis deve corresponder à ordem das imagens.
    function activatePanel(selectedPanel, selectedIndex) {
        panels.forEach((panel) => {
            if (panel !== selectedPanel) {
                panel.open = false;
            }
        });

        practiceImages.forEach((image, imageIndex) => {
            image.classList.toggle("active", imageIndex === selectedIndex);
        });
    }

    panels.forEach((panel, panelIndex) => {
        panel.addEventListener("toggle", () => {
            if (panel.open) {
                activatePanel(panel, panelIndex);
            }
        });
    });
}

// 05. Contato pelo WhatsApp 

function initializeWhatsApp() {
    const contactButton = document.querySelector("#whatsapp");

    if (!contactButton) {
        return;
    }

    function openWhatsApp() {
        const phoneNumber = CONFIG.whatsappNumber;
        const isValidNumber = /^\d{10,15}$/.test(phoneNumber);

        if (isValidNumber) {
            window.location.href = `https://wa.me/${phoneNumber}`;
            return;
        }

        const message = "Contato demonstrativo. Configure o número autorizado para ativar.";
        const notice = document.querySelector("#notice");

        // O HTML atual não possui #notice. Usa um aviso nativo
        // como alternativa, sem modificar a estrutura da página.
        if (notice) {
            notice.textContent = message;
        } else {
            window.alert(message);
        }
    }

    contactButton.addEventListener("click", openWhatsApp);
}

// 06. Efeito parallax da imagem principal

function initializeHeroParallax() {
    if (prefersReducedMotion) {
        return;
    }

    const heroSection = document.querySelector(".hero");
    const justiceImage = document.querySelector(".justice");

    if (!heroSection || !justiceImage) {
        return;
    }

    const settings = CONFIG.parallax;

    // Posição atual e posição desejada da imagem, em pixels.
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrameId = null;

    // Aproxima gradualmente a imagem da posição desejada.
    function animateFrame() {
        animationFrameId = null;

        currentX += (targetX - currentX) * settings.smoothing;
        currentY += (targetY - currentY) * settings.smoothing;

        justiceImage.style.transform =
            `translate3d(${currentX}px,${currentY}px,0) scale(${settings.scale})`;

        const remainingDistance =
            Math.abs(targetX - currentX) + Math.abs(targetY - currentY);

        if (remainingDistance > settings.precision) {
            scheduleAnimation();
        }
    }

    // Impede o agendamento de dois quadros simultaneamente.
    function scheduleAnimation() {
        if (animationFrameId === null) {
            animationFrameId = window.requestAnimationFrame(animateFrame);
        }
    }

    function handlePointerMove(event) {
        if (event.pointerType !== "mouse") {
            return;
        }

        targetX = (event.clientX / window.innerWidth - 0.5) * settings.horizontalIntensity;
        targetY = (event.clientY / window.innerHeight - 0.5) * settings.verticalIntensity;

        scheduleAnimation();
    }

    function resetPosition() {
        targetX = 0;
        targetY = 0;
        scheduleAnimation();
    }

    heroSection.addEventListener("pointermove", handlePointerMove);
    heroSection.addEventListener("pointerleave", resetPosition);
}

// 07. Inicialização da página

function initializeApplication() {
    initializeNavigation();
    initializeRevealAnimations();
    initializePracticeAreas();
    initializeWhatsApp();
    initializeHeroParallax();
}

// O HTML carrega app.js com defer, após a leitura da estrutura.
initializeApplication();

// Fim do arquivo
