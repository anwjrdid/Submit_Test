// --- 1. 요소 가져오기 ---
const helpBtn = document.getElementById('help-btn');
const closeModalBtn = document.getElementById('close-modal');
const helpModal = document.getElementById('help-modal');
const submitBtn = document.getElementById('submit-btn');
const univInput = document.getElementById('univ-input');
const nameInput = document.getElementById('name-input');
const mainContainer = document.querySelector('.container');
const warningScreen = document.getElementById('warning-screen');
const gameScreen = document.getElementById('game-screen');
const robotCheckbox = document.getElementById('im-not-robot');
const displayUniv = document.getElementById('display-univ');
const displayName = document.getElementById('display-name');
const timeLeftDisplay = document.getElementById('time-left');
const retryBtn = document.getElementById('retry-btn');
const hammerImg = document.getElementById('hammer-effect');

// --- 2. 초기 세팅 (5분) ---
let timerInterval;
const TOTAL_TIME = 300; 
let timeLeft = TOTAL_TIME;

// 기본 이벤트
helpBtn.onclick = () => helpModal.classList.remove('hidden');
closeModalBtn.onclick = () => helpModal.classList.add('hidden');

submitBtn.onclick = () => {
    if (!univInput.value.trim() || !nameInput.value.trim()) {
        alert("학교와 이름을 입력하십시오 휴먼.");
        return;
    }
    displayUniv.innerText = univInput.value;
    displayName.innerText = nameInput.value;
    mainContainer.classList.add('hidden');
    warningScreen.classList.remove('hidden');
};

robotCheckbox.onchange = () => {
    if (robotCheckbox.checked) {
        setTimeout(() => {
            warningScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            startTimer();
            initGame1();
        }, 800);
    }
};

function startTimer() {
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showFail();
            return;
        }
        timeLeft--;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timeLeftDisplay.innerText = `${m}:${s}`;
}

// --- 3. 단계별 로직 ---

// [1단계] 신호등 (5x5, 0.5초)
const trafficGrid = document.getElementById('traffic-grid');
let game1Active = false, correctCount = 0;

function initGame1() {
    trafficGrid.innerHTML = '';
    correctCount = 0;
    game1Active = false;
    let cards = ['🚦','🚦','🚦','🚦','🚦','🚦','🚦',
        '🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑'].sort(()=>Math.random()-0.5);
    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = emoji;
        card.onclick = () => {
            if(!game1Active || card.classList.contains('revealed')) return;
            if(emoji === '🚦') {
                card.classList.add('revealed');
                if(++correctCount === 7) {
                    game1Active = false;
                    setTimeout(() => { document.getElementById('game1-area').classList.add('hidden'); startStage2(); }, 500);
                }
            } else {
                card.classList.add('wrong');
                timeLeft -= 1; updateTimerDisplay();
                setTimeout(() => card.classList.remove('wrong'), 180);
            }
        };
        trafficGrid.appendChild(card);
    });
    setTimeout(() => { document.querySelectorAll('.card').forEach(c => c.classList.add('hidden-card')); game1Active = true; }, 500);
}

// [2단계] 화살표
const game2Area = document.getElementById('game2-area');
const arrowContainer = document.getElementById('arrow-container');
let game2Active = false, currentArrowSeq = [], currentIdx = 0, roundIdx = 0;
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const arrowMap = {'ArrowUp':'⬆️','ArrowDown':'⬇️','ArrowLeft':'⬅️','ArrowRight':'➡️'};

function startStage2() {
    game2Area.classList.remove('hidden');
    roundIdx = 0; game2Active = true;
    initArrowRound();
    document.addEventListener('keydown', handleArrowPress);
}

function initArrowRound() {
    currentIdx = 0; currentArrowSeq = []; arrowContainer.innerHTML = '';
    const count = [3, 5, 7][roundIdx];
    document.getElementById('command-stage-text').innerText = `Round ${roundIdx+1} (${count}개)`;
    for(let i=0; i<count; i++){
        const key = arrowKeys[Math.floor(Math.random()*4)];
        currentArrowSeq.push(key);
        const el = document.createElement('div');
        el.className = 'arrow-box'; el.id = `arrow-${i}`; el.innerText = arrowMap[key];
        arrowContainer.appendChild(el);
    }
}

