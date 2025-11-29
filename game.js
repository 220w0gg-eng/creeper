const wordBox = document.getElementById("word-box");
const timerBox = document.getElementById("timer");
const scoreBox = document.getElementById("score");
const rankingList = document.getElementById("ranking-list");
const modal = document.getElementById("nickname-modal");
const nicknameInput = document.getElementById("nickname-input");
const saveScoreBtn = document.getElementById("save-score-btn");
const cancelBtn = document.getElementById("cancel-btn");

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
let timeLimit = 2000; // 최초 제한시간 2초
let timer;

// 게임 시작
startRound();
loadRanking();

function startRound() {
  clearTimeout(timer);

  // 문자(내용) + 글씨색 랜덤 생성
  currentColor = colors[Math.floor(Math.random() * colors.length)];
  displayColor = colors[Math.floor(Math.random() * colors.length)];

  wordBox.textContent = colorNames[currentColor];
  wordBox.style.color = displayColor;

  timerBox.textContent = `남은 시간: ${(timeLimit / 1000).toFixed(1)}초`;

  // 제한시간 카운트
  timer = setTimeout(() => {
    endGame();
  }, timeLimit);
}

// 버튼 클릭 이벤트
document.querySelectorAll(".color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.dataset.color;

    // 글씨색(displayColor)을 기준으로 눌러야 정답
    if (answer === displayColor) {
      score += 1;
      scoreBox.textContent = `점수: ${score}`;

      // 난이도 점점 상승 (제한시간 0.1초씩 감소)
      if (timeLimit > 600) {
        timeLimit -= 100;
      }

      startRound();
    } else {
      endGame();
    }
  });
});

// 게임 종료 → 랭킹 등록 팝업
function endGame() {
  clearTimeout(timer);
  modal.classList.remove("hidden");
}

// 랭킹 저장
saveScoreBtn.addEventListener("click", () => {
  const nickname = nicknameInput.value || "익명";

  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push({ name: nickname, score: score });

  // 점수 높은 순 정렬 + 10위까지만 유지
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 10);

  localStorage.setItem("ranking", JSON.stringify(ranking));

  modal.classList.add("hidden");
  nicknameInput.value = "";
  score = 0;
  timeLimit = 2000;
  scoreBox.textContent = "점수: 0";

  loadRanking();
  startRound();
});

// 랭킹 불러오기
function loadRanking() {
  rankingList.innerHTML = "";
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}등 - ${item.name} : ${item.score}점`;
    rankingList.appendChild(li);
  });
}

// 취소 시 게임 재시작
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  score = 0;
  timeLimit = 2000;
  scoreBox.textContent = "점수: 0";
  startRound();
});
