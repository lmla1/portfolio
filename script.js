const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const starCount = 110;
const tentacleLength = 140;
const mouse = { x: canvas.width / 2, y: canvas.height / 2, isMoving: false };

class Star {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();

        // Draw a pointy star
        const spikes = 5; // Number of spikes
        const outerRadius = this.size;
        const innerRadius = this.size / 2;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();
    }
}

class Circle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.color = 'rgba(0, 191, 255, 0.8)';
        this.radius = 10;
        this.speed = 2;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.connectedStars = [];
        this.pulse = 0;
    }

    update() {
        if (mouse.isMoving) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            this.ax = dx * 0.001;
            this.ay = dy * 0.001;

            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
            const colorIntensity = 1 - distance / maxDistance;
            this.color = `rgba(${Math.floor(255 * colorIntensity)}, ${Math.floor(255 * colorIntensity)}, 255, 0.8)`;
        } else {
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

        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;

        this.updateConnections();
    }

    updateConnections() {
        this.connectedStars = stars
            .filter(star => {
                const dx = star.x - this.x;
                const dy = star.y - this.y;
                return Math.sqrt(dx * dx + dy * dy) < tentacleLength;
            })
            .slice(0, 10);
    }

    draw() {
        this.pulse = Math.sin(Date.now() / 200) * 2;
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

            // Smooth control points for the quadratic curve
            const controlX = (this.x + star.x) / 2 + (mouse.x - this.x) * 0.2 * (index % 4 === 0 ? -1 : 1);
            const controlY = (this.y + star.y) / 2 + (mouse.y - this.y) * 0.2 * (index % 4 === 0 ? -1 : 1);

            // Dynamic line width based on distance
            const lineWidth = 1 + (1 - distance / tentacleLength) * 2;

            // Gradient for smoother color transition
            const gradient = ctx.createLinearGradient(this.x, this.y, star.x, star.y);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(controlX, controlY, star.x, star.y);
            ctx.stroke();
        });
    }
}

// Create stars
for (let i = 0; i < starCount; i++) {
    const size = Math.random() * 2 + 1;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    stars.push(new Star(x, y, size));
}

const circle = new Circle();

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.draw()); // Draw static stars
    circle.update();
    circle.draw();
    circle.drawTentacles();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isMoving = true;
});

canvas.addEventListener('mouseleave', () => {
    mouse.isMoving = false;
    circle.connectedStars = [];
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();