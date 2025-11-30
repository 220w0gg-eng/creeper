// 🔥 Firebase import
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, push, set, get } 
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// 🔥 Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA7y91PPdG2Bb1euglNpdu_Z3KhlajDFVI",
  authDomain: "creeper-ranking.firebaseapp.com",
  databaseURL: "https://creeper-ranking-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "creeper-ranking",
  storageBucket: "creeper-ranking.firebasestorage.app",
  messagingSenderId: "169311756920",
  appId: "1:169311756920:web:d803c5a07aa8f0ba36038d",
  measurementId: "G-SR74EEREYZ"
};

// Firebase 실행
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ====== 기존 게임 코드 시작 ======

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
const retryBtn = document.getElementById("retry-btn");
const goMainBtn = document.getElementById("go-main-btn");

const adImg = document.getElementById("ad-img");
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("music-toggle");

let musicOn = false;

const adList = ["ad1.jpg", "ad2.jpg", "ad3.jpg"];
let adIndex = 0;

// 광고 변경
setInterval(() => {
  adIndex = (adIndex + 1) % adList.length;
  adImg.src = adList[adIndex];
}, 3000);

// 게임 데이터
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
let timerInterval = null;

// 게임 시작
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

// 라운드 시작
function startRound() {
  clearTimeout(timer);
  clearInterval(timerInterval);

  currentColor = colors[Math.floor(Math.random() * colors.length)];
  displayColor = colors[Math.floor(Math.random() * colors.length)];

  wordBox.textContent = colorNames[currentColor];
  wordBox.style.color = displayColor;

  let remaining = timeLimit;
  updateTimerText(remaining);

  timerInterval = setInterval(() => {
    remaining -= 100;
    if (remaining <= 0) remaining = 0;
    updateTimerText(remaining);
  }, 100);

  timer = setTimeout(() => endGame(), timeLimit);
}

// 남은 시간 표시
function updateTimerText(ms) {
  timerBox.textContent = `남은 시간: ${(ms / 1000).toFixed(1)}초`;
}

// 버튼 클릭
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.color === displayColor) {
      score++;
      scoreBox.textContent = `점수: ${score}`;
      if (timeLimit > 600) timeLimit -= 100;
      startRound();
    } else {
      endGame();
    }
  });
});

// 게임 종료
function endGame() {
  clearTimeout(timer);
  clearInterval(timerInterval);

  document.getElementById("final-score").textContent = `${score}점`;
  modal.classList.add("show");
}

// 🔥 등록하기 (Firebase 저장만, 재시작 X)
saveScoreBtn.addEventListener("click", async () => {
  const nick = nicknameInput.value || "익명";
  nicknameInput.value = "";

  const rankingRef = ref(db, "ranking");
  const newEntry = push(rankingRef);

  await set(newEntry, {
    name: nick,
    score: score,
    time: Date.now()
  });

  // 랭킹만 새로고침 (팝업은 그대로)
  loadRanking();
});

// 다시하기
retryBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  resetGame();
  startRound();
});

// 메인 화면으로
goMainBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  resetGame();

  gameScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  bgm.pause();
  musicOn = false;
  musicBtn.textContent = "🔇";
});

// 리셋
function resetGame() {
  score = 0;
  timeLimit = 2000;
  scoreBox.textContent = "점수: 0";
}

// 🔥 Firebase에서 랭킹 불러오기
async function loadRanking() {
  const rankingRef = ref(db, "ranking");
  const snapshot = await get(rankingRef);

  rankingList.innerHTML = "";

  if (snapshot.exists()) {
    const entries = Object.values(snapshot.val());

    entries
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .forEach((item, i) => {
        const li = document.createElement("li");
        li.textContent = `${i + 1}등 - ${item.name} : ${item.score}점`;
        rankingList.appendChild(li);
      });
  }
}

// 음악 토글
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
