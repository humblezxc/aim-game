const startBtn = document.querySelector('#start')
const screens = document.querySelectorAll('.screen')
const timeList = document.querySelector('#time-list')
const difficultyList = document.querySelector('#difficulty-list')
const timeEL = document.querySelector('#time')
const board = document.querySelector('#board')
const restartBtn = document.querySelector('#restart')
const comboEl = document.querySelector('#combo')
const colors = ['#F0F8FF', '#7FFFD4', '#DC143C', '#00FFFF', '#9932CC', '#FFD700', '#8FBC8F', '#FFA500', '#FF00FF', '#F0E68C']

const BOARD_PADDING = 30
const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

function playSound(freq, duration, type = 'sine') {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
}

const difficultySettings = {
    easy: { minSize: 40, maxSize: 60, speed: 0, circles: 1, lifetime: 0, spawnRate: 0 },
    medium: { minSize: 25, maxSize: 50, speed: 1.5, circles: 2, lifetime: 4000, spawnRate: 2500 },
    hard: { minSize: 10, maxSize: 35, speed: 2.5, circles: 3, lifetime: 3000, spawnRate: 2000 },
    extreme: { minSize: 8, maxSize: 20, speed: 4, circles: 3, lifetime: 2000, spawnRate: 1500 }
}

let time = 0
let score = 0
let intervalId = null
let difficulty = 'medium'
let totalClicks = 0
let hits = 0
let animationId = null
let activeCircles = []
let combo = 0
let cachedBoardWidth = 0
let cachedBoardHeight = 0
let spawnIntervalId = null

startBtn.addEventListener('click', () => {
    screens[0].classList.add('up')
})

timeList.addEventListener('click', event => {
    if(event.target.classList.contains('time-btn')){
        time  = parseInt(event.target.getAttribute('data-time'))
        screens[1].classList.add('up')
    }
})

difficultyList.addEventListener('click', event => {
    const btn = event.target.closest('.difficulty-btn')
    if(btn){
        difficulty = btn.getAttribute('data-difficulty')
        startGame()
    }
})

board.addEventListener('click', event => {
    if (intervalId !== null) {
        totalClicks++
    }

    let hitCircle = null
    if (event.target.classList.contains('circle')) {
        hitCircle = event.target
    } else if (activeCircles.length > 0) {
        const rect = board.getBoundingClientRect()
        const clickX = event.clientX - rect.left
        const clickY = event.clientY - rect.top
        const tolerance = 8
        for (const circle of activeCircles) {
            const centerX = circle.x + circle.size / 2
            const centerY = circle.y + circle.size / 2
            const radius = circle.size / 2 + tolerance
            const dx = clickX - centerX
            const dy = clickY - centerY
            if (dx * dx + dy * dy <= radius * radius) {
                hitCircle = circle.element
                break
            }
        }
    }

    if (hitCircle) {
        combo++
        const points = combo >= 3 ? 2 : 1
        score += points
        hits++
        if (combo > 0 && combo % 5 === 0) {
            playSound(880, 0.3, 'triangle')
        } else {
            playSound(600 + combo * 20, 0.15)
        }
        activeCircles = activeCircles.filter(c => c.element !== hitCircle)
        showScorePopup(event, points)
        hitCircle.remove()
        createRandomCircle()
        updateComboDisplay()
    } else if (intervalId !== null) {
        combo = 0
        playSound(200, 0.2, 'square')
        updateComboDisplay()
    }
})

restartBtn.addEventListener('click', () => {
    resetGame()
})

function startGame(){
    screens[2].classList.add('up')
    const {width, height} = board.getBoundingClientRect()
    cachedBoardWidth = width
    cachedBoardHeight = height
    setTime(time)
    showCountdown(() => {
        intervalId = setInterval(decreaseTime, 1000)
        const settings = difficultySettings[difficulty]
        for (let i = 0; i < settings.circles; i++) {
            createRandomCircle()
        }
        if (settings.speed > 0) {
            animateCircles()
        }
        if (settings.spawnRate > 0) {
            spawnIntervalId = setInterval(() => {
                createRandomCircle()
            }, settings.spawnRate)
        }
    })
}

function showCountdown(callback) {
    const countdownEl = document.createElement('div')
    countdownEl.classList.add('countdown')
    board.append(countdownEl)
    let count = 3
    countdownEl.textContent = count
    const tick = setInterval(() => {
        count--
        if (count > 0) {
            countdownEl.textContent = count
        } else if (count === 0) {
            countdownEl.textContent = 'GO!'
        } else {
            clearInterval(tick)
            countdownEl.remove()
            callback()
        }
    }, 700)
}

