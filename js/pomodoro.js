    let workTime = 1;
    let breakTime = 1;
    let longBreakTime = 1;
    let currentTime = workTime * 60;
    let totalTime = currentTime;
    let isRunning = false;
    let isWorkSession = true;
    let isBreak = false;
    let isLongBreak = false;
    let sessionCount = 0;
    let totalMinutes = 0;
    let currentStreak = 0;
    let timer = null;

    let colorIndex = Math.floor((Math.random() * allColors.length) + 1);

    const root = document.querySelector(':root');

    const timeDisplay = document.getElementById('timeDisplay');
    const sessionType = document.getElementById('sessionType');
    const progress = document.getElementById('progress');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const switchBtn = document.getElementById('switchBtn');
    const colorButton = document.querySelector("#color");
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    const workTimeDisplay = document.getElementById('workTime');
    const breakTimeDisplay = document.getElementById('breakTime');
    const longBreakTimeDisplay = document.getElementById('longBreakTime');

    window.addEventListener('load', async () => {
    loadThemeColor();
    loadTimes();
});

    function updateDisplay() {
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateProgress() {
        const progressValue = 1 - (currentTime / totalTime);
        const circumference = 2 * Math.PI * 145;
        const offset = circumference * (1 - progressValue);
        progress.style.strokeDashoffset = offset;
    }

    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 4000);
    }

    function playNotificationSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.log('Audio context error');
        }
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startBtn.textContent = '...';
            startBtn.classList.add('pulsing');
            timer = setInterval(() => {
                currentTime--;
                updateDisplay();
                updateProgress();
                if (currentTime <= 0) {
                    sessionComplete();
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        if (isRunning) {
            isRunning = false;
            clearInterval(timer);
            startBtn.textContent = 'Start';
            startBtn.classList.remove('pulsing');
        }
    }

    function resetTimer() {
        pauseTimer();
        if (isWorkSession) {
            currentTime = workTime * 60;
        } else {
            currentTime = isLongBreak ? longBreakTime * 60 : breakTime * 60;
        }
        totalTime = currentTime;
        updateDisplay();
        updateProgress();
    }

    function switchTimer(){
        if (isRunning) return;
        let getText = switchBtn.getAttribute("title");
        console.log("getText is:" + getText);
        switch(getText)
        {
        case "Focus session":
            switchBtn.innerText = "Break";
            switchBtn.setAttribute("title", "Break session");
            currentTime = breakTime * 60;
            isWorkSession = false;
            isBreak = true;
            isLongBreak = false;
            console.log("Case focus");
            break;
        case "Break session":
            switchBtn.innerText = "Long";
            switchBtn.setAttribute("title", "Long break session");
            currentTime = longBreakTime * 60;
            isWorkSession = false;
            isBreak = false;
            isLongBreak = true;
            console.log("Case break");
            break;
        case "Long break session":
            switchBtn.innerText = "Focus";
            switchBtn.setAttribute("title", "Focus session");
            currentTime = workTime * 60;
            isWorkSession = true;
            isBreak = false;
            isLongBreak = false;
            console.log("Case long break");
            break;
        }
        totalTime = currentTime;
        setTypeAndProgress();
        updateDisplay();
        updateProgress();
    }

    function sessionComplete() {
        pauseTimer();
        if (isWorkSession) {
            totalMinutes += workTime;
            showNotification('Focus session completed! Time for a break.');
        } else {
            showNotification('Break completed! Ready to focus');
        }

        setTypeAndProgress();

        totalTime = currentTime;
        updateDisplay();
        updateProgress();
        playNotificationSound();
    }

    function setTypeAndProgress(){
        if (isWorkSession) {
            currentTime = workTime * 60;
            progress.classList.remove('break');
            progress.classList.add('work');
            sessionType.textContent = 'Focus Session';
        } else{
            currentTime = isLongBreak ? longBreakTime * 60 : breakTime * 60;
            progress.classList.remove('work');
            progress.classList.add('break');
            sessionType.textContent = isLongBreak ? 'Long Break' : 'Short Break';
        }
    }

    function adjustTime(type, delta) {
        if (isRunning) return;

        if (type === 'work') {
            workTime = Math.min(60, Math.max(1, workTime + delta));
            workTimeDisplay.textContent = workTime;
            if (isWorkSession) {
                currentTime = workTime * 60;
                totalTime = currentTime;
            }
            localStorage.setItem("saved-work-time", workTime);
        } else if (type === 'break') {
            breakTime = Math.min(30, Math.max(1, breakTime + delta));
            breakTimeDisplay.textContent = breakTime;
            if (isBreak) {
                currentTime = breakTime * 60;
                totalTime = currentTime;
            }
            localStorage.setItem("saved-break-time", breakTime);
        } else if (type === 'longBreak') {
            longBreakTime = Math.min(60, Math.max(1, longBreakTime + delta));
            longBreakTimeDisplay.textContent = longBreakTime;
            if (isLongBreak) {
                currentTime = longBreakTime * 60;
                totalTime = currentTime;
            }
            localStorage.setItem("saved-long-time", longBreakTime);
        }
        setTypeAndProgress();
        updateDisplay();
        updateProgress();
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateDisplay();
        updateProgress();

        startBtn.addEventListener('click', startTimer);
        pauseBtn.addEventListener('click', pauseTimer);
        resetBtn.addEventListener('click', resetTimer);
        switchBtn.addEventListener('click', switchTimer);

        document.getElementById('workPlus').addEventListener('click', () => adjustTime('work', 1));
        document.getElementById('workMinus').addEventListener('click', () => adjustTime('work', -1));
        document.getElementById('breakPlus').addEventListener('click', () => adjustTime('break', 1));
        document.getElementById('breakMinus').addEventListener('click', () => adjustTime('break', -1));
        document.getElementById('longBreakPlus').addEventListener('click', () => adjustTime('longBreak', 1));
        document.getElementById('longBreakMinus').addEventListener('click', () => adjustTime('longBreak', -1));
    });

    // == SAVE TIMES ===

    function loadTimes(){
        //localStorage.clear();
        let savedWorkTime = localStorage.getItem("saved-work-time");
        if(savedWorkTime != null)
        {
            adjustTime('work', parseInt(savedWorkTime, 10) - 1);
        }
        else
        {
            adjustTime('work', 24);
        }

        let savedBreakTime = localStorage.getItem("saved-break-time");
        if(savedBreakTime != null)
        {
            adjustTime('break', parseInt(savedBreakTime, 10) - 1);
        }
        else
        {
            adjustTime('break', 4);
        }

        let savedLongTime = localStorage.getItem("saved-long-time");
        if(savedLongTime != null)
        {
            adjustTime('longBreak', parseInt(savedLongTime, 10) - 1);
        }
        else
        {
            adjustTime('longBreak', 14);
        }
    }

    //=== COLOR ===

    function loadThemeColor(){
        let savedColor = localStorage.getItem("saved-color");
        if(savedColor != null)
        {
            colorIndex = savedColor;
        }
        changeColor(colorIndex);
    }

    function saveThemeColor(){
        localStorage.setItem("saved-color", colorIndex);
    }

    function changeColor(index){
    root.style.setProperty('--mainColor', allColors[index].dark); 
    root.style.setProperty('--secondaryColor', allColors[index].light); 
    }

    colorButton.addEventListener("click", () =>
    {
        colorIndex++;
        if(colorIndex >= allColors.length)
        {
            colorIndex = 0;
        }
        changeColor(colorIndex);
        saveThemeColor();
    });