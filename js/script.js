// --- 1. 초기화 및 Supabase 연결 ---
const _supabase = supabase.createClient('https://knkfkyzcrggxfzwomjgy.supabase.co', 'sb_publishable_yl6XC2nGGP0_BK0hhgxfww_MyxK0aOh');

// 🔴 [확인] 채현님의 실제 Workers 주소를 넣어주세요
const WORKER_URL = 'https://ranking-saver.yangchaehyeon67.workers.dev'; 

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
let allRankingData = []; 

// 🔴 [보안] 관리자 도구 조작 방지 캡슐화
const GameState = (() => {
    let _timeLeft = TOTAL_TIME;
    return {
        getTime: () => _timeLeft,
        decrease: (val) => { _timeLeft -= val; },
        reset: () => { _timeLeft = TOTAL_TIME; }
    };
})();

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

// --- 3. 실시간 랭킹 로드 (XSS 방어 완료) ---
async function loadRankingData() {
    const { data, error } = await _supabase
        .from('ranking')
        .select('*')
        .order('raw_time', { ascending: true })
        .limit(3);

    if (error) return console.error("데이터 로드 실패:", error);
    allRankingData = data;
    renderTop3();
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
            // 🔴 [보안] textContent를 사용하여 XSS 완벽 방어
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'space-between';
            wrapper.style.alignItems = 'center';

            const nameSpan = document.createElement('span');
            nameSpan.style.color = colors[i];
            nameSpan.style.fontWeight = 'bold';
            nameSpan.style.fontSize = '1.1rem';
            nameSpan.textContent = `${i+1}위 [${item.univ}] ${item.name}`;

            const timeSpan = document.createElement('span');
            timeSpan.style.color = '#ff4d4d';
            timeSpan.textContent = item.clear_time;

            const aspDiv = document.createElement('div');
            aspDiv.style.color = '#a8dadc';
            aspDiv.style.fontSize = '0.85rem';
            aspDiv.style.marginTop = '5px';
            aspDiv.style.fontStyle = 'italic';
            aspDiv.textContent = `"${item.aspiration}"`;

            wrapper.appendChild(nameSpan);
            wrapper.appendChild(timeSpan);
            li.appendChild(wrapper);
            li.appendChild(aspDiv);
        } else {
            const emptyDiv = document.createElement('div');
            emptyDiv.style.display = 'flex';
            emptyDiv.style.justifyContent = 'space-between';
            emptyDiv.style.alignItems = 'center';
            emptyDiv.style.opacity = '0.5';
            
            const emptyLabel = document.createElement('span');
            emptyLabel.style.color = '#666';
            emptyLabel.style.fontWeight = 'bold';
            emptyLabel.style.fontSize = '1.1rem';
            emptyLabel.textContent = `${i+1}위 [ - ] 공석`;

            const emptyTime = document.createElement('span');
            emptyTime.style.color = '#666';
            emptyTime.textContent = '-- : --';

            const nextLabel = document.createElement('div');
            nextLabel.style.color = '#444';
            nextLabel.style.fontSize = '0.85rem';
            nextLabel.style.marginTop = '5px';
            nextLabel.textContent = '"다음 주인공은 누구?"';

            emptyDiv.appendChild(emptyLabel);
            emptyDiv.appendChild(emptyTime);
            li.appendChild(emptyDiv);
            li.appendChild(nextLabel);
        }
        rankingList.appendChild(li);
    }
}

// --- 4. 메인 로직 및 타이머 ---
submitBtn.onclick = () => {
    if (!univInput.value.trim() || !nameInput.value.trim()) return alert("학교와 이름을 입력하십시오 휴먼.");
    displayUniv.textContent = univInput.value;
    displayName.textContent = nameInput.value;
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
        if (GameState.getTime() <= 0) { clearInterval(timerInterval); showFail(); return; }
        GameState.decrease(1); updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const t = GameState.getTime();
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    timeLeftDisplay.textContent = `${m}:${s}`;
}

// --- 5. 미니 게임 스테이지 (로직/멘트 유지) ---

