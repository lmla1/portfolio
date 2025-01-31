const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const STAR_COUNT = 100;
const TENTACLE_LENGTH = 300;
const MOUSE_INFLUENCE = 0.001;
const PULSE_SPEED = 200;
const CIRCLE_RADIUS = 10;
const CIRCLE_SPEED = 2;
const MAX_CONNECTIONS = 10;
const AUTO_MOVE_SPEED = 0.5; // Slower speed for automatic movement

const mouse = { x: canvas.width / 2, y: canvas.height / 2, isMoving: false };

class Star {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.baseSize = size;
        this.pulse = 0;
    }

    draw() {
        this.pulse = Math.sin(Date.now() / PULSE_SPEED) * this.baseSize * 0.2;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + this.pulse, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Circle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.color = 'rgba(0, 191, 255, 0.8)';
        this.radius = CIRCLE_RADIUS;
        this.speed = CIRCLE_SPEED;
        this.vx = (Math.random() - 0.5) * AUTO_MOVE_SPEED; // Initial slow movement
        this.vy = (Math.random() - 0.5) * AUTO_MOVE_SPEED;
        this.ax = 0;
        this.ay = 0;
        this.connectedStars = [];
        this.pulse = 0;
    }

    update() {
        if (mouse.isMoving) {
            // Respond to mouse movement
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            this.ax = dx * MOUSE_INFLUENCE;
            this.ay = dy * MOUSE_INFLUENCE;

            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
            const colorIntensity = 1 - distance / maxDistance;
            this.color = `rgba(${Math.floor(255 * colorIntensity)}, ${Math.floor(255 * colorIntensity)}, 255, 0.8)`;
        } else {
            // Automatic slow movement
            this.ax = (Math.random() - 0.5) * 0.02;
            this.ay = (Math.random() - 0.5) * 0.02;
            this.color = 'rgba(0, 191, 255, 0.8)';
        }

        this.vx += this.ax;
        this.vy += this.ay;
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.95;
        this.vy *= 0.95;

        // Bounce off edges
        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;

        this.updateConnections();
    }

    updateConnections() {
        this.connectedStars = stars
            .filter(star => {
                const dx = star.x - this.x;
                const dy = star.y - this.y;
                return Math.sqrt(dx * dx + dy * dy) < TENTACLE_LENGTH;
            })
            .slice(0, MAX_CONNECTIONS);
    }

    draw() {
        this.pulse = Math.sin(Date.now() / PULSE_SPEED) * 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + this.pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawTentacles() {
        this.connectedStars.forEach((star, index) => {
            const dx = star.x - this.x;
            const dy = star.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const controlX = (this.x + star.x) / 2 + (mouse.x - this.x) * 0.2 * (index % 4 === 0 ? -1 : 1);
            const controlY = (this.y + star.y) / 2 + (mouse.y - this.y) * 0.2 * (index % 4 === 0 ? -1 : 1);
            const gradient = ctx.createLinearGradient(this.x, this.y, star.x, star.y);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1 + (1 - distance / TENTACLE_LENGTH) * 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(controlX, controlY, star.x, star.y);
            ctx.stroke();
        });
    }
}

const stars = Array.from({ length: STAR_COUNT }, () => {
    const size = Math.random() * 2 + 1;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    return new Star(x, y, size);
});

const circles = Array.from({ length: 1 }, () => new Circle());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.draw());
    circles.forEach(circle => {
        circle.update();
        circle.draw();
        circle.drawTentacles();
    });
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isMoving = true;
});

canvas.addEventListener('mouseleave', () => {
    mouse.isMoving = false;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();