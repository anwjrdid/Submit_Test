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

// [2.5단계] 서버 과부하 (시간 경과에 따른 난이도 상승 버전)
let avoidInterval, avoidTimerObj, bullets = [], mouseX = 200, mouseY = 150, avoidTimeLeft = 15, hitCount = 0;

function startStage2_5() {
    const area = document.getElementById('game2-5-area'); 
    area.classList.remove('hidden');
    const canvas = document.getElementById('avoid-canvas'); 
    const ctx = canvas.getContext('2d');
    
    avoidTimeLeft = 15; 
    bullets = []; 
    hitCount = 0;

    canvas.onmousemove = (e) => { 
        const rect = canvas.getBoundingClientRect(); 
        mouseX = e.clientX - rect.left; 
        mouseY = e.clientY - rect.top; 
    };

    if(avoidInterval) clearInterval(avoidInterval);
    
    avoidInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 상단 HP 바 (빨간색이 차오르면 탈락)
        ctx.fillStyle = "#333"; ctx.fillRect(10, 10, 380, 10);
        ctx.fillStyle = "#ff4d4d"; ctx.fillRect(10, 10, (hitCount / 10) * 380, 10);
        
        // 내 캐릭터 (파란 사각형)
        ctx.fillStyle = "#00b4d8"; ctx.fillRect(mouseX - 5, mouseY - 5, 10, 10);

const elapsed = 15 - avoidTimeLeft; 
        
        // 1. 탄막 생성 확률 증가 (최대 확률을 0.55 -> 0.4 정도로 하향)
        // 0.2 + (15 * 0.013) = 약 0.395
        const spawnChance = 0.2 + (elapsed * 0.013); 
        
        if (Math.random() < spawnChance) {
            const speedBoost = elapsed * 0.15; // 속도 증가폭 다시 복구 (0.2 -> 0.15)
            
            // 🟢 2. 탄막 크기 증가폭 완화 (반지름 4 -> 최대 약 6.2)
            // 아까는 0.25였는데 0.15로 낮췄습니다. 포도알 대신 콩알 정도로 유지!
            const radius = 4 + (elapsed * 0.15); 

            bullets.push({ 
                x: Math.random() * canvas.width, 
                y: 0, 
                // 🟢 좌우 반동 완화 (0.8 -> 0.6): 너무 미친 듯이 튕기지 않게!
                vx: (Math.random() - 0.5) * (6 + speedBoost * 0.6), 
                vy: (Math.random() * 4 + 2) + speedBoost,
                r: radius 
            });
        }

        // ... 하단 로직은 동일 ...

        bullets.forEach((b, i) => {
            b.x += b.vx; 
            b.y += b.vy; 
            
            ctx.fillStyle = "#ff4d4d"; 
            ctx.beginPath(); 
            // 🟢 저장된 개별 반지름(b.r) 사용
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); 
            ctx.fill();

            // 🟢 피격 판정 강화: 탄막의 크기(b.r)가 커지면 맞을 확률도 비례해서 증가
            if (Math.hypot(b.x - mouseX, b.y - mouseY) < (b.r + 5)) {
                hitCount++; 
                timeLeft -= 10; 
                updateTimerDisplay(); 
                bullets.splice(i, 1);
                
                // 15번 맞으면 1단계로 강제 소환
                if (hitCount >= 15) {
                    clearInterval(avoidInterval); 
                    clearInterval(avoidTimerObj);
                    alert("⚠️ 서버 터짐! 보안 수준 미달로 1단계부터 재인증하십시오. ⚠️");
                    area.classList.add('hidden'); 
                    document.getElementById('game1-area').classList.remove('hidden'); 
                    initGame1();
                }
            }
        });
        
        // 화면 밖으로 나간 탄막 제거
        bullets = bullets.filter(b => b.y < canvas.height && b.x > 0 && b.x < canvas.width);
    }, 1000 / 60);

    if(avoidTimerObj) clearInterval(avoidTimerObj);
    avoidTimerObj = setInterval(() => {
        avoidTimeLeft--; 
        document.getElementById('avoid-timer').innerText = `남은 시간: ${avoidTimeLeft}s (히트: ${hitCount}/15)`;
        if (avoidTimeLeft <= 0) { 
            clearInterval(avoidInterval); 
            clearInterval(avoidTimerObj); 
            area.classList.add('hidden'); 
            startStage3(); 
        }
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

// [3.5단계] 수도 퀴즈 (중복 없는 랜덤 & 무조건 5문제 정답 필수)
function startStage3_5() {
    const area = document.getElementById('game3-5-area'); 
    area.classList.remove('hidden');
    
    const quizData = [
        // [난이도 하] 모르면 간첩
    {q: "대한민국의 수도는?", a: "서울"}, {q: "일본의 수도는?", a: "도쿄"}, {q: "프랑스의 수도는?", a: "파리"},
    {q: "영국의 수도는?", a: "런던"}, {q: "미국의 수도는?", a: "워싱턴"}, {q: "독일의 수도는?", a: "베를린"},
    {q: "중국의 수도는?", a: "베이징"}, {q: "이탈리아의 수도는?", a: "로마"},

    // [난이도 중] 들어는 봤는데 헷갈림
    {q: "베트남의 수도는?", a: "하노이"}, {q: "태국의 수도는?", a: "방콕"}, {q: "러시아의 수도는?", a: "모스크바"},
    {q: "스페인의 수도는?", a: "마드리드"}, {q: "필리핀의 수도는?", a: "마닐라"}, {q: "이집트의 수도는?", a: "카이로"},
    {q: "캐나다의 수도는?", a: "오타와"}, {q: "브라질의 수도는?", a: "브라질리아"},
    {q: "오스트레일리아(호주)의 수도는?", a: "캔버라"}, {q: "튀르키예의 수도는?", a: "앙카라"},

    // [난이도 상] 슬슬 검색창 켜야 함
    {q: "카자흐스탄의 수도는?", a: "아스타나"}, {q: "우즈베키스탄의 수도는?", a: "타슈켄트"},
    {q: "사우디아라비아의 수도는?", a: "리야드"}, {q: "몽골의 수도는?", a: "울란바토르"},
    {q: "포르투갈의 수도는?", a: "리스본"}, {q: "그리스의 수도는?", a: "아테네"},

    // [난이도 극상] 채현님 픽 (멘탈 붕괴용)
    {q: "투르크메니스탄의 수도는?", a: "아슈가바트"}, {q: "몬테네그로의 수도는?", a: "체티네"},
    {q: "몰도바의 수도는?", a: "키시너우"}, {q: "부탄의 수도는?", a: "팀푸"},
    {q: "에스토니아의 수도는?", a: "탈린"}, {q: "아제르바이잔의 수도는?", a: "바쿠"},
    {q: "리히텐슈타인의 수도는?", a: "파두츠"}, {q: "모로코의 수도는?", a: "라바트"}
    ];

    // ✅ 리스트를 완전히 섞은 다음 앞에서 5개만 가져옴 (중복 방지)
    let sessionQuiz = quizData.sort(() => Math.random() - 0.5).slice(0, 5);
    let solvedCount = 0;

    function showQuiz() {
        if (solvedCount >= 5) { 
            area.classList.add('hidden'); 
            startStage4(); 
            return; 
        }

        let qObj = sessionQuiz[solvedCount];
        document.getElementById('quiz-question').innerText = `(${solvedCount + 1}/5) ${qObj.q}`;
        
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

// --- 성공 화면 저장 로직 (중복 제거 버전) ---
document.getElementById('aspiration-submit-btn').onclick = async () => {
    // 1. 시간 제한 체크 (동일)
    const now = new Date();
    const deadline = new Date('2026-04-24T23:59:59');
    if (now > deadline) {
        alert("아쉽게도 이벤트가 종료되었습니다ㅜㅜ");
        return;
    }

    const aspInput = document.getElementById('aspiration-input');
    const univ = univInput.value;
    const name = nameInput.value;
    const rawTime = TOTAL_TIME - timeLeft; // 현재 클리어한 시간 (초 단위)
    const timeStr = document.getElementById('rank-time').innerText;

    if (aspInput.value.trim() === "") {
        alert("포부를 남겨야 진정한 휴먼입니다");
        return;
    }

    // 2. 먼저 기존 기록이 있는지 확인합니다.
    const { data: existingData } = await _supabase
        .from('ranking')
        .select('raw_time')
        .eq('univ', univ)
        .eq('name', name)
        .maybeSingle();

    // 3. 기록 비교 로직
    if (existingData) {
        // 기존 기록보다 현재 기록(rawTime)이 더 짧을(작을) 때만 업데이트
        if (rawTime < existingData.raw_time) {
            const { error } = await _supabase
                .from('ranking')
                .update({ 
                    clear_time: timeStr, 
                    raw_time: rawTime, 
                    aspiration: aspInput.value 
                })
                .eq('univ', univ)
                .eq('name', name);
            
            if (!error) alert("축하합니다! 최고 기록이 갱신되었습니다. 🔥");
        } else {
            // 기록 경신에 실패한 경우
            alert("이미 더 좋은 기록이 등록되어 있습니다. 기록 경신 실패! 😜");
        }
    } else {
        // 4. 기존 데이터가 없으면 새로 생성 (insert)
        const { error } = await _supabase
            .from('ranking')
            .insert([{ univ, name, clear_time: timeStr, raw_time: rawTime, aspiration: aspInput.value }]);
        
        if (!error) alert("명예의 전당에 처음으로 등재되었습니다! 🎉");
    }

    location.reload();
};
}

retryBtn.onclick = () => { hammerImg.classList.remove('hidden'); hammerImg.classList.add('hammer-ani'); setTimeout(() => location.reload(), 500); };
