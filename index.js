// This will set the canvas size and context for drawing
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1280
canvas.height = 576
const gravity = .5

// Player Class
// This class will handle the player character, its position, velocity, and drawing
const playerImgRight = new Image();
playerImgRight.src = './imgs/player-right.png';

const playerImgLeft = new Image();
playerImgLeft.src = './imgs/player-left.png';

const spriteLeft = new Image();
spriteLeft.src = './imgs/sprite-left.png';

const spriteRight = new Image();
spriteRight.src = './imgs/sprite-right.png';

class Player {
    constructor()
    {
       this.position = {
        x : 100,
        y : 100
    }
    this.velocity = {
        x : 0,
        y : 0
    }
    this.width = 66
    this.height = 150
    this.frames = 0 // Track frames for animation
    this.frameElapsed = 0  // Track elapsed frames for animation
    this.frameHold = 8 // Track frames to hold each sprite
    this.sprites = {
        stand:{
            right: playerImgRight,
            left: playerImgLeft,
            width : 66,
        },
        run:{
            right: spriteRight,
            left: spriteLeft,
            width : 66,
            height : 140
        }
    }
    this.jumpCount = 0 // Track jumps
    this.currentSprite = this.sprites.stand.right // Default sprite
    }
    draw()
    {
        c.drawImage(this.currentSprite, 375 * this.frames, 0, 375, 666, this.position.x, this.position.y + 80, this.width, this.height)
    }
    update(){
        // Animate only if running
        if (this.isRunning) {
            this.frameElapsed++
            if (this.frameElapsed >= this.frameHold) {
                this.frames++
                this.frameElapsed = 0
                if(this.frames > 16){
                    this.frames = 0
                }
            }
        } else {
            this.frames = 0
            this.frameElapsed = 0
        }
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if(this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        } else {
            this.jumpCount = 0
        }
    }
}

// Platform Class
// This class will handle the platforms, their position, and drawing
const platformImg = new Image();
platformImg.src = './imgs/platform.png';

class Platform {
    constructor({x, y})
    {
        this.position = {
            x,
            y
        }
        this.width = platformImg.width
        this.height = platformImg.height
    }
    draw() {
        c.drawImage(platformImg, this.position.x, this.position.y, this.width, this.height)
    }
}

// Grass platform
// This class will handle Grass platforms, their positions and drawings
const grassPlatformImg = new Image();
grassPlatformImg.src = './imgs/grassplatform.png';

class GrassPlatform {
    constructor({x, y})
    {
        this.position = {
            x, y
        }
        this.width = grassPlatformImg.width
        this.height = grassPlatformImg.height
    }
    draw() {
        c.drawImage(grassPlatformImg, this.position.x, this.position.y, this.width, this.height)
    }
}

// Background Class
// This class will handle the background image, its position, and drawing
const backgroundImg = new Image();
backgroundImg.src = './imgs/background.png';

class Background {
    constructor()
    {
        this.position = {
            x: 0,
            y: 0
        }
        this.width = canvas.width
        this.height = canvas.height
    }
    draw() {
        // Stretch the background image to fit the entire canvas
        c.drawImage(backgroundImg, this.position.x, this.position.y, canvas.width, canvas.height);
    }
}

// Initialize player, platforms, keys, and background
let player = new Player()
let platforms = [new Platform({x:-12, y:350}), 
                new Platform({x:390 * 2, y:350}), 
                new Platform({x:1500, y:350}),
                new Platform({x:2800, y:350}),
                new Platform({x:4000, y:350}),
                new Platform({x:5000, y:350}),
                new Platform({x:6000, y:350}),]

let grassplatforms = [new GrassPlatform({x:2480, y:70}),]
                    //   new GrassPlatform({x:300, y:400}),
                    //   new GrassPlatform({x:500, y:400}),
                    //   new GrassPlatform({x:700, y:400}),
                    //   new GrassPlatform({x:900, y:400}),]
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}
let background = new Background()
// Scroll offset for win scenario
let scrollOffset = 0

// Lose message state
let showLoseMessage = false
let loseMsgStart = 0
const loseMsgDuration = 2000

// Tap tracking for jump
// This will allow the player to jump twice in quick succession
let jumpTapTimeout = null
let tapWindow = 250 // ms

function init()
{
player = new Player()
platforms = [new Platform({x:-12, y:350}), 
            new Platform({x:390 * 2, y:350}), 
            new Platform({x:1500, y:350}),
            new Platform({x:2800, y:350}),
            new Platform({x:4000, y:350}),
            new Platform({x:5000, y:350}),
            new Platform({x:6000, y:350}),]

grassplatforms = [new GrassPlatform({x:2480, y:70}),]
                    //   new GrassPlatform({x:300, y:400}),
                    //   new GrassPlatform({x:500, y:400}),
                    //   new GrassPlatform({x:700, y:400}),
                    //   new GrassPlatform({x:900, y:400}),]

background = new Background()

scrollOffset = 0

jumpTapTimeout = null
tapWindow = 250 // ms
}

