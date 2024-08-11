class Ball {
    constructor(x, y, speedX, speedY, radius, color) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.radius = radius;
        this.color = color;
        this.trail = [];
    }

    draw(ctx) {
        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;

        // Draw ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();

        // Add gloss effect
        const gradient = ctx.createRadialGradient(
            this.x - this.radius / 4, this.y - this.radius / 4, this.radius / 8,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();

        // Reset shadow to avoid affecting other drawings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    move(canvas) {
        // Save the current position to the trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) {
            this.trail.shift(); // Limit the length of the trail
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Ball collision with left and right walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.speedX = -this.speedX;
        }

        // Ball collision with top and bottom walls
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.speedY = -this.speedY;
        }
    }

    checkCollision(otherBall) {
        const dx = this.x - otherBall.x;
        const dy = this.y - otherBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + otherBall.radius;
    }

    resolveCollision(otherBall) {
        const dx = this.x - otherBall.x;
        const dy = this.y - otherBall.y;

        const collisionAngle = Math.atan2(dy, dx);

        const speed1 = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        const speed2 = Math.sqrt(otherBall.speedX * otherBall.speedX + otherBall.speedY * otherBall.speedY);

        const direction1 = Math.atan2(this.speedY, this.speedX);
        const direction2 = Math.atan2(otherBall.speedY, otherBall.speedX);

        const velocityX1 = speed1 * Math.cos(direction1 - collisionAngle);
        const velocityY1 = speed1 * Math.sin(direction1 - collisionAngle);
        const velocityX2 = speed2 * Math.cos(direction2 - collisionAngle);
        const velocityY2 = speed2 * Math.sin(direction2 - collisionAngle);

        const finalVelocityX1 = ((this.radius - otherBall.radius) * velocityX1 + (2 * otherBall.radius) * velocityX2) / (this.radius + otherBall.radius);
        const finalVelocityX2 = ((2 * this.radius) * velocityX1 + (otherBall.radius - this.radius) * velocityX2) / (this.radius + otherBall.radius);

        const finalVelocityY1 = velocityY1;
        const finalVelocityY2 = velocityY2;

        this.speedX = Math.cos(collisionAngle) * finalVelocityX1 + Math.cos(collisionAngle + Math.PI / 2) * finalVelocityY1;
        this.speedY = Math.sin(collisionAngle) * finalVelocityX1 + Math.sin(collisionAngle + Math.PI / 2) * finalVelocityY1;
        otherBall.speedX = Math.cos(collisionAngle) * finalVelocityX2 + Math.cos(collisionAngle + Math.PI / 2) * finalVelocityY2;
        otherBall.speedY = Math.sin(collisionAngle) * finalVelocityX2 + Math.sin(collisionAngle + Math.PI / 2) * finalVelocityY2;

        // Position correction to avoid overlap
        const overlap = this.radius + otherBall.radius - Math.sqrt(dx * dx + dy * dy);
        const correctionX = (overlap / 2) * Math.cos(collisionAngle);
        const correctionY = (overlap / 2) * Math.sin(collisionAngle);

        this.x += correctionX;
        this.y += correctionY;
        otherBall.x -= correctionX;
        otherBall.y -= correctionY;
    }

}

class Rectangle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor(canvasId, numBalls) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.balls = [];
        this.addBalls(numBalls)

    }

    addBalls(count) {
        for (let i = 0; i < count; i++) {
            this.balls.push(new Ball(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                parseInt(Math.random()*20),
                this.getRandomColor()
            ));
        }
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawEverything() {
        // Clear the canvas
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, 'white');

        // Draw all balls
        for (let ball of this.balls) {
            ball.draw(this.ctx);
        }
    }

    moveEverything() {
        for (let ball of this.balls) {
            ball.move(this.canvas);
        }

        // Check for collisions between balls
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                if (this.balls[i].checkCollision(this.balls[j])) {
                    this.balls[i].resolveCollision(this.balls[j]);
                }
            }
        }

    }

    gameLoop() {
        this.moveEverything();
        this.drawEverything();
    }

    start() {
        setInterval(() => this.gameLoop(), 1000 / 30); // 30 frames per second
        setInterval(() => {
                this.addBalls(10);
        }, 2000);
    }
}

// Start the game
const game = new Game('gameCanvas', 10);
game.start();

