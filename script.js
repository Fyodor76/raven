const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas')
const collisionCtx = collisionCanvas.getContext('2d')
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

const sounds = [
    new Audio('./sounds/1.mp3'),
    new Audio('./sounds/2.mp3'),
    new Audio('./sounds/3.mp3'),
    new Audio('./sounds/4.mp3'),
    new Audio('./sounds/5.mp3'),
    new Audio('./sounds/6.mp3')
]
let score = 0;
ctx.font = '50px Impact'
let ravens = [];

let timeToNextRaven = 0;
let ravenInterval = 1500;
let lastTime = 0;
let gameOver = false;

class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeMod = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth / 2 * this.sizeMod;
        this.height = this.spriteHeight / 2 * this.sizeMod;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 100;
        this.randomColors = [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
        ]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1]
        + ',' + this.randomColors[2] + ')'
    }

    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) {
            this.markedForDeletion = true;
        }

        this.timeSinceFlap += deltaTime;

        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            } else {
                this.frame++
            }
            this.timeSinceFlap = 0;
        }
        if (this.x < 0 - this.width) {
            gameOver = true;
        }
    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height)
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height)
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image;
        this.image.src = './images/boom.png';
        this.spriteWidth = 200;
        this.spriteHeigth = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.audious = sounds;
        this.randomValue = Math.floor(Math.random() * 6)
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        if (this.frame === 0) {
            console.log(this.randomValue)
            this.audious[this.randomValue].play();
        }
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++
            if (this.frame > 5) {
                this.markedForDeletion = true;
            }
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth,
            this.spriteHeigth, this.x, this.y - this.size/4, this.size, this.size)
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('score' + score, 55, 80);
}

window.addEventListener('click', function (e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    ravens.forEach((r) => {
        if (r.randomColors[0] === pc[0] &&
            r.randomColors[1] === pc[1] &&
            r.randomColors[2] === pc[2]) {
            r.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(r.x, r.y, r.width))
        }
    })
})

function drawGameOver () {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText("GAME OVER, your score is " + score, canvas.width / 2, canvas.height / 2)
}



function animate (timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height)
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp
    timeToNextRaven += deltaTime;

    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort((a, b) => a.width - b.width)
    }
    drawScore();
    [...ravens, ...explosions].forEach(r => r.update(deltaTime));
    [...ravens, ...explosions].forEach(r => r.draw());
    ravens = ravens.filter(r => !r.markedForDeletion)
    explosions = explosions.filter(cl => !cl.markedForDeletion)

    if (!gameOver) {
        requestAnimationFrame(animate)
    } else {
        drawGameOver()
    }
}

animate(0)