function handleArrowPress(e) {
    if(!game2Active || !arrowKeys.includes(e.key)) return;
    e.preventDefault();
    if(e.key === currentArrowSeq[currentIdx]) {
        document.getElementById(`arrow-${currentIdx}`).classList.add('success');
        if(++currentIdx === currentArrowSeq.length) {
            if(++roundIdx < 3) setTimeout(initArrowRound, 400);
            else { game2Active = false; document.removeEventListener('keydown', handleArrowPress); setTimeout(() => { game2Area.classList.add('hidden'); startStage2_5(); }, 500); }
        }
    } else {
        timeLeft -= 5; updateTimerDisplay();
        document.querySelectorAll('.arrow-box').forEach(el => { el.classList.remove('success'); el.classList.add('error'); setTimeout(() => el.classList.remove('error'), 180); });
        currentIdx = 0; if(timeLeft <= 0) showFail();
    }
}

// [2.5단계] 서버 과부하 버티기
let avoidInterval, avoidTimerObj;
let bullets = [], mouseX = 200, mouseY = 150, avoidTimeLeft = 15;

function startStage2_5() {
    const area = document.getElementById('game2-5-area');
    area.classList.remove('hidden');
    const canvas = document.getElementById('avoid-canvas');
    const ctx = canvas.getContext('2d');
    avoidTimeLeft = 15; bullets = [];
    canvas.onmousemove = (e) => { const rect = canvas.getBoundingClientRect(); mouseX = e.clientX - rect.left; mouseY = e.clientY - rect.top; };
    if(avoidInterval) clearInterval(avoidInterval);
    avoidInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00b4d8"; ctx.fillRect(mouseX - 5, mouseY - 5, 10, 10);
        if (Math.random() < 0.3) { bullets.push({ x: Math.random() * canvas.width, y: 0, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2 }); }
        bullets.forEach((b, i) => {
            b.x += b.vx; b.y += b.vy; ctx.fillStyle = "#ff4d4d"; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
            if (Math.hypot(b.x - mouseX, b.y - mouseY) < 10) { timeLeft -= 10; updateTimerDisplay(); bullets.splice(i, 1); }
        });
        bullets = bullets.filter(b => b.y < canvas.height && b.x > 0 && b.x < canvas.width);
    }, 1000 / 60);
    if(avoidTimerObj) clearInterval(avoidTimerObj);
    avoidTimerObj = setInterval(() => {
        avoidTimeLeft--; document.getElementById('avoid-timer').innerText = `남은 시간: ${avoidTimeLeft}s`;
        if (avoidTimeLeft <= 0) { clearInterval(avoidInterval); clearInterval(avoidTimerObj); area.classList.add('hidden'); startStage3(); }
    }, 1000);
}

// [3단계] 시력 검사
const game3Area = document.getElementById('game3-area');
const captchaInput = document.getElementById('captcha-input');
const insultMsg = document.getElementById('insult-msg');
let targetWord = "";

function startStage3() {
    game3Area.classList.remove('hidden');
    const hardWords = ["VJcTCa", "PrOgRaM", "LIkeliOn", "CoMpUTer", "SuWonUni", "GraduAte", "HeoJeob", "PrOgrAmmer", "HelLowORlD","chAtGpt", "StelLliVe", "안녕 반갑다 나는 키 188cm에 몸무게 88kg...", "스피키 네르지마세요!","쪼아요 쪼아요~ 물걸레질 좋아요~"];
    function gen() { targetWord = hardWords[Math.floor(Math.random() * hardWords.length)]; document.getElementById('captcha-text').innerText = targetWord.split('').join(' '); return targetWord; }
    let curr = gen(); captchaInput.value = ""; captchaInput.focus(); insultMsg.innerText = "";
    captchaInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            if (captchaInput.value.trim() === curr) { game3Area.classList.add('hidden'); startStage3_5(); }
            else { timeLeft -= 5; updateTimerDisplay(); insultMsg.innerText = ["시각 장애가 있으십니까?", "혹시 리신이신 가요?", "허접ㅋ"][Math.floor(Math.random()*3)]; captchaInput.classList.add('error'); curr = gen(); captchaInput.value = ""; setTimeout(() => captchaInput.classList.remove('error'), 500); if (timeLeft <= 0) showFail(); }
        }
    };
}

