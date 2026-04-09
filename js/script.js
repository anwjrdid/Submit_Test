// --- 1. 초기화 및 Supabase 연결 ---
// 채현님이 발급받은 진짜 키 적용
const _supabase = supabase.createClient('https://knkfkyzcrggxfzwomjgy.supabase.co', 'sb_publishable_yl6XC2nGGP0_BK0hhgxfww_MyxK0aOh');

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

const rankingBtn = document.getElementById('ranking-btn');
const rankingModal = document.getElementById('ranking-modal');
const closeRankingBtn = document.getElementById('close-ranking-btn');
const rankingList = document.getElementById('top3-list');
const archiveOpenBtn = document.getElementById('archive-open-btn');

let timerInterval;
const TOTAL_TIME = 300; 
let timeLeft = TOTAL_TIME;
let allRankingData = []; 

// --- 2. 모달 제어 ---
helpBtn.onclick = () => helpModal.classList.remove('hidden');
closeModalBtn.onclick = () => helpModal.classList.add('hidden');
rankingBtn.onclick = () => { rankingModal.classList.remove('hidden'); loadRankingData(); };
closeRankingBtn.onclick = () => rankingModal.classList.add('hidden');
archiveOpenBtn.onclick = () => window.open('archive.html', '_blank');
window.addEventListener('click', (e) => {
    if (e.target === rankingModal) rankingModal.classList.add('hidden');
    if (e.target === helpModal) helpModal.classList.add('hidden');
});

// --- 3. 실시간 랭킹 로드 (공석 처리 포함) ---
async function loadRankingData() {
    const { data, error } = await _supabase
        .from('ranking')
        .select('*')
        .order('raw_time', { ascending: true })
        .limit(3);

    if (error) return console.error("데이터 로드 실패:", error);
    
    allRankingData = data; // 가져온 데이터 전역 변수에 저장
    renderTop3(); // 공석 처리 로직 호출
}

function renderTop3() {
    rankingList.innerHTML = '';
    const colors = ['#ffde03', '#e5e5e5', '#cd7f32'];

    for (let i = 0; i < 3; i++) {
        const item = allRankingData[i];
        const li = document.createElement('li');
        li.style.padding = "10px 0";
        li.style.borderBottom = i < 2 ? "1px solid #333" : "none";

        if (item) {
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: ${colors[i]}; font-weight: bold; font-size: 1.1rem;">${i+1}위 [${item.univ}] ${item.name}</span>
                    <span style="color: #ff4d4d;">${item.clear_time}</span>
                </div>
                <div style="color: #a8dadc; font-size: 0.85rem; margin-top: 5px; font-style: italic;">"${item.aspiration}"</div>
            `;
        } else {
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; opacity: 0.5;">
                    <span style="color: #666; font-weight: bold; font-size: 1.1rem;">${i+1}위 [ - ] 공석</span>
                    <span style="color: #666;">-- : --</span>
                </div>
                <div style="color: #444; font-size: 0.85rem; margin-top: 5px;">"다음 주인공은 누구?"</div>
            `;
        }
        rankingList.appendChild(li);
    }
}

// --- 4. 메인 로직 및 타이머 ---
submitBtn.onclick = () => {
    if (!univInput.value.trim() || !nameInput.value.trim()) return alert("학교와 이름을 입력하십시오 휴먼.");
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
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) { clearInterval(timerInterval); showFail(); return; }
        timeLeft--; updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timeLeftDisplay.innerText = `${m}:${s}`;
}

// --- 5. 미니 게임 스테이지 ---

