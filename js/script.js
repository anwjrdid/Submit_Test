// 필요한 HTML 요소들 가져오기
const helpBtn = document.getElementById('help-btn');
const closeModalBtn = document.getElementById('close-modal');
const helpModal = document.getElementById('help-modal');
const submitBtn = document.getElementById('submit-btn');
const univInput = document.getElementById('univ-input');
const nameInput = document.getElementById('name-input');

// 1. 물음표 버튼 누르면 모달창 열기
helpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

// 2. X 버튼 누르면 모달창 닫기
closeModalBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

// 3. 모달창 바깥(검은 배경) 누르면 닫기
window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.classList.add('hidden');
    }
});

// 추가로 필요한 HTML 요소들 가져오기
const mainContainer = document.querySelector('.container');
const warningScreen = document.getElementById('warning-screen');
const gameScreen = document.getElementById('game-screen');
const robotCheckbox = document.getElementById('im-not-robot');
const displayUniv = document.getElementById('display-univ');
const displayName = document.getElementById('display-name');
const timeLeftDisplay = document.getElementById('time-left');

// 타이머 변수
let timerInterval;
let timeLeft = 300; // 5분 = 300초

// 4. '최종 제출하시겠습니까?' 버튼 클릭 (함정 발동!)
submitBtn.addEventListener('click', () => {
    const univ = univInput.value.trim();
    const name = nameInput.value.trim();

    // 입력값 검사
    if (!univ || !name) {
        alert("학교와 이름을 정확히 입력하십시오 휴먼.");
        return;
    }

    // 데이터 세팅 (다음 화면 상단에 띄울 정보)
    displayUniv.innerText = univ;
    displayName.innerText = name;

    // 메인 시험지 화면 숨기고 경고창 띄우기
    mainContainer.classList.add('hidden');
    warningScreen.classList.remove('hidden');
});

// [수정할 부분] 5. '로봇이 아닙니다' 체크박스 클릭
robotCheckbox.addEventListener('change', () => {
    if (robotCheckbox.checked) {
        setTimeout(() => {
            warningScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            startTimer();
            
            // 1단계 게임 시작 호출!
            initGame1(); 
        }, 800);
    }
});

// 6. 5분 카운트다운 타이머 함수
function startTimer() {
    // 1초마다 실행
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeLeftDisplay.innerText = "00:00";
            // TODO: 나중에 이 부분에 "미쳤습니까 휴먼?" 짤과 실패 화면 로직 연결
            alert("시간 초과! 미쳤습니까 휴먼?"); 
            return;
        }
        
        timeLeft--;
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timeLeftDisplay.innerText = `${minutes}:${seconds}`;
        
        // 시간이 30초 이하로 남으면 빨간색으로 깜빡이게 처리 가능
        if(timeLeft <= 30) {
            timeLeftDisplay.classList.add('blink-text');
        }
    }, 1000);
}

// ==========================================
// [새로 추가할 부분] 7. 미니게임 1단계 로직
// ==========================================
const trafficGrid = document.getElementById('traffic-grid');
let game1Active = false;
let correctCount = 0;

function initGame1() {
    trafficGrid.innerHTML = ''; // 초기화
    correctCount = 0;
    game1Active = false;

    // 진짜 신호등(🚦) 4개, 가짜 신호등(🛑) 5개 배열 만들기
    let cards = ['🚦', '🚦', '🚦', '🚦', '🛑', '🛑', '🛑', '🛑', '🛑'];
    
    // 배열 섞기 (랜덤 배치)
    cards.sort(() => Math.random() - 0.5);

    // 카드 생성해서 화면에 뿌리기
    cards.forEach((emoji, index) => {
        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        cardEl.innerText = emoji;
        cardEl.dataset.type = emoji === '🚦' ? 'real' : 'fake';
        
        // 카드 클릭 이벤트
        cardEl.addEventListener('click', () => handleCardClick(cardEl));
        
        trafficGrid.appendChild(cardEl);
    });

    // 3초 뒤에 카드 뒤집기 (게임 진짜 시작)
    setTimeout(() => {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => card.classList.add('hidden-card'));
        game1Active = true; // 이제부터 클릭 인정!
    }, 1000);
}

function handleCardClick(card) {
    // 3초 대기 중이거나 이미 까본 카드면 무시
    if (!game1Active || card.classList.contains('revealed')) return;

    if (card.dataset.type === 'real') {
        // 정답!
        card.classList.remove('hidden-card');
        card.classList.add('revealed');
        correctCount++;

        // 4개 다 찾았으면 클리어!
        if (correctCount === 4) {
            game1Active = false;
            setTimeout(() => {
                alert("1단계 클리어! 다음 단계로 넘어갑니다.");
                // TODO: 1단계 화면 숨기고 2단계 화면 띄우는 로직 들어갈 예정!
            }, 500);
        }
    } else {
        // 오답! (시간 1초 차감)
        card.classList.add('wrong');
        
        // 1초 차감 페널티!
        timeLeft -= 1; 
        updateTimerDisplay(); // 차감된 시간 즉시 화면에 반영 (이 함수는 아래에 추가)

        // 0.3초 뒤에 빨간색/흔들림 효과 제거하고 다시 뒤집기
        setTimeout(() => {
            card.classList.remove('wrong');
        }, 300);
    }
}

// 시간에 맞춰 화면 텍스트 바꿔주는 부분을 함수로 분리 (차감 시 즉시 반영하기 위함)
function updateTimerDisplay() {
    if (timeLeft < 0) timeLeft = 0; // 마이너스 방지
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    timeLeftDisplay.innerText = `${minutes}:${seconds}`;
}
