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
const db = getDatabase(app);


// =========================
// 🎮 DOM 요소 선택
// =========================
const mainScreen = document.getElementById("main-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("start-btn");
const helpBtn = document.getElementById("help-btn");

const wordBox = document.getElementById("word-box");
const timerBox = document.getElementById("timer");
const scoreBox = document.getElementById("score");
const rankingList = document.getElementById("ranking-list");

const modal = document.getElementById("nickname-modal");
const nicknameInput = document.getElementById("nickname-input");
const finalScoreText = document.getElementById("final-score");

const saveScoreBtn = document.getElementById("save-score-btn");
const retryBtn = document.getElementById("retry-btn");
const goMainBtn = document.getElementById("go-main-btn");

const adImg = document.getElementById("ad-img");

const bgm = document.getElementById("bgm");
const musicToggle = document.getElementById("music-toggle");


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
  syncMusicIcon();
}

musicToggle.addEventListener("click", () => {
  musicOn = !musicOn;
  applyMusicState(true);
});


// =========================
// 📺 광고 슬라이드
// =========================
const adList = ["ad1.jpg", "ad2.jpg", "ad3.jpg"];
let adIndex = 0;

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

let currentColor = "";
let displayColor = "";
let score = 0;
let timeLimit = 2000;
let timer = null;
let timerInterval = null;

// 🔥 이번 게임 결과가 이미 랭킹에 등록되었는지 여부
let hasSavedScore = false;


// =========================
// ▶ 게임 시작
// =========================
startBtn.addEventListener("click", () => {
  // 혹시 이전 게임 팝업이 남아 있으면 숨기기
  modal.classList.add("hidden");
  modal.classList.remove("show");

  mainScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  resetGame();
  loadRanking();
  startRound();

  if (musicOn) applyMusicState(true);
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
// 🎛 색 버튼 클릭
// =========================
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.color === displayColor) {
      score++;
      scoreBox.textContent = `점수: ${score}`;

      if (timeLimit > 600) {
        timeLimit -= 100;
      }
      startRound();
    } else {
      endGame();
    }
  });
});


// =========================
// 🛑 게임 종료 → 팝업
// =========================
function endGame() {
  clearTimeout(timer);
  clearInterval(timerInterval);

  finalScoreText.textContent = `${score}점`;

  // 이번 게임은 아직 등록 X 상태로 시작
  hasSavedScore = false;
  saveScoreBtn.disabled = false;

  modal.classList.remove("hidden");
  modal.classList.add("show");
}


// =========================
// 💾 Firebase 저장 (한 게임당 1번만)
// =========================
saveScoreBtn.addEventListener("click", async () => {
  if (hasSavedScore) {
    alert("이 점수는 이미 등록했습니다. 새 게임을 시작해 주세요.");
    return;
  }

  const nick = nicknameInput.value.trim() || "익명";
  nicknameInput.value = "";

  try {
    const rankingRef = ref(db, "ranking");
    const newEntry = push(rankingRef);

    await set(newEntry, {
      name: nick,
      score: score,
      time: Date.now()
    });

    hasSavedScore = true;        // ✅ 이번 게임은 더 이상 등록 불가
    saveScoreBtn.disabled = true; // 버튼도 비활성화
    loadRanking();               // 랭킹 갱신

  } catch (err) {
    console.error("점수 저장 오류:", err);
    alert("점수 저장 중 오류가 발생했습니다.");
  }
});


// =========================
// 🔁 다시하기
// =========================
retryBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("show");

  resetGame();
  startRound();
});

// =========================
// ⏮ 메인 화면으로
// =========================
goMainBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("show");

  resetGame();

  gameScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");
});


// =========================
// ♻ 리셋
// =========================
function resetGame() {
  score = 0;
  timeLimit = 2000;
  scoreBox.textContent = "점수: 0";
  timerBox.textContent = "남은 시간: 0초";

  hasSavedScore = false;
  saveScoreBtn.disabled = false;
}


// =========================
// 🏆 랭킹 불러오기
// =========================
async function loadRanking() {
  try {
    const rankingRef = ref(db, "ranking");
    const snapshot = await get(rankingRef);

    rankingList.innerHTML = "";

    if (!snapshot.exists()) {
      const li = document.createElement("li");
      li.textContent = "아직 등록된 랭킹이 없습니다.";
      rankingList.appendChild(li);
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
    console.error("랭킹 로드 오류:", err);
    rankingList.innerHTML = "<li>랭킹 로드 중 오류가 발생했습니다.</li>";
  }
}


// =========================
// 🔊 초기 아이콘 세팅
// =========================
syncMusicIcon();

// ▶ 게임 시작 시 도움말 버튼 숨김
startBtn.addEventListener("click", () => {
  helpBtn.style.display = "none";
});

// ⏮ 메인 화면 복귀 시 다시 보이기
goMainBtn.addEventListener("click", () => {
  helpBtn.style.display = "block";
});