// [1단계] 신호등
const trafficGrid = document.getElementById('traffic-grid');
let game1Active = false, correctCount = 0;
function initGame1() {
    trafficGrid.innerHTML = ''; correctCount = 0; game1Active = false;
    let cards = ['🚦','🚦','🚦','🚦','🚦','🚦','🚦',
        '🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑'].sort(()=>Math.random()-0.5);
    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'card'; card.innerText = emoji;
        card.onclick = () => {
            if(!game1Active || card.classList.contains('revealed')) return;
            if(emoji === '🚦') {
                card.classList.add('revealed');
                if(++correctCount === 7) {
                    game1Active = false;
                    setTimeout(() => { document.getElementById('game1-area').classList.add('hidden'); startStage2(); }, 500);
                }
            } else {
                card.classList.add('wrong'); timeLeft -= 1; updateTimerDisplay();
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
function startStage2() { game2Area.classList.remove('hidden'); roundIdx = 0; game2Active = true; initArrowRound(); document.addEventListener('keydown', handleArrowPress); }
function initArrowRound() {
    currentIdx = 0; currentArrowSeq = []; arrowContainer.innerHTML = '';
    const count = [3, 5, 7][roundIdx];
    document.getElementById('command-stage-text').innerText = `Round ${roundIdx+1} (${count}개)`;
    for(let i=0; i<count; i++){
        const key = arrowKeys[Math.floor(Math.random()*4)]; currentArrowSeq.push(key);
        const el = document.createElement('div'); el.className = 'arrow-box'; el.id = `arrow-${i}`; el.innerText = arrowMap[key];
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

// [2.5단계] 서버 과부하 (리셋 10회 기준)
let avoidInterval, avoidTimerObj, bullets = [], mouseX = 200, mouseY = 150, avoidTimeLeft = 15, hitCount = 0;
function startStage2_5() {
    const area = document.getElementById('game2-5-area'); area.classList.remove('hidden');
    const canvas = document.getElementById('avoid-canvas'); const ctx = canvas.getContext('2d');
    avoidTimeLeft = 15; bullets = []; hitCount = 0;
    canvas.onmousemove = (e) => { const rect = canvas.getBoundingClientRect(); mouseX = e.clientX - rect.left; mouseY = e.clientY - rect.top; };
    if(avoidInterval) clearInterval(avoidInterval);
    avoidInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#333"; ctx.fillRect(10, 10, 380, 10);
        ctx.fillStyle = "#ff4d4d"; ctx.fillRect(10, 10, (hitCount / 10) * 380, 10);
        ctx.fillStyle = "#00b4d8"; ctx.fillRect(mouseX - 5, mouseY - 5, 10, 10);
        if (Math.random() < 0.2) bullets.push({ x: Math.random() * canvas.width, y: 0, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2 });
        bullets.forEach((b, i) => {
            b.x += b.vx; b.y += b.vy; ctx.fillStyle = "#ff4d4d"; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
            if (Math.hypot(b.x - mouseX, b.y - mouseY) < 10) {
                hitCount++; timeLeft -= 10; updateTimerDisplay(); bullets.splice(i, 1);
                if (hitCount >= 10) {
                    clearInterval(avoidInterval); clearInterval(avoidTimerObj);
                    alert("⚠️ 서버 과부하! 보안을 위해 태초마을로 돌아갑니다. ⚠️");
                    area.classList.add('hidden'); document.getElementById('game1-area').classList.remove('hidden'); initGame1();
                }
            }
        });
        bullets = bullets.filter(b => b.y < canvas.height && b.x > 0 && b.x < canvas.width);
    }, 1000 / 60);
    if(avoidTimerObj) clearInterval(avoidTimerObj);
    avoidTimerObj = setInterval(() => {
        avoidTimeLeft--; document.getElementById('avoid-timer').innerText = `남은 시간: ${avoidTimeLeft}s (히트: ${hitCount}/10)`;
        if (avoidTimeLeft <= 0) { clearInterval(avoidInterval); clearInterval(avoidTimerObj); area.classList.add('hidden'); startStage3(); }
    }, 1000);
}

// [3단계] 보안 문구 (채현님 커스텀 리스트 복구)
const game3Area = document.getElementById('game3-area');
const captchaInput = document.getElementById('captcha-input');
const insultMsg = document.getElementById('insult-msg');
let targetWord = "";
function startStage3() {
    game3Area.classList.remove('hidden');
    // 🟢 스피키 삭제 완료, 채현님 문구 복구
    const words = ["VJcTCa", "PrOgRaM", "LIkeliOn", "CoMpUTer", "SuWonUni", "GraduAte", "HeoJeob", "PrOgrAmmer", "HelLowORlD","chAtGpt", "StelLliVe","oOtDgoOD"];
    function gen() {
        targetWord = words[Math.floor(Math.random() * words.length)];
        const canvas = document.getElementById('captcha-canvas'); const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let size = 35; ctx.font = `bold ${size}px 'DungGeunMo', sans-serif`;
        while (ctx.measureText(targetWord.split('').join(' ')).width > canvas.width - 20) { size -= 2; ctx.font = `bold ${size}px 'DungGeunMo', sans-serif`; }
        ctx.fillStyle = "#888"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(targetWord.split('').join(' '), canvas.width / 2, canvas.height / 2);
        return targetWord;
    }
    let curr = gen(); captchaInput.value = ""; captchaInput.focus(); insultMsg.innerText = "";
    captchaInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            if (captchaInput.value.trim() === curr) { game3Area.classList.add('hidden'); startStage3_5(); }
            else { timeLeft -= 5; updateTimerDisplay(); insultMsg.innerText = "시각 장애가 있으십니까?"; curr = gen(); captchaInput.value = ""; if (timeLeft <= 0) showFail(); }
        }
    };
}

// [3.5단계] 수도 퀴즈 (중복 없는 랜덤 & 무조건 3문제 정답 필수)
function startStage3_5() {
    const area = document.getElementById('game3-5-area'); 
    area.classList.remove('hidden');
    
    const quizData = [
        {q: "대한민국의 수도는?", a: "서울"}, {q: "일본의 수도는?", a: "도쿄"}, {q: "프랑스의 수도는?", a: "파리"},
        {q: "영국의 수도는?", a: "런던"}, {q: "미국의 수도는?", a: "워싱턴"}, {q: "투르크메니스탄의 수도는?", a: "아슈가바트"},
        {q: "베트남의 수도는?", a: "하노이"}, {q: "태국의 수도는?", a: "방콕"}, {q: "카자흐스탄의 수도는?", a: "아스타나"},
        {q: "몬테네그로의 수도는?", a: "체티네"}, {q: "몰도바의 수도는?", a: "키시너우"}, {q: "독일의 수도는?", a: "베를린"}
    ];

    // ✅ 리스트를 완전히 섞은 다음 앞에서 3개만 가져옴 (중복 방지)
    let sessionQuiz = quizData.sort(() => Math.random() - 0.5).slice(0, 3);
    let solvedCount = 0;

    function showQuiz() {
        if (solvedCount >= 3) { 
            area.classList.add('hidden'); 
            startStage4(); 
            return; 
        }

        let qObj = sessionQuiz[solvedCount];
        document.getElementById('quiz-question').innerText = `(${solvedCount + 1}/3) ${qObj.q}`;
        
        const input = document.getElementById('quiz-input'); 
        const msg = document.getElementById('quiz-msg');
        input.value = ""; 
        input.focus();

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const userAnswer = input.value.trim();
                if (userAnswer === qObj.a) { 
                    solvedCount++; 
                    msg.innerText = "정답입니다. 상식이 있군요?";
                    msg.style.color = "#4CAF50";
                    setTimeout(() => {
                        msg.innerText = "";
                        showQuiz(); 
                    }, 500);
                } else { 
                    timeLeft -= 10; 
                    updateTimerDisplay();
                    msg.innerText = "상식도 없으십니까? 다시 입력하세요.";
                    msg.style.color = "#ff4d4d";
                    input.value = ""; 
                    if (timeLeft <= 0) showFail();
                }
            }
        };
    }
    showQuiz();
}

