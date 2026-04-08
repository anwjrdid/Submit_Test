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

// 타이머 함수
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

// --- 3. [1단계] 신호등 기억력 (0.5초) ---
const trafficGrid = document.getElementById('traffic-grid');
let game1Active = false, correctCount = 0;

function initGame1() {
    trafficGrid.innerHTML = '';
    correctCount = 0;
    game1Active = false;
    let cards = ['🚦','🚦','🚦','🚦','🛑','🛑','🛑','🛑','🛑'].sort(()=>Math.random()-0.5);
    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = emoji;
        card.onclick = () => {
            if(!game1Active || card.classList.contains('revealed')) return;
            if(emoji === '🚦') {
                card.classList.add('revealed');
                if(++correctCount === 4) {
                    game1Active = false;
                    setTimeout(() => {
                        document.getElementById('game1-area').classList.add('hidden');
                        startStage2();
                    }, 500);
                }
            } else {
                card.classList.add('wrong');
                timeLeft -= 1; // 오답 시 1초 감점
                updateTimerDisplay();
                setTimeout(() => card.classList.remove('wrong'), 180);
            }
        };
        trafficGrid.appendChild(card);
    });
    setTimeout(() => {
        document.querySelectorAll('.card').forEach(c => c.classList.add('hidden-card'));
        game1Active = true;
    }, 500); // 0.5초 후 뒤집힘
}

// --- 4. [2단계] 화살표 커맨드 (오답 -5초) ---
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
            if(++roundIdx < 3) setTimeout(initArrowRound, 400);
            else {
                game2Active = false;
                document.removeEventListener('keydown', handleArrowPress);
                setTimeout(() => {
                    game2Area.classList.add('hidden');
                    startStage3();
                }, 500);
            }
        }
    } else {
        timeLeft -= 5; // 오답 시 5초 감점
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

// --- 5. [3단계] 시력 검사 (대소문자 구분 & 랜덤 독설 & -5초) ---
const game3Area = document.getElementById('game3-area');
const captchaInput = document.getElementById('captcha-input');
const insultMsg = document.getElementById('insult-msg');
let targetWord = "";

function startStage3() {
    game3Area.classList.remove('hidden');
    const hardWords = ["VjCtCa", "PrOgRaM", "LikeLion", "ComPuTer", "SuWonUni", "GraduAte", "HeoJeob"];
    
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
            
            // 완벽하게 일치할 때만 성공 (대소문자 포함)
            if (userInput === currentTarget) {
                showSuccess();
            } else {
                // 틀리면 무조건 -5초 & 랜덤 독설
                timeLeft -= 5;
                updateTimerDisplay();
                
                const insults = ["시각 장애가 있으십니까?", "삣삐세요?", "허접ㅋ"];
                const randomInsult = insults[Math.floor(Math.random() * insults.length)];
                insultMsg.innerText = randomInsult;
                
                captchaInput.classList.add('error');
                currentTarget = generateNewWord(); // 새로운 단어
                captchaInput.value = "";
                
                setTimeout(() => {
                    captchaInput.classList.remove('error');
                }, 500);

                if (timeLeft <= 0) showFail();
            }
        }
    };
}

// --- 6. 결과 처리 ---
function showFail() {
    clearInterval(timerInterval);
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
}

// 재시도 버튼 (망치 애니메이션 후 리로드)
retryBtn.onclick = () => {
    hammerImg.classList.remove('hidden');
    hammerImg.classList.add('hammer-ani');
    setTimeout(() => {
        location.reload(); 
    }, 500); 
};