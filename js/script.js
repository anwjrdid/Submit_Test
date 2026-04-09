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

// --- 2. 초기 세팅 (3분) ---
let timerInterval;
const TOTAL_TIME = 180; 
let timeLeft = TOTAL_TIME;

// 모달 제어
helpBtn.onclick = () => helpModal.classList.remove('hidden');
closeModalBtn.onclick = () => helpModal.classList.add('hidden');

// 제출 버튼 -> 경고창
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

// 로봇 인증 -> 게임 시작
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

// --- 3. [1단계] 신호등 기억력 (4x4 업그레이드) ---
const trafficGrid = document.getElementById('traffic-grid');
let game1Active = false, correctCount = 0;

function initGame1() {
    trafficGrid.innerHTML = '';
    correctCount = 0;
    game1Active = false;

    // 4x4니까 총 16개 (진짜 5개, 가짜 11개)
    let cards = [
        '🚦','🚦','🚦','🚦','🚦', // 진짜 5개
        '🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑' // 가짜 11개
    ].sort(() => Math.random() - 0.5);

    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'card';
        // 4x4니까 카드가 너무 크면 화면 넘어가니까 높이만 살짝 조절 (필요시)
        card.style.height = '70px'; 
        card.innerText = emoji;
        
        card.onclick = () => {
            if(!game1Active || card.classList.contains('revealed')) return;
            if(emoji === '🚦') {
                card.classList.add('revealed');
                // 클리어 조건: 5개
                if(++correctCount === 5) {
                    game1Active = false;
                    setTimeout(() => {
                        document.getElementById('game1-area').classList.add('hidden');
                        startStage2();
                    }, 500);
                }
            } else {
                card.classList.add('wrong');
                timeLeft -= 1; 
                updateTimerDisplay();
                setTimeout(() => card.classList.remove('wrong'), 180);
            }
        };
        trafficGrid.appendChild(card);
    });

    // 0.5초(500ms) 후 뒤집힘
    setTimeout(() => {
        document.querySelectorAll('.card').forEach(c => c.classList.add('hidden-card'));
        game1Active = true;
    }, 500);
}

// --- 4. [2단계] 화살표 커맨드 ---
const game2Area = document.getElementById('game2-area');
const arrowContainer = document.getElementById('arrow-container');
let game2Active = false, currentArrowSeq = [], currentIdx = 0, roundIdx = 0;
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const arrowMap = {'ArrowUp':'⬆️','ArrowDown':'⬇️','ArrowLeft':'⬅️','ArrowRight':'➡️'};

function startStage2() {
    game2Area.classList.remove('hidden');
    roundIdx = 0;
    game2Active = true;
    initArrowRound();
    document.addEventListener('keydown', handleArrowPress);
}

function initArrowRound() {
    currentIdx = 0;
    currentArrowSeq = [];
    arrowContainer.innerHTML = '';
    const count = [3, 5, 7][roundIdx];
    document.getElementById('command-stage-text').innerText = `Round ${roundIdx+1} (${count}개)`;
    for(let i=0; i<count; i++){
        const key = arrowKeys[Math.floor(Math.random()*4)];
        currentArrowSeq.push(key);
        const el = document.createElement('div');
        el.className = 'arrow-box';
        el.id = `arrow-${i}`;
        el.innerText = arrowMap[key];
        arrowContainer.appendChild(el);
    }
}

function handleArrowPress(e) {
    if(!game2Active || !arrowKeys.includes(e.key)) return;
    e.preventDefault();
    if(e.key === currentArrowSeq[currentIdx]) {
        document.getElementById(`arrow-${currentIdx}`).classList.add('success');
        if(++currentIdx === currentArrowSeq.length) {
            if(++roundIdx < 3) {
                setTimeout(initArrowRound, 400);
            } else {
                game2Active = false;
                document.removeEventListener('keydown', handleArrowPress);
                setTimeout(() => {
                    game2Area.classList.add('hidden');
                    startStage2_5(); // 2.5단계로 연결
                }, 500);
            }
        }
    } else {
        timeLeft -= 5;
        updateTimerDisplay();
        document.querySelectorAll('.arrow-box').forEach(el => {
            el.classList.remove('success');
            el.classList.add('error');
            setTimeout(() => el.classList.remove('error'), 180);
        });
        currentIdx = 0;
        if(timeLeft <= 0) showFail();
    }
}

// --- 5. [2.5단계] 서버 과부하 버티기 ---
let avoidInterval, avoidTimerObj;
let bullets = [];
let mouseX = 200, mouseY = 150;
let avoidTimeLeft = 15;

function startStage2_5() {
    const area = document.getElementById('game2-5-area');
    area.classList.remove('hidden');
    const canvas = document.getElementById('avoid-canvas');
    const ctx = canvas.getContext('2d');
    
    avoidTimeLeft = 15;
    bullets = [];

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };

    if(avoidInterval) clearInterval(avoidInterval);
    avoidInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00b4d8";
        ctx.fillRect(mouseX - 5, mouseY - 5, 10, 10);

        if (Math.random() < 0.15) {
            bullets.push({
                x: Math.random() * canvas.width, y: 0,
                vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2
            });
        }

        bullets.forEach((b, i) => {
            b.x += b.vx; b.y += b.vy;
            ctx.fillStyle = "#ff4d4d";
            ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
            let dist = Math.hypot(b.x - mouseX, b.y - mouseY);
            if (dist < 10) {
                timeLeft -= 10;
                updateTimerDisplay();
                bullets.splice(i, 1);
            }
        });
        bullets = bullets.filter(b => b.y < canvas.height && b.x > 0 && b.x < canvas.width);
    }, 1000 / 60);

    if(avoidTimerObj) clearInterval(avoidTimerObj);
    avoidTimerObj = setInterval(() => {
        avoidTimeLeft--;
        const timerEl = document.getElementById('avoid-timer');
        if(timerEl) timerEl.innerText = `남은 시간: ${avoidTimeLeft}s`;
        if (avoidTimeLeft <= 0) {
            clearInterval(avoidInterval);
            clearInterval(avoidTimerObj);
            area.classList.add('hidden');
            startStage3();
        }
    }, 1000);
}

// --- 6. [3단계] 시력 검사 ---
const game3Area = document.getElementById('game3-area');
const captchaInput = document.getElementById('captcha-input');
const insultMsg = document.getElementById('insult-msg');
let targetWord = "";

function startStage3() {
    game3Area.classList.remove('hidden');
    const hardWords = ["VJcTCa", "PrOgRaM", "LIkeliOn", "CoMpUTer", "SuWonUni", "GraduAte", "HeoJeob", "PrOgrAmmer", "HelLowORlD","chAtGpt", "StelLliVe"];
    
    function generateNewWord() {
        targetWord = hardWords[Math.floor(Math.random() * hardWords.length)];
        const displayWord = targetWord.split('').join(' '); 
        document.getElementById('captcha-text').innerText = displayWord;
        return targetWord;
    }

    let currentTarget = generateNewWord();
    captchaInput.value = "";
    captchaInput.focus();
    insultMsg.innerText = "";

    captchaInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            const userInput = captchaInput.value.trim();
            if (userInput === currentTarget) {
                showSuccess();
            } else {
                timeLeft -= 5;
                updateTimerDisplay();
                const insults = ["시각 장애가 있으십니까?", "삣삐세요?", "허접ㅋ"];
                const randomInsult = insults[Math.floor(Math.random() * insults.length)];
                insultMsg.innerText = randomInsult;
                captchaInput.classList.add('error');
                currentTarget = generateNewWord();
                captchaInput.value = "";
                setTimeout(() => captchaInput.classList.remove('error'), 500);
                if (timeLeft <= 0) showFail();
            }
        }
    };
}

// --- 7. 결과 처리 ---
function showFail() {
    clearInterval(timerInterval);
    if(avoidInterval) clearInterval(avoidInterval);
    if(avoidTimerObj) clearInterval(avoidTimerObj);
    gameScreen.classList.add('hidden');
    document.getElementById('fail-screen').classList.remove('hidden');
}

function showSuccess() {
    clearInterval(timerInterval);
    gameScreen.classList.add('hidden');
    document.getElementById('success-screen').classList.remove('hidden');
    
    document.getElementById('rank-univ').innerText = univInput.value;
    document.getElementById('rank-name').innerText = nameInput.value;
    
    const rec = TOTAL_TIME - timeLeft;
    const m = Math.floor(rec / 60);
    const s = rec % 60;
    document.getElementById('rank-time').innerText = `${m}분 ${s}초`;
    document.getElementById('aspiration-input').focus();
}

// [핵심] 재시도 버튼 (망치 효과 후 리로드)
retryBtn.onclick = () => {
    hammerImg.classList.remove('hidden');
    hammerImg.classList.add('hammer-ani');
    setTimeout(() => {
        location.reload(); 
    }, 500); 
};

// 포부 등록 버튼 이벤트
document.getElementById('aspiration-submit-btn').onclick = () => {
    const aspInput = document.getElementById('aspiration-input');
    const rankQuote = document.getElementById('rank-quote');
    if (aspInput.value.trim() === "") {
        alert("포부를 남겨야 진정한 휴먼입니다.");
        return;
    }
    rankQuote.innerText = aspInput.value;
    document.getElementById('aspirations-section').style.display = 'none';
    alert("포부가 박제되었습니다! 행운을 빕니다.");
};