const trafficGrid = document.getElementById('traffic-grid');
let game1Active = false, correctCount = 0;
function initGame1() {
    trafficGrid.innerHTML = ''; correctCount = 0; game1Active = false;
    let cards = ['🚦','🚦','🚦','🚦','🚦','🚦','🚦',
        '🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑','🛑'].sort(()=>Math.random()-0.5);
    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'card'; card.textContent = emoji;
        card.onclick = () => {
            if(!game1Active || card.classList.contains('revealed')) return;
            if(emoji === '🚦') {
                card.classList.add('revealed');
                if(++correctCount === 7) {
                    game1Active = false;
                    setTimeout(() => { document.getElementById('game1-area').classList.add('hidden'); startStage2(); }, 500);
                }
            } else {
                card.classList.add('wrong'); GameState.decrease(1); updateTimerDisplay();
                setTimeout(() => card.classList.remove('wrong'), 180);
            }
        };
        trafficGrid.appendChild(card);
    });
    setTimeout(() => { document.querySelectorAll('.card').forEach(c => c.classList.add('hidden-card')); game1Active = true; }, 500);
}

const game2Area = document.getElementById('game2-area');
const arrowContainer = document.getElementById('arrow-container');
let game2Active = false, currentArrowSeq = [], currentIdx = 0, roundIdx = 0;
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const arrowMap = {'ArrowUp':'⬆️','ArrowDown':'⬇️','ArrowLeft':'⬅️','ArrowRight':'➡️'};
function startStage2() { game2Area.classList.remove('hidden'); roundIdx = 0; game2Active = true; initArrowRound(); document.addEventListener('keydown', handleArrowPress); }
function initArrowRound() {
    currentIdx = 0; currentArrowSeq = []; arrowContainer.innerHTML = '';
    const count = [3, 5, 7][roundIdx];
    document.getElementById('command-stage-text').textContent = `Round ${roundIdx+1} (${count}개)`;
    for(let i=0; i<count; i++){
        const key = arrowKeys[Math.floor(Math.random()*4)]; currentArrowSeq.push(key);
        const el = document.createElement('div'); el.className = 'arrow-box'; el.id = `arrow-${i}`; el.textContent = arrowMap[key];
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
        GameState.decrease(5); updateTimerDisplay();
        document.querySelectorAll('.arrow-box').forEach(el => { el.classList.remove('success'); el.classList.add('error'); setTimeout(() => el.classList.remove('error'), 180); });
        currentIdx = 0; if(GameState.getTime() <= 0) showFail();
    }
}

let avoidInterval, avoidTimerObj, bullets = [], mouseX = 200, mouseY = 150, avoidTimeLeft = 15, hitCount = 0;
function startStage2_5() {
    const area = document.getElementById('game2-5-area'); 
    area.classList.remove('hidden');
    const canvas = document.getElementById('avoid-canvas'); 
    const ctx = canvas.getContext('2d');
    avoidTimeLeft = 15; bullets = []; hitCount = 0;
    canvas.onmousemove = (e) => { 
        const rect = canvas.getBoundingClientRect(); 
        mouseX = e.clientX - rect.left; mouseY = e.clientY - rect.top; 
    };
    if(avoidInterval) clearInterval(avoidInterval);
    avoidInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#333"; ctx.fillRect(10, 10, 380, 10);
        ctx.fillStyle = "#ff4d4d"; ctx.fillRect(10, 10, (hitCount / 15) * 380, 10);
        ctx.fillStyle = "#00b4d8"; ctx.fillRect(mouseX - 5, mouseY - 5, 10, 10);
        const elapsed = 15 - avoidTimeLeft; 
        const spawnChance = 0.2 + (elapsed * 0.013); 
        if (Math.random() < spawnChance) {
            const speedBoost = elapsed * 0.15;
            const radius = 4 + (elapsed * 0.15); 
            bullets.push({ 
                x: Math.random() * canvas.width, y: 0, 
                vx: (Math.random() - 0.5) * (6 + speedBoost * 0.6), 
                vy: (Math.random() * 4 + 2) + speedBoost, r: radius 
            });
        }
        bullets.forEach((b, i) => {
            b.x += b.vx; b.y += b.vy; 
            ctx.fillStyle = "#ff4d4d"; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
            if (Math.hypot(b.x - mouseX, b.y - mouseY) < (b.r + 5)) {
                hitCount++; GameState.decrease(10); updateTimerDisplay(); bullets.splice(i, 1);
                if (hitCount >= 15) {
                    clearInterval(avoidInterval); clearInterval(avoidTimerObj);
                    alert("⚠️ 서버 터짐! 보안 수준 미달로 1단계부터 재인증하십시오. ⚠️");
                    area.classList.add('hidden'); document.getElementById('game1-area').classList.remove('hidden'); initGame1();
                }
            }
        });
        bullets = bullets.filter(b => b.y < canvas.height && b.x > 0 && b.x < canvas.width);
    }, 1000 / 60);
    if(avoidTimerObj) clearInterval(avoidTimerObj);
    avoidTimerObj = setInterval(() => {
        avoidTimeLeft--; 
        document.getElementById('avoid-timer').textContent = `남은 시간: ${avoidTimeLeft}s (히트: ${hitCount}/15)`;
        if (avoidTimeLeft <= 0) { clearInterval(avoidInterval); clearInterval(avoidTimerObj); area.classList.add('hidden'); startStage3(); }
    }, 1000);
}

const game3Area = document.getElementById('game3-area');
const captchaInput = document.getElementById('captcha-input');
const insultMsg = document.getElementById('insult-msg');
let targetWord = "";
function startStage3() {
    game3Area.classList.remove('hidden');
    const words = ["VJcTCa", "PrOgRaM", "LIkeliOn", "CoMpUTer", "SuWonUni", "GraduAte", "HeoJeob", "PrOgrAmmer", "HelLowoRLD","chAtGpt", "StelLliVe","oOtDgoOD"];
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
    let curr = gen(); captchaInput.value = ""; captchaInput.focus(); insultMsg.textContent = "";
    captchaInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            if (captchaInput.value.trim() === curr) { game3Area.classList.add('hidden'); startStage3_5(); }
            else { GameState.decrease(5); updateTimerDisplay(); insultMsg.textContent = "시각 장애가 있으십니까?"; curr = gen(); captchaInput.value = ""; if (GameState.getTime() <= 0) showFail(); }
        }
    };
}

function startStage3_5() {
    const area = document.getElementById('game3-5-area'); area.classList.remove('hidden');
    const quizData = [
    {q: "대한민국의 수도는?", a: ["서울", "서울특별시"]}, {q: "일본의 수도는?", a: "도쿄"}, {q: "프랑스의 수도는?", a: "파리"},
    {q: "영국의 수도는?", a: "런던"}, {q: "미국의 수도는?", a: ["워싱턴", "워싱턴 DC", "워싱턴 D.C"]}, {q: "독일의 수도는?", a: "베를린"},
    {q: "중국의 수도는?", a: "베이징"}, {q: "이탈리아의 수도는?", a: "로마"},
    {q: "베트남의 수도는?", a: "하노이"}, {q: "태국의 수도는?", a: "방콕"}, {q: "러시아의 수도는?", a: "모스크바"},
    {q: "스페인의 수도는?", a: "마드리드"}, {q: "필리핀의 수도는?", a: "마닐라"}, {q: "이집트의 수도는?", a: "카이로"},
    {q: "캐나다의 수도는?", a: "오타와"}, {q: "브라질의 수도는?", a: "브라질리아"},
    {q: "오스트레일리아(호주)의 수도는?", a: "캔버라"}, {q: "튀르키예의 수도는?", a: "앙카라"},
    {q: "카자흐스탄의 수도는?", a: ["아스타나","누르술탄"]}, {q: "우즈베키스탄의 수도는?", a: "타슈켄트"},
    {q: "사우디아라비아의 수도는?", a: "리야드"}, {q: "몽골의 수도는?", a: ["울란바토르", "울란바타르"]},
    {q: "포르투갈의 수도는?", a: ["리스본","리스보아"]}, {q: "그리스의 수도는?", a: "아테네"},
    {q: "몬테네그로의 수도는?", a: "포드고리차"},
    {q: "부탄의 수도는?", a: ["팀푸","팀부"]}, {q: "에스토니아의 수도는?", a: "탈린"}, {q: "아제르바이잔의 수도는?", a: "바쿠"},
    {q: "모로코의 수도는?", a: "라바트"}
    ];
    let sessionQuiz = quizData.sort(() => Math.random() - 0.5).slice(0, 5);
    let solvedCount = 0;
    function showQuiz() {
        if (solvedCount >= 5) { area.classList.add('hidden'); startStage4(); return; }
        let qObj = sessionQuiz[solvedCount]; document.getElementById('quiz-question').textContent = `(${solvedCount + 1}/5) ${qObj.q}`;
        const input = document.getElementById('quiz-input'); const msg = document.getElementById('quiz-msg');
        input.value = ""; input.focus();
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const userAnswer = input.value.trim();
                const correctAnswers = Array.isArray(qObj.a) ? qObj.a : [qObj.a];
                if (correctAnswers.includes(userAnswer)) { 
                    input.onkeydown = null; solvedCount++; msg.textContent = "정답입니다. 상식이 있군요?"; msg.style.color = "#4CAF50";
                    setTimeout(() => { msg.textContent = ""; showQuiz(); }, 500);
                } else { 
                    GameState.decrease(10); updateTimerDisplay(); msg.textContent = "상식도 없으십니까? 다시 입력하세요."; msg.style.color = "#ff4d4d"; input.value = ""; 
                    if (GameState.getTime() <= 0) showFail();
                }
            }
        };
    }
    showQuiz();
}

