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

// 4. '최종 제출하시겠습니까?' 버튼 클릭 이벤트 (2단계로 넘어가는 함정)
submitBtn.addEventListener('click', () => {
    const univ = univInput.value.trim();
    const name = nameInput.value.trim();

    // 입력값 검사 (안 적으면 못 넘어가게!)
    if (!univ || !name) {
        alert("학교와 이름을 정확히 입력하십시오 휴먼.");
        return;
    }

    // TODO: 여기서 2단계(WARNING 창 + 카운트다운) 화면으로 넘어가는 로직이 추가될 거야!
    alert(`[시스템 오류] 정상적인 제출이 거부되었습니다.\n보안 인증을 시작합니다.`);
    console.log(`저장된 데이터 - 학교: ${univ}, 이름: ${name}`);
});