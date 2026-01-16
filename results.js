/*************************
 * LOAD RESULTS
 *************************/
const resultsData = JSON.parse(sessionStorage.getItem("quizResults"));

if (!resultsData || !Array.isArray(resultsData)) {
  window.location.href = "index.html";
}

/*************************
 * STATE
 *************************/
let currentResultIndex = 0;

/*************************
 * INIT
 *************************/
document.addEventListener("DOMContentLoaded", () => {
  renderScore();
  renderResultsButtons();
  showResult(currentResultIndex);
});

/*************************
 * SCORE
 *************************/
function renderScore() {
  const total = resultsData.length;
  const correct = resultsData.filter((r) => r.isCorrect).length;
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.textContent = `النتيجة: ${correct} / ${total}`;
}

/*************************
 * QUESTION BUTTONS (RIGHT PANEL)
 *************************/
function renderResultsButtons() {
  const container = document.getElementById("results-list");
  if (!container) return;

  container.innerHTML = ""; // clear previous buttons

  resultsData.forEach((r, idx) => {
    // Wrapper for each button
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "center";
    wrapper.style.alignItems = "center";
    wrapper.style.height = "50px"; // fixed height, prevents stretching
    wrapper.style.width = "100%"; // full width of the grid cell

    // Question button
    const btn = document.createElement("button");
    btn.className = "btn btn-sm text-white";
    btn.style.width = "40px";
    btn.style.height = "40px";
    btn.style.padding = "0";
    btn.style.fontSize = "0.9rem";
    btn.textContent = idx + 1;
    btn.style.backgroundColor = r.isCorrect ? "#2ecc71" : "#e74c3c";

    // Click to show image + answers
    btn.addEventListener("click", () => {
      currentResultIndex = idx;
      showResult(idx);
      highlightCurrentButton(idx);
    });

    wrapper.appendChild(btn);
    container.appendChild(wrapper);
  });

  highlightCurrentButton(0); // highlight first button by default
}

/*************************
 * HIGHLIGHT CURRENT BUTTON
 *************************/
function highlightCurrentButton(idx) {
  const allButtons = document.querySelectorAll("#results-list button");
  allButtons.forEach((btn, i) => {
    btn.style.border = i === idx ? "2px solid #000" : "none";
  });
}

/*************************
 * SHOW IMAGE + ANSWERS
 *************************/
function showResult(idx) {
  const r = resultsData[idx];

  // IMAGE
  const img = document.getElementById("result-image");
  if (img) img.src = r.image;

  // ANSWERS PANEL
  const answersBox = document.getElementById("answers-box");
  if (!answersBox) return;

  answersBox.innerHTML = "";

  const userAnswers = r.userAnswers || [];
  const correctAnswers = r.correctAnswers || [];

  // Wrong answers crossed in red
  userAnswers.forEach((ans) => {
    if (!correctAnswers.includes(ans)) {
      const span = document.createElement("span");
      span.className = "badge bg-danger text-white";
      span.style.textDecoration = "line-through";
      span.textContent = ans;
      answersBox.appendChild(span);
    }
  });

  // Correct answers in green
  correctAnswers.forEach((ans) => {
    const span = document.createElement("span");
    span.className = "badge bg-success text-white";
    span.textContent = ans;
    answersBox.appendChild(span);
  });
}

/*************************
 * EXIT BUTTON
 *************************/
function exitResults() {
  sessionStorage.removeItem("quizResults");
  sessionStorage.removeItem("currentQuiz");
  window.location.href = "index.html";
}
