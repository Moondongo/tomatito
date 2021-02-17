const audioAlarm = new Audio('./asset/alarm.mp3');
const audioClick = new Audio('./asset/click.wav');
const audioMetronome = new Audio('./asset/metronome.flac');
const nav = document.querySelector('.header');
const child = nav.children;
const timerButton = document.querySelector('#timer')
const label = document.querySelector('.counter');
const state = document.querySelector('.state');
const configButton = document.querySelector('#config');
const apply = document.querySelector('.config-apply');
let bar = new ProgressBar.Circle('.circle-progress', {
    strokeWidth: 4,
    easing: 'linear',
    color: '#EA6386',
    trailColor: '#EA6386',
    trailWidth: 1,
    svgStyle: null
});
let barTimeBackup = 25*60*1000;
let barTime = barTimeBackup;
let settings = {
    pomodoro : 25,
    short : 5,
    long : 15,
    theme : 'white'
}
let timer = {
    pomodoro : 25*60,
    short : 5*60,
    long : 15*60,
    key : function(n) {
        return Object.values(this)[n];
    }
}
let pomodoroState = 0;
let loop = 0;
let playPause = false;
let isRunning = false;
let interval;
loadSettings();
setTheme();
let time = timer.key(0);

resetBar();
updateLabel();
configAudio();
function configAudio(){
    audioMetronome.volume = 0.5;
    audioAlarm.volume = 0.8;
}
function run(){
    if(playPause){
        audioMetronome.play();
        time--;
        //! VER ESTO AL VOLVER
        bar.set((timer.pomodoro - time)/timer.pomodoro);
        if(time < 0) switchPomodoroState();
        else updateLabel();
    }
}
function updateLabel(){
    let minutes = Math.floor(time/60);
    minutes = minutes<10 ? '0'+minutes : minutes;
    let seconds = time%60;
    seconds = seconds<10 ? '0'+seconds : seconds;
    label.innerHTML = `${minutes}:${seconds}`;
}
function switchPomodoroState(){
    clearInterval(interval);
    if(loop<4){
        if(pomodoroState == 1) loop++;
        pomodoroState = pomodoroState==1 ? pomodoroState = 0 : pomodoroState += 1;
    }else{
        if(pomodoroState == 2) loop=0;
        pomodoroState = pomodoroState == 2 ? pomodoroState = 0 : pomodoroState = 2;
    }
    time = timer.key(pomodoroState);
    audioAlarm.play();
    setTimeout(()=>{
        interval = setInterval(run, 1000);
    },5000);
    resetBar();
    //bar.animate(1, {duration : barTime});
    for(let e of child){
        e.classList.remove('header__button--active');
    }
    child[pomodoroState].classList.add('header__button--active');
}

function setTime(){
    timer.pomodoro = settings.pomodoro * 60;
    timer.short = settings.short * 60;
    timer.long = settings.long * 60;
}
function resetBar(){
    bar.stop();
    bar.set(0);
    barTimeBackup = time * 1000;
    barTime = barTimeBackup;
}
function reset(i){
    playPause = false;
    state.textContent = 'play';
    clearInterval(interval);
    isRunning = false;
    time = timer.key(i);
    pomodoroState = i;
    timerButton.classList.remove('active');
    updateLabel();
    resetBar();
}
function loadSettings(){
    if(localStorage.getItem('settings')!=null){
        settings = JSON.parse(localStorage.getItem('settings'));
        document.querySelector('#input-pomodoro').value = settings.pomodoro;
        document.querySelector('#input-short').value = settings.short;
        document.querySelector('#input-long').value = settings.long;
        setTime();
    }
}
function validationTime(x){
    return (x>0 && x<60) ? true : false;
}
//! EVENTOS/////////////////////////////////////////////////////
nav.addEventListener('click', e =>{
    if(e.target.nodeName == 'BUTTON'){
        audioClick.play();
        let i = parseInt(e.target.getAttribute('data-id'),10);
        reset(i);
        for(let e of child){
            e.classList.remove('header__button--active');
        }
        child[i].classList.add('header__button--active');
    }
})
timerButton.addEventListener('click', ()=>{
    playPause = !playPause;
    timerButton.classList.toggle('active');

    if(!isRunning){
        interval = setInterval(run,1000);
        isRunning = true;
    }

    if(playPause){
        //bar.animate(1, {duration : barTime});
        state.textContent = 'pause';
        audioClick.play();
    }
    else{
        bar.stop();
        barTime = barTimeBackup - (bar.value() * barTimeBackup);
        state.textContent = 'play';
        audioClick.play();
    }
})
configButton.addEventListener('click', e =>{
    if(e.target.nodeName == 'svg' ||e.target.nodeName == 'path'){
        configButton.classList.remove('hidden');
        audioClick.play();
    }
})
apply.addEventListener('click',e =>{
    const pomo = parseInt(document.querySelector('#input-pomodoro').value,10);
    const short = parseInt(document.querySelector('#input-short').value,10);
    const long = parseInt(document.querySelector('#input-long').value,10);
    if(validationTime(pomo)) settings.pomodoro = pomo;
    if(validationTime(short)) settings.short = short;
    if(validationTime(long)) settings.long = long;
    localStorage.setItem('settings', JSON.stringify(settings));
    setTime();
    reset(0);
    setTheme();
    configButton.classList.add('hidden');
    audioClick.play();
})
document.querySelector('.color-mode').addEventListener('click', e =>{
    const childr = document.querySelector('.color-mode').children;
    if(e.target.classList.contains('circle')){
        childr[0].classList.remove('active');
        childr[1].classList.remove('active');
        e.target.classList.add('active');
        settings.theme = e.target.id;
    }
});

function setTheme(){
    if(settings.theme == 'dark'){
        document.body.classList.add('dark');
        document.querySelector('#white').classList.remove('active');
        document.querySelector('#dark').classList.add('active');
        bar.path.attributes[1].value = '#CC2936'
        bar.trail.attributes[1].value = '#CC2936'
    }
    else{
        document.body.classList.remove('dark');
        document.querySelector('#white').classList.add('active');
        document.querySelector('#dark').classList.remove('active');
        bar.path.attributes[1].value = '#5376b2'
        bar.trail.attributes[1].value = '#5376b2'
    }
}
