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

// 게임 데이터
const colors = ["red", "blue", "green", "yellow"];
const colorNames = {
  red: "빨간색",
  blue: "파란색",
  green: "초록색",
  yellow: "노란색",
};

let currentColor = "";
let displayColor = "";
let score = 0;
let timeLimit = 2000;
let timer;

// 시작 버튼 누르면 게임 화면 표시
startBtn.addEventListener("click", () => {
  mainScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  loadRanking();
  startRound();
});

// 라운드 시작
function startRound() {
  clearTimeout(timer);

  currentColor = colors[Math.floor(Math.random() * colors.length)];
  displayColor = colors[Math.floor(Math.random() * colors.length)];

  wordBox.textContent = colorNames[currentColor];
  wordBox.style.color = displayColor;

  timerBox.textContent = `남은 시간: ${(timeLimit / 1000).toFixed(1)}초`;

  timer = setTimeout(() => {
    endGame();
  }, timeLimit);
}

// 버튼 클릭이 정답인지 확인
document.querySelectorAll(".color-btn").forEach((btn) => {
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

// 게임 종료 → 랭킹 등록
function endGame() {
  clearTimeout(timer);
  modal.classList.remove("hidden");
}

saveScoreBtn.addEventListener("click", () => {

  const nickname = nicknameInput.value || "익명";
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.push({ name: nickname, score });

  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 10);

  localStorage.setItem("ranking", JSON.stringify(ranking));

  nicknameInput.value = "";
  modal.classList.add("hidden");

  resetGame();
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  resetGame();
});

// 게임 리셋
function resetGame() {
  score = 0;
  timeLimit = 2000;
  scoreBox.textContent = "점수: 0";
  startRound();
  loadRanking();
}

// 랭킹 불러오기
function loadRanking() {
  rankingList.innerHTML = "";
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}등 - ${item.name} : ${item.score}점`;
    rankingList.appendChild(li);
  });
}
