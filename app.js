const startBtn = document.querySelector('#start')
const screens = document.querySelectorAll('.screen')
const timeList = document.querySelector('#time-list')
const timeEL = document.querySelector('#time')
const board = document.querySelector('#board')
const colors = ['#F0F8FF', '#7FFFD4', '#DC143C', '#00FFFF', '#9932CC', '#000000', '#00FFFF', '#8FBC8F', '#FFA500', '#FF00FF', '#F0E68C']

let time = 0
let score = 0

startBtn.addEventListener('click', (event) => {

    event.preventDefault()
    screens[0].classList.add('up')
})

timeList.addEventListener('click', event => {
    if(event.target.classList.contains('time-btn')){
        time  = parseInt(event.target.getAttribute('data-time'))
        startGame()
    }
})

board.addEventListener('click', event => {
    if (event. target.classList.contains('circle')){
        score++
        event.target.remove()
        createRandomCircle()
    }
})

function startGame(){
    screens[1].classList.add('up')
    setInterval(decreaseTime, 1000)
    createRandomCircle()
    setTime(time)
}

function decreaseTime(){
    if (time === 0){
        finishGame()
    } else {
    let current = --time
    if (current < 10) {
        current =`0${current}`
    }
    timeEL.innerHTML = `00:${current}`
    setTime(current)
    }
}
function setTime(value) {
    timeEL.innerHTML = `00:${value}`
    timeEL.innerHTML = `00:${value}`
}
function finishGame() {
    timeEL.parentNode.classList.add('hide')
    board.innerHTML = `<h1>Score: <span class="primary">${score}</span></h1>`
}

function createRandomCircle() {
    const circle = document.createElement('div')
    const size = getRandomNumber(10, 60)
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