function decreaseTime(){
    if (time === 0){
        finishGame()
    } else {
        time--
        setTime(time)
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function setTime(value) {
    timeEL.innerHTML = formatTime(value)
}

function getHighScore(diff) {
    return {
        score: parseInt(localStorage.getItem(`highScore_${diff}`)) || 0,
        accuracy: localStorage.getItem(`highAccuracy_${diff}`) || null
    }
}

function saveHighScore(diff, currentScore, accuracy) {
    const best = getHighScore(diff)
    if (currentScore > best.score) {
        localStorage.setItem(`highScore_${diff}`, currentScore)
        localStorage.setItem(`highAccuracy_${diff}`, accuracy)
    }
}

function updateComboDisplay() {
    if (combo >= 2) {
        comboEl.textContent = `${combo}x Combo!`
        comboEl.classList.remove('hide')
    } else {
        comboEl.classList.add('hide')
    }
}

function showScorePopup(event, points) {
    const popup = document.createElement('div')
    popup.textContent = `+${points}`
    popup.classList.add('score-popup')
    const rect = board.getBoundingClientRect()
    popup.style.left = `${event.clientX - rect.left}px`
    popup.style.top = `${event.clientY - rect.top}px`
    board.append(popup)
    popup.addEventListener('animationend', () => popup.remove())
}

function finishGame() {
    clearInterval(intervalId)
    intervalId = null
    if (spawnIntervalId) {
        clearInterval(spawnIntervalId)
        spawnIntervalId = null
    }
    if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
    }
    activeCircles = []
    combo = 0
    comboEl.classList.add('hide')
    timeEL.parentNode.classList.add('hide')
    const difficultyCapitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    const accuracy = totalClicks > 0 ? (hits / totalClicks * 100).toFixed(1) + '%' : 'N/A'

    saveHighScore(difficulty, score, accuracy)
    const best = getHighScore(difficulty)
    const isNewRecord = best.score === score && score > 0
    const highScoreHTML = best.score > 0
        ? `<p style="font-size: 1rem; margin-top: 15px; color: #C0C0C0;">Best: <span class="primary">${best.score}</span>${best.accuracy ? ` (${best.accuracy} accuracy)` : ''}${isNewRecord ? ' <span style="color:#FFD700">★ New Record!</span>' : ''}</p>`
        : ''

    board.innerHTML = `
        <div>
            <h1>Score: <span class="primary">${score}</span></h1>
            <p style="font-size: 1.2rem; margin-top: -20px;">Difficulty: ${difficultyCapitalized}</p>
            <p style="font-size: 1.1rem; margin-top: 10px;">Accuracy: <span class="primary">${accuracy}</span> (${hits}/${totalClicks})</p>
            ${highScoreHTML}
        </div>
    `
    restartBtn.classList.remove('hide')
}

function resetGame() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
    if (spawnIntervalId) {
        clearInterval(spawnIntervalId)
        spawnIntervalId = null
    }
    if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
    }
    activeCircles = []

    score = 0
    time = 0
    difficulty = 'medium'
    totalClicks = 0
    hits = 0
    combo = 0
    comboEl.classList.add('hide')

    board.innerHTML = ''

    restartBtn.classList.add('hide')

    timeEL.parentNode.classList.remove('hide')

    screens[2].classList.remove('up')
    screens[1].classList.remove('up')
    screens[0].classList.remove('up')
}

function createRandomCircle() {
    const circle = document.createElement('div')
    const settings = difficultySettings[difficulty]
    const size = getRandomNumber(settings.minSize, settings.maxSize)
    const {width, height} = board.getBoundingClientRect()
    const x = getRandomNumber(BOARD_PADDING, width - size - BOARD_PADDING)
    const y = getRandomNumber(BOARD_PADDING, height - size - BOARD_PADDING)
    circle.classList.add('circle')
    circle.style.width = `${size}px`
    circle.style.height = `${size}px`
    circle.style.top = `${y}px`
    circle.style.left = `${x}px`
    circle.style.backgroundColor = getRandomColor()
    board.append(circle)

    if (settings.speed > 0) {
        const angle = Math.random() * 2 * Math.PI
        const vx = Math.cos(angle) * settings.speed
        const vy = Math.sin(angle) * settings.speed
        activeCircles.push({
            element: circle,
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            size: size
        })
    }

    if (settings.lifetime > 0) {
        setTimeout(() => {
            if (circle.parentNode) {
                activeCircles = activeCircles.filter(c => c.element !== circle)
                circle.remove()
            }
        }, settings.lifetime)
    }
}

function animateCircles() {
    const boardWidth = cachedBoardWidth
    const boardHeight = cachedBoardHeight

    activeCircles.forEach(circle => {
        circle.x += circle.vx
        circle.y += circle.vy

        const minPos = BOARD_PADDING
        const maxX = boardWidth - circle.size - BOARD_PADDING
        const maxY = boardHeight - circle.size - BOARD_PADDING

        if (circle.x <= minPos || circle.x >= maxX) {
            circle.vx *= -1
            circle.x = Math.max(minPos, Math.min(circle.x, maxX))
        }
        if (circle.y <= minPos || circle.y >= maxY) {
            circle.vy *= -1
            circle.y = Math.max(minPos, Math.min(circle.y, maxY))
        }

        circle.element.style.left = `${circle.x}px`
        circle.element.style.top = `${circle.y}px`
    })

    animationId = requestAnimationFrame(animateCircles)
}

function getRandomNumber(min, max) {
    return Math.round(Math.random() * (max-min) + min)
}

function getRandomColor() {
    const index = Math.floor(Math.random() * colors.length)
    return colors[index]
}