const game4Area = document.getElementById('game4-area');
const runawayBtn = document.getElementById('runaway-btn');
let clickCount = 0, currentScale = 1.0;
function startStage4() {
    game4Area.classList.remove('hidden'); clickCount = 0; currentScale = 1.0;
    const blockKeys = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); return false; } };
    window.addEventListener('keydown', blockKeys);
    runawayBtn.style.transform = `scale(${currentScale})`; moveBtn();
    runawayBtn.onclick = (e) => {
        if (e.pointerType === '' || e.detail === 0) return; 
        clickCount++; currentScale -= 0.08; 
        runawayBtn.style.transform = `scale(${currentScale})`;
        document.getElementById('click-count-text').textContent = `클릭 횟수: ${clickCount} / 5`;
        if (clickCount >= 5) { window.removeEventListener('keydown', blockKeys); showSuccess(); }
        else { moveBtn(); }
    };
    runawayBtn.onmouseover = () => { if(Math.random() > 0.2) moveBtn(); };
}
function moveBtn() {
    const maxX = game4Area.clientWidth - runawayBtn.clientWidth;
    const maxY = game4Area.clientHeight - runawayBtn.clientHeight - 100;
    runawayBtn.style.left = Math.random() * maxX + "px"; runawayBtn.style.top = (Math.random() * maxY + 80) + "px";
}

// --- 6. 결과 화면 및 워커 저장 (갱신 로직 복구 완료) ---
function showFail() { clearInterval(timerInterval); gameScreen.classList.add('hidden'); document.getElementById('fail-screen').classList.remove('hidden'); }

async function showSuccess() {
    clearInterval(timerInterval);
    gameScreen.classList.add('hidden');
    document.getElementById('success-screen').classList.remove('hidden');
    const rawTime = TOTAL_TIME - GameState.getTime();
    const timeStr = `${Math.floor(rawTime / 60)}분 ${rawTime % 60}초`;
    
    document.getElementById('rank-univ').textContent = univInput.value;
    document.getElementById('rank-name').textContent = nameInput.value;
    document.getElementById('rank-time').textContent = timeStr;

    document.getElementById('aspiration-submit-btn').onclick = async () => {
        const now = new Date();
        const deadline = new Date('2026-04-24T23:59:59');
        if (now > deadline) return alert("아쉽게도 이벤트가 종료되었습니다ㅜㅜ");

        const aspInput = document.getElementById('aspiration-input');
        if (aspInput.value.trim() === "") return alert("포부를 남겨야 진정한 휴먼입니다");

        // 🟢 1. 기존 기록 확인 (갱신 여부 판단용)
        const { data: existingData } = await _supabase
            .from('ranking')
            .select('raw_time')
            .eq('univ', univInput.value)
            .eq('name', nameInput.value)
            .maybeSingle();

        if (existingData && rawTime >= existingData.raw_time) {
            return alert("이미 더 좋은 기록이 등록되어 있습니다. 기록 경신 실패! 😜");
        }

        // 🟢 2. Workers 서버로 전송
        const payload = {
            univ: univInput.value,
            name: nameInput.value,
            clear_time: timeStr,
            raw_time: rawTime,
            aspiration: aspInput.value
        };

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                if (existingData) {
                    alert("축하합니다! 최고 기록이 갱신되었습니다. 🔥");
                } else {
                    alert("명예의 전당에 처음으로 등재되었습니다! 🎉");
                }
                location.reload();
            } else {
                const errData = await response.json();
                alert(`저장 실패: ${errData.error || "서버 응답 오류"}`);
            }
        } catch (err) {
            console.error("통신 에러:", err);
            alert("서버와 통신할 수 없습니다.");
        }
    };
}

retryBtn.onclick = () => { hammerImg.classList.remove('hidden'); hammerImg.classList.add('hammer-ani'); setTimeout(() => location.reload(), 500); };