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
  
  // Display category name
  const categoryName = sessionStorage.getItem("quizCategory") || "تلقائي";
  const categoryEl = document.getElementById("category-name");
  if (categoryEl) {
    categoryEl.textContent = categoryName;
  }
});

/*************************
 * SCORE
 *************************/
function renderScore() {
  const total = resultsData.length;
  const correct = resultsData.filter((r) => r.isCorrect).length;
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.textContent = `النتيجة: ${total} / ${correct}`;
}

/*************************
 * QUESTION BUTTONS (RIGHT PANEL)
 *************************/
function renderResultsButtons() {
  const container = document.getElementById("results-list");
  if (!container) return;

  container.innerHTML = ""; // clear previous buttons

  resultsData.forEach((r, idx) => {
    // Wrapper div for each question block
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";
    wrapper.style.border = "1px solid #ccc";
    wrapper.style.borderRadius = "6px";
    // wrapper.style.padding = "4px";
    wrapper.style.boxSizing = "border-box";

    // Question number button with background based on correctness
    const numberBtn = document.createElement("button");
    numberBtn.textContent = idx + 1;
    numberBtn.style.width = "40px";
    numberBtn.style.height = "40px";
    numberBtn.style.border = "none";
    numberBtn.style.borderRadius = "4px";
    numberBtn.style.fontSize = "1rem";
    numberBtn.style.cursor = "pointer";
    numberBtn.style.color = "#fff";
    numberBtn.style.backgroundColor = r.isCorrect ? "#2ecc71" : "#e74c3c";

    numberBtn.addEventListener("click", () => {
      currentResultIndex = idx;
      showResult(idx);
      highlightCurrentButton(idx);
    });

    // Correct answers under the number (plain, no background)
    const answersDiv = document.createElement("div");
    answersDiv.style.display = "flex";
    answersDiv.style.gap = "4px";
    answersDiv.style.marginTop = "2px";

    r.correctAnswers.forEach((ans) => {
      const span = document.createElement("span");
      span.textContent = ans;
      span.style.fontSize = "0.9rem";
      span.style.fontWeight = "bold";
      // span.style.color = "#000"; // plain black
      answersDiv.appendChild(span);
    });

    // Combine number + correct answers
    wrapper.appendChild(numberBtn);
    wrapper.appendChild(answersDiv);

    container.appendChild(wrapper);
  });

  highlightCurrentButton(currentResultIndex);
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
