// 요소 선택
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

const adImg = document.getElementById("ad-img");
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("music-toggle");

let musicOn = false;

const adList = ["ad1.jpg", "ad2.jpg", "ad3.jpg"];
let adIndex = 0;

setInterval(() => {
  adIndex = (adIndex + 1) % adList.length;
  adImg.src = adList[adIndex];
}, 3000);

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
timeLimit = Number(timeLimit);
let timer = null;

startBtn.addEventListener("click", () => {
  mainScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  resetGame();
  loadRanking();
  startRound();

  bgm.play();
  musicOn = true;
  musicBtn.textContent = "🔊";
});

function startRound() {
  clearTimeout(timer);

  currentColor = colors[Math.floor(Math.random() * colors.length)];
  displayColor = colors[Math.floor(Math.random() * colors.length)];

  wordBox.textContent = colorNames[currentColor];
  wordBox.style.color = displayColor;

  timerBox.textContent = `남은 시간: ${(timeLimit / 1000).toFixed(1)}초`;

  timer = setTimeout(() => endGame(), Number(timeLimit));
}

document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.color === displayColor) {
      score++;
      scoreBox.textContent = `점수: ${score}`;
      if (timeLimit > 600) timeLimit = Number(timeLimit) - 100;
      startRound();
    } else {
      endGame();
    }
  });
});

function endGame() {
  clearTimeout(timer);
  modal.classList.add("show");
}

saveScoreBtn.addEventListener("click", () => {
  const nick = nicknameInput.value || "익명";
  nicknameInput.value = "";

  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push({ name: nick, score });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 10);
  localStorage.setItem("ranking", JSON.stringify(ranking));

  modal.classList.remove("show");
  resetGame();
  loadRanking();
  startRound();
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  resetGame();
  startRound();
});

function resetGame() {
  score = 0;
  timeLimit = 2000;
  timeLimit = Number(timeLimit);
  scoreBox.textContent = "점수: 0";
}

function loadRanking() {
  rankingList.innerHTML = "";
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}등 - ${item.name} : ${item.score}점`;
    rankingList.appendChild(li);
  });
}

musicBtn.addEventListener("click", () => {
  if (musicOn) {
    bgm.pause();
    musicBtn.textContent = "🔇";
  } else {
    bgm.play();
    musicBtn.textContent = "🔊";
  }
  musicOn = !musicOn;
});