// This function will be called repeatedly to animate the game
// It will clear the canvas, draw the background, platforms, and player
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.draw()
    platforms.forEach(platform => {
        platform.draw()
    })
    grassplatforms.forEach(grassplatform => {
        grassplatform.draw()
    })

    // Determine if player is running or standing and set sprite accordingly
    if (keys.right.pressed) {
        player.currentSprite = player.sprites.run.right;
        player.isRunning = true;
    } else if (keys.left.pressed) {
        player.currentSprite = player.sprites.run.left;
        player.isRunning = true;
    } else {
        // Standing still
        player.currentSprite = player.sprites.stand.right; // or left, if you want to track last direction
        player.isRunning = false;
        player.frames = 0; // Reset animation frame to 0 for stand
    }
    player.update()

    // Player movement
    if(keys.right.pressed && player.position.x < 400)
    {
        player.velocity.x = 5
    }
    else if(keys.left.pressed && player.position.x > 100)
    {
        player.velocity.x = -5
    }
    else
    {
        // Added friction
        player.velocity.x *= 0.9;
        // Added so that when player moves to left or right so does the platforms
        // This allows the platforms to move with the player
        if(keys.right.pressed)
        {
            platforms.forEach(platform => {
                scrollOffset += 5
                platform.position.x -= 5
            })
            grassplatforms.forEach(grassplatform => {
                scrollOffset += 5
                grassplatform.position.x -= 5
            })
        }
        if(keys.left.pressed)
        {
            platforms.forEach(platform => {
                scrollOffset -= 5
                platform.position.x += 5
            })
            grassplatforms.forEach(grassplatform => {
                scrollOffset -= 5
                grassplatform.position.x += 5
            })
}
    }

    // Platform and grassplatform collision detection
    platforms.forEach(platform => {
        if(player.position.y + player.height <= platform.position.y 
        && player.position.y + player.height + player.velocity.y >= platform.position.y
        && player.position.x + player.width >= platform.position.x 
        && player.position.x <= platform.position.x + platform.width 
    )
    {
        player.velocity.y = 0
        player.jumpCount = 0 // Reset jump count when landing on platform
    }
    })
    grassplatforms.forEach(grassplatform => {
    if(
        player.position.y + player.height <= grassplatform.position.y 
        && player.position.y + player.height + player.velocity.y >= grassplatform.position.y
        && player.position.x + player.width >= grassplatform.position.x 
        && player.position.x <= grassplatform.position.x + grassplatform.width 
    )
    {
        player.velocity.y = 0
        player.jumpCount = 0 // Reset jump count when landing on platform
    }
})

    // You win image
    const youwinImg = new Image();
    youwinImg.src = './imgs/youwin.png';
    
    // Win scenario
    if(scrollOffset > 40000) {
    console.log('You win!')
        c.drawImage(youwinImg, canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);
    }
    // Lose scenario
    if(player.position.y + 10 >= canvas.height) {
        console.log('You lose!')
        showLoseMessage = true
        loseMsgStart = performance.now()
        init()
    }

    // Draw fading "Try again.." message
    if (showLoseMessage) {
        const elapsed = performance.now() - loseMsgStart
        const alpha = Math.max(0, 1 - elapsed / loseMsgDuration)
        if (alpha > 0) {
            c.save()
            c.globalAlpha = alpha
            c.fillStyle = 'black'
            c.font = '48px serif'
            c.textAlign = 'center'
            c.textBaseline = 'middle'
            c.fillText('Try again..', canvas.width / 2, canvas.height / 2)
            c.restore()
        } else {
            showLoseMessage = false
        }
    }
}

// Start the animation
animate()

// Event listeners for keydown and keyup
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w': 
            if (event.repeat) { return }
            // Allow jump only if tap count < 2
            if (player.jumpCount < 2) {
                player.velocity.y = -15
                player.jumpCount++
                // Set/reset tap window
                clearTimeout(jumpTapTimeout)
                jumpTapTimeout = setTimeout(() => {
                    player.jumpCount = player.position.y + player.height >= canvas.height ? 0 : player.jumpCount
                }, tapWindow)
            }
            break
        case 'a': 
            keys.left.pressed = true
            break
        case 'd': 
            keys.right.pressed = true
            player.currentSprite = player.sprites.run.right
            player.width = player.sprites.run.width
            player.height = player.sprites.run.height
            break
    }
})

window.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'a': 
            keys.left.pressed = false
            break
        case 'd': 
            keys.right.pressed = false
            player.currentSprite = player.sprites.stand.right
            break
    }
})