// [3.5단계] 상식 퀴즈 (추가됨)
const game3_5Area = document.getElementById('game3-5-area');
const quizInput = document.getElementById('quiz-input');
const quizMsg = document.getElementById('quiz-msg');
const quizData = [
    {q: "대한민국의 수도는?", a: "서울"}, {q: "일본의 수도는?", a: "도쿄"}, {q: "프랑스의 수도는?", a: "파리"},
    {q: "영국의 수도는?", a: "런던"}, {q: "미국의 수도는?", a: "워싱턴"}, {q: "독일의 수도는?", a: "베를린"},
    {q: "베트남의 수도는?", a: "하노이"}, {q: "태국의 수도는?", a: "방콕"}
];
let quizCount = 0;

function startStage3_5() {
    game3_5Area.classList.remove('hidden');
    quizCount = 0; quizMsg.innerText = "";
    showNextQuiz();
}

function showNextQuiz() {
    if(quizCount >= 3) { game3_5Area.classList.add('hidden'); startStage4(); return; }
    let qObj = quizData[Math.floor(Math.random()*quizData.length)];
    document.getElementById('quiz-question').innerText = `(${quizCount+1}/3) ${qObj.q}`;
    quizInput.value = ""; quizInput.focus();
    quizInput.onkeydown = (e) => {
        if(e.key === 'Enter') {
            if(quizInput.value.trim() === qObj.a) { quizCount++; showNextQuiz(); }
            else { timeLeft -= 10; updateTimerDisplay(); quizMsg.innerText = "상식도 없으십니까?"; setTimeout(()=>quizMsg.innerText="", 1000); showNextQuiz(); }
        }
    };
}

// [4단계] 도망가는 버튼 (추가됨)
const game4Area = document.getElementById('game4-area');
const runawayBtn = document.getElementById('runaway-btn');
let clickCount = 0;

function startStage4() {
    game4Area.classList.remove('hidden');
    clickCount = 0; moveBtn();
    runawayBtn.onclick = () => {
        clickCount++;
        document.getElementById('click-count-text').innerText = `클릭 횟수: ${clickCount} / 5`;
        if(clickCount >= 5) { showSuccess(); }
        else { moveBtn(); }
    };
    runawayBtn.onmouseover = () => { if(Math.random() > 0.3) moveBtn(); }; // 가끔 마우스만 가도 도망감
}

function moveBtn() {
    const maxX = game4Area.clientWidth - runawayBtn.clientWidth;
    const maxY = game4Area.clientHeight - runawayBtn.clientHeight - 50;
    runawayBtn.style.left = Math.random() * maxX + "px";
    runawayBtn.style.top = (Math.random() * maxY + 80) + "px";
}

// --- 4. 결과 및 재시도 ---
function showFail() { clearInterval(timerInterval); if(avoidInterval) clearInterval(avoidInterval); gameScreen.classList.add('hidden'); document.getElementById('fail-screen').classList.remove('hidden'); }
function showSuccess() { clearInterval(timerInterval); gameScreen.classList.add('hidden'); document.getElementById('success-screen').classList.remove('hidden'); document.getElementById('rank-univ').innerText = univInput.value; document.getElementById('rank-name').innerText = nameInput.value; const rec = TOTAL_TIME - timeLeft; document.getElementById('rank-time').innerText = `${Math.floor(rec / 60)}분 ${rec % 60}초`; document.getElementById('aspiration-input').focus(); }

retryBtn.onclick = () => { hammerImg.classList.remove('hidden'); hammerImg.classList.add('hammer-ani'); setTimeout(() => { location.reload(); }, 500); };
document.getElementById('aspiration-submit-btn').onclick = () => { const aspInput = document.getElementById('aspiration-input'); const rankQuote = document.getElementById('rank-quote'); if (aspInput.value.trim() === "") { alert("포부를 남겨야 진정한 휴먼입니다."); return; } rankQuote.innerText = aspInput.value; document.getElementById('aspirations-section').style.display = 'none'; alert("포부가 박제되었습니다! 행운을 빕니다."); };