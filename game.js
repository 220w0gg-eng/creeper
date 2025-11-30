// =========================
// 🔥 Firebase 설정
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, push, set, get }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);


// =========================
// 🎮 DOM 요소 선택
// =========================
const mainScreen    = document.getElementById("main-screen");
const gameScreen    = document.getElementById("game-screen");
const startBtn      = document.getElementById("start-btn");
const helpBtn       = document.getElementById("help-btn");

const wordBox       = document.getElementById("word-box");
const timerBox      = document.getElementById("timer");
const scoreBox      = document.getElementById("score");
const rankingList   = document.getElementById("ranking-list");

const modal         = document.getElementById("nickname-modal");
const nicknameInput = document.getElementById("nickname-input");
const finalScoreText= document.getElementById("final-score");

const saveScoreBtn  = document.getElementById("save-score-btn");
const retryBtn      = document.getElementById("retry-btn");
const goMainBtn     = document.getElementById("go-main-btn");

const adImg         = document.getElementById("ad-img");

const bgm           = document.getElementById("bgm");
const sound1        = document.getElementById("sound1");
const sound2        = document.getElementById("sound2");
const musicToggle   = document.getElementById("music-toggle");


// =========================
// 🔊 음악 제어
// =========================
let musicOn = true;

function syncMusicIcon() {
  musicToggle.textContent = musicOn ? "🔊" : "🔇";
}

function applyMusicState(fromUser = false) {
  if (musicOn) {
    const p = bgm.play();
    if (p && typeof p.catch === "function" && !fromUser) {
      p.catch(() => {});
    }
  } else {
    bgm.pause();
  }

  // 🔈 효과음도 전체 사운드 연동
  sound1.volume = musicOn ? 1 : 0;
  sound2.volume = musicOn ? 1 : 0;

  syncMusicIcon();
}

musicToggle.addEventListener("click", () => {
  musicOn = !musicOn;
  applyMusicState(true);
});


// =========================
// 📺 광고 슬라이드
// =========================
const adList  = ["ad1.jpg", "ad2.jpg", "ad3.jpg"];
let adIndex   = 0;

setInterval(() => {
  adIndex = (adIndex + 1) % adList.length;
  adImg.src = adList[adIndex];
}, 3000);


// =========================
// 🎯 게임 데이터
// =========================
const colors = ["red", "blue", "green", "yellow"];
const colorNames = {
  red: "빨간색",
  blue: "파란색",
  green: "초록색",
  yellow: "노란색"
};

let currentColor  = "";
let displayColor  = "";
let score         = 0;
let timeLimit     = 2000;
let timer         = null;
let timerInterval = null;

let hasSavedScore = false;   // 등록 방지 플래그


// =========================
// ▶ 게임 시작
// =========================
startBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("show");

  mainScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  helpBtn.style.display = "none";

  resetGame();
  loadRanking();
  startRound();

  applyMusicState(true);
});


// =========================
// 🔁 라운드 시작
// =========================
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
    if (remaining < 0) remaining = 0;
    updateTimerText(remaining);
  }, 100);

  timer = setTimeout(() => endGame(), timeLimit);
}

function updateTimerText(ms) {
  timerBox.textContent = `남은 시간: ${(ms / 1000).toFixed(1)}초`;
}


// =========================
// 🎛 색 버튼 클릭 (✔ sound 포함 / ✔ 중복 X)
// =========================
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    if (musicOn) sound1.play();

    if (btn.dataset.color === displayColor) {
      // 정답
      score++;
      scoreBox.textContent = `점수: ${score}`;
      if (timeLimit > 600) timeLimit -= 100;
      startRound();
    } else {
      endGame();
    }
  });
});


// =========================
// 🛑 게임 종료
// =========================
function endGame() {
  clearTimeout(timer);
  clearInterval(timerInterval);

  if (musicOn) sound2.play();   // 종료 효과음

  finalScoreText.textContent = `${score}점`;

  hasSavedScore = false;
  saveScoreBtn.disabled = false;

  modal.classList.remove("hidden");
  modal.classList.add("show");
}


// =========================
// 💾 랭킹 저장 (한 게임당 1번만)
// =========================
saveScoreBtn.addEventListener("click", async () => {
  if (hasSavedScore) {
    alert("이미 등록된 점수입니다.");
    return;
  }

  const nick = nicknameInput.value.trim() || "익명";
  nicknameInput.value = "";

  try {
    const rankingRef = ref(db, "ranking");
    await set(push(rankingRef), {
      name: nick,
      score: score,
      time: Date.now()
    });

    hasSavedScore = true;
    saveScoreBtn.disabled = true;

    loadRanking();
  } catch (err) {
    alert("점수 저장 오류 발생");
  }
});


// =========================
// 🔁 다시하기
// =========================
retryBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  modal.classList.add("hidden");

  resetGame();
  startRound();
});


// =========================
// ⏮ 메인으로
// =========================
goMainBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  modal.classList.add("hidden");

  resetGame();

  gameScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  helpBtn.style.display = "block";
});


// =========================
// ♻ 리셋
// =========================
function resetGame() {
  score = 0;
  timeLimit = 2000;

  scoreBox.textContent = "점수: 0";
  timerBox.textContent = "남은 시간: 0초";

  clearTimeout(timer);
  clearInterval(timerInterval);

  hasSavedScore = false;
  saveScoreBtn.disabled = false;
}


// =========================
// 🏆 랭킹 불러오기
// =========================
async function loadRanking() {
  try {
    const rankingRef = ref(db, "ranking");
    const snapshot   = await get(rankingRef);

    rankingList.innerHTML = "";

    if (!snapshot.exists()) {
      rankingList.innerHTML = "<li>아직 등록된 랭킹이 없습니다.</li>";
      return;
    }

    const entries = Object.values(snapshot.val());

    entries
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .forEach((item, i) => {
        const li = document.createElement("li");
        li.textContent = `${i + 1}등 - ${item.name} : ${item.score}점`;
        rankingList.appendChild(li);
      });
  } catch (err) {
    rankingList.innerHTML = "<li>랭킹 로드 오류</li>";
  }
}


// =========================
// 🔊 초기 설정
// =========================
syncMusicIcon();
applyMusicState(false);
