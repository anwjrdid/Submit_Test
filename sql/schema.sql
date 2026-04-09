-- 랭킹 로그 테이블 생성
CREATE TABLE EXAM_RANKING (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- 고유 번호 (자동 증가)
    UNIV_NAME VARCHAR2(100) NOT NULL,                   -- 학교명
    PLAYER_NAME VARCHAR2(100) NOT NULL,                 -- 플레이어 이름
    CLEAR_TIME NUMBER NOT NULL,                         -- 클리어 시간 (예: 125초면 125 저장)
    ASPIRATION VARCHAR2(300),                           -- 남긴 포부
    SUBMIT_DATE DATE DEFAULT SYSDATE                    -- 제출한 날짜/시간
);

-- 걸린 시간(CLEAR_TIME)이 적은 순서대로 10개만 가져오기
SELECT UNIV_NAME, PLAYER_NAME, CLEAR_TIME, ASPIRATION 
FROM EXAM_RANKING
ORDER BY CLEAR_TIME ASC
FETCH FIRST 10 ROWS ONLY;