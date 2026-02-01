const startBtn = document.querySelector('#start')
const screens = document.querySelectorAll('.screen')
const timeList = document.querySelector('#time-list')
const difficultyList = document.querySelector('#difficulty-list')
const timeEL = document.querySelector('#time')
const board = document.querySelector('#board')
const restartBtn = document.querySelector('#restart')
const colors = ['#F0F8FF', '#7FFFD4', '#DC143C', '#00FFFF', '#9932CC', '#FFD700', '#8FBC8F', '#FFA500', '#FF00FF', '#F0E68C']

const difficultySettings = {
    easy: { minSize: 40, maxSize: 60 },
    medium: { minSize: 25, maxSize: 50 },
    hard: { minSize: 10, maxSize: 35 },
    extreme: { minSize: 8, maxSize: 20 }
}

let time = 0
let score = 0
let intervalId = null
let difficulty = 'medium'
let totalClicks = 0
let hits = 0

startBtn.addEventListener('click', (event) => {

    event.preventDefault()
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
    if (event.target.classList.contains('circle')){
        score++
        hits++
        event.target.remove()
        createRandomCircle()
    }
})

restartBtn.addEventListener('click', () => {
    resetGame()
})

function startGame(){
    screens[2].classList.add('up')
    intervalId = setInterval(decreaseTime, 1000)
    createRandomCircle()
    setTime(time)
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
function finishGame() {
    clearInterval(intervalId)
    intervalId = null
    timeEL.parentNode.classList.add('hide')
    const difficultyCapitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    const accuracy = totalClicks > 0 ? (hits / totalClicks * 100).toFixed(1) : 'N/A'
    board.innerHTML = `
        <div>
            <h1>Score: <span class="primary">${score}</span></h1>
            <p style="font-size: 1.2rem; margin-top: -20px;">Difficulty: ${difficultyCapitalized}</p>
            <p style="font-size: 1.1rem; margin-top: 10px;">Accuracy: <span class="primary">${accuracy}%</span> (${hits}/${totalClicks})</p>
        </div>
    `
    restartBtn.classList.remove('hide')
}

function resetGame() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }

    score = 0
    time = 0
    difficulty = 'medium'
    totalClicks = 0
    hits = 0

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
    const x = getRandomNumber(0, width - size)
    const y = getRandomNumber(0, height - size)
    circle.classList.add('circle')
    circle.style.width = `${size}px`
    circle.style.height = `${size}px`
    circle.style.top = `${y}px`
    circle.style.left =`${x}px`
    circle.style.backgroundColor = getRandomColor()
    board.append(circle)
}

function getRandomNumber(min, max) {
    return Math.round(Math.random() * (max-min) +min)

}
function getRandomColor() {
    const index = Math.floor(Math.random() * colors.length)
    return colors[index]
}