// [4단계] 도망가는 버튼 (키보드 꼼수 차단 버전)
const game4Area = document.getElementById('game4-area');
const runawayBtn = document.getElementById('runaway-btn');
let clickCount = 0, currentScale = 1.0;

function startStage4() {
    game4Area.classList.remove('hidden'); 
    clickCount = 0; 
    currentScale = 1.0;
    
    // ✅ 4단계 진입 시 키보드 입력(엔터, 스페이스바) 원천 차단
    const blockKeys = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            return false;
        }
    };
    window.addEventListener('keydown', blockKeys);

    runawayBtn.style.transform = `scale(${currentScale})`; 
    moveBtn();

    runawayBtn.onclick = (e) => {
        // ✅ 마우스 클릭이 아닌 '키보드 엔터' 등으로 발생한 클릭 이벤트 방지
        if (e.pointerType === '' || e.detail === 0) return; 

        clickCount++; 
        currentScale -= 0.08; 
        runawayBtn.style.transform = `scale(${currentScale})`;
        document.getElementById('click-count-text').innerText = `클릭 횟수: ${clickCount} / 5`;
        
        if (clickCount >= 5) {
            window.removeEventListener('keydown', blockKeys); // 키보드 차단 해제
            showSuccess(); 
        } else {
            moveBtn();
        }
    };

    runawayBtn.onmouseover = () => { if(Math.random() > 0.2) moveBtn(); };
}
function moveBtn() {
    const maxX = game4Area.clientWidth - runawayBtn.clientWidth;
    const maxY = game4Area.clientHeight - runawayBtn.clientHeight - 100;
    runawayBtn.style.left = Math.random() * maxX + "px"; runawayBtn.style.top = (Math.random() * maxY + 80) + "px";
}

// --- 6. 결과 화면 및 저장 ---
function showFail() { clearInterval(timerInterval); gameScreen.classList.add('hidden'); document.getElementById('fail-screen').classList.remove('hidden'); }
async function showSuccess() {
    clearInterval(timerInterval);
    gameScreen.classList.add('hidden');
    document.getElementById('success-screen').classList.remove('hidden');
    const rawTime = TOTAL_TIME - timeLeft;
    const timeStr = `${Math.floor(rawTime / 60)}분 ${rawTime % 60}초`;
    document.getElementById('rank-univ').innerText = univInput.value;
    document.getElementById('rank-name').innerText = nameInput.value;
    document.getElementById('rank-time').innerText = timeStr;

    document.getElementById('aspiration-submit-btn').onclick = async () => {
        // 🟢 1. 현재 시간 체크 (이벤트 종료 시간 설정)
        const now = new Date();
        const deadline = new Date('2026-04-24T23:59:59'); // 4월 24일 23시 59분 59초

        if (now > deadline) {
            alert("아쉽게도 이벤트가 종료되었습니다!");
            return; // 여기서 함수를 종료시켜서 DB 저장을 막음
        }
        const asp = document.getElementById('aspiration-input').value;
        if (!asp) return alert("포부를 남겨야 진정한 휴먼입니다.");
        const { error } = await _supabase.from('ranking').insert([{ univ: univInput.value, name: nameInput.value, clear_time: timeStr, raw_time: rawTime, aspiration: asp }]);
        if (error) alert("저장 실패: " + error.message);
        else { alert("명예의 전당에 등재되었습니다!"); location.reload(); }
    };
}

retryBtn.onclick = () => { hammerImg.classList.remove('hidden'); hammerImg.classList.add('hammer-ani'); setTimeout(() => location.reload(), 500); };
