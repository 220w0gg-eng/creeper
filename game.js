// 화면 요소
const mainScreen = document.getElementById("main-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("start-btn");

const wordBox = document.getElementById("word-box");
const timerBox = document.getElementById("timer");
const scoreBox = document.getElementById("score");
const rankingList = document.getElementById("ranking-list");

const modal = document.getElementById("nickname-modal");
const nicknameInput = document.getElementById("nickname-input");
const saveScoreBtn = document.getElementById("save-score-btn");
const cancelBtn = document.getElementById("cancel-btn");

const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("music-toggle");

// 광고 영역 이미지 리스트
const adImages = ["ad1.jpg", "ad2.jpg", "ad3.jpg"];
const adImgTag = document.getElementById("ad-img");
let adIndex = 0;

// 광고 자동 로테이션
setInterval(() => {
  adIndex = (adIndex + 1) % adImages.length;
  adImgTag.src = adImages[adIndex];
}, 3000);

// 색상 데이터
const colors = ["red", "blue", "green", "yellow"];
const colorNames = {
  red: "빨간색",
  blue: "파란색",
  green: "초록색",
  yellow: "노란색"
};

let currentColor = "";
let displayColor = "";
let score = 0;
let timeLimit = 2000;
let timer = null;

/* ===========================
       음악 ON/OFF
   =========================== */
let isMusicOn = false;

musicBtn.addEventListener("click", () => {
  if (isMusicOn) {
    bgm.pause();
    musicBtn.textContent = "🔇";
  } else {
    bgm.play();
    musicBtn.textContent = "🔊";
  }
  isMusicOn = !isMusicOn;
});

/* ===========================
       게임 시작
   =========================== */
startBtn.addEventListener("click", () => {
  mainScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  resetGame();
  loadRanking();
  startRound();

  // 게임 시작 시 자동 BGM 켜기
  bgm.play();
  musicBtn.textContent = "🔊";
  isMusicOn = true;
});

/* ===========================
       라운드 시작
   =========================== */
function startRound() {
  clearTimeout(timer);

  currentColor = colors[Math.floor(Math.random() * colors.length)];
  displayColor = colors[Math.floor(Math.random() * colors.length)];

  wordBox.textContent = colorNames[currentColor];
  wordBox.style.color = displayColor;

  timerBox.textContent = `남은 시간: ${(timeLimit / 1000).toFixed(1)}초`;

  timer = setTimeout(() => endGame(), timeLimit);
}

/* ===========================
       버튼 클릭 처리
   =========================== */
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const answer = btn.dataset.color;

    if (answer === displayColor) {
      score++;
      scoreBox.textContent = `점수: ${score}`;
      if (timeLimit > 600) timeLimit -= 100;
      startRound();
    } else {
      endGame();
    }
  });
});

/* ===========================
       게임 종료 → 팝업
   =========================== */
function endGame() {
  clearTimeout(timer);
  modal.classList.remove("hidden");
}

/* ===========================
       점수 저장
   =========================== */
saveScoreBtn.addEventListener("click", () => {

  const nickname = nicknameInput.value || "익명";
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.push({ name: nickname, score });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 10);

  localStorage.setItem("ranking", JSON.stringify(ranking));

  modal.classList.add("hidden");
  nicknameInput.value = "";
  
  resetGame();
  loadRanking();
  startRound();
});

/* ===========================
       등록 취소 → 새 게임
   =========================== */
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  resetGame();
  startRound();
});

/* ===========================
       리셋
   =========================== */
function resetGame() {
  score = 0;
  timeLimit = 2000;
  scoreBox.textContent = "점수: 0";
}

/* ===========================
       랭킹 출력
   =========================== */
function loadRanking() {
  rankingList.innerHTML = "";
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.forEach((item, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}등 - ${item.name} : ${item.score}점`;
    rankingList.appendChild(li);
  });
}
