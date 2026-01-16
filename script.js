const QUESTION_TIME = 5; // change to 30 later

let questions = [];
let current = 0;
let timer = QUESTION_TIME;
let interval = null;

let selected = [];
let userAnswers = [];

// ELEMENTS
const image = document.getElementById("questionImage");
const slots = document.querySelectorAll(".slot");
const numberBtns = document.querySelectorAll(".number");

const removeBtn = document.getElementById("removeBtn");
const validateBtn = document.getElementById("validateBtn");

const timerEl = document.getElementById("timer");
const counterEl = document.getElementById("questionCounter");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const exitBtn = document.getElementById("exitBtn");

// LOAD QUESTIONS
fetch("data.json")
  .then(res => res.json())
  .then(json => {
    questions = json.questions;
    loadQuestion();
  });

// LOAD QUESTION
function loadQuestion() {
  clearSelection();
  image.src = questions[current].image;
  counterEl.textContent = `سؤال ${current + 1} / ${questions.length}`;
  startTimer();
}

// TIMER
function startTimer() {
  clearInterval(interval);
  timer = QUESTION_TIME;
  timerEl.textContent = timer;

  interval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;

    if (timer === 0) {
      clearInterval(interval);
      saveAnswer(false);
      goNext();
    }
  }, 1000);
}

// NUMBER BUTTONS
numberBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const value = Number(btn.textContent);
    if (selected.length >= 4 || selected.includes(value)) return;

    selected.push(value);
    btn.style.background = "#b91c1c";
    updateSlots();
  });
});

// UPDATE SLOTS
function updateSlots() {
  slots.forEach((slot, i) => {
    slot.textContent = selected[i] || "";
  });
}

// REMOVE
removeBtn.onclick = () => {
  clearSelection();
};

// CLEAR
function clearSelection() {
  selected = [];
  slots.forEach(s => s.textContent = "");
  numberBtns.forEach(b => b.style.background = "");
}

// VALIDATE
validateBtn.onclick = () => {
  clearInterval(interval);

  const correct = arraysEqual(
    selected,
    questions[current].answers
  );

  saveAnswer(correct);
  goNext();
};

// SAVE
function saveAnswer(correct) {
  userAnswers[current] = {
    answers: [...selected],
    correct
  };
}

// NEXT
function goNext() {
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    alert(`النتيجة: ${
      userAnswers.filter(a => a && a.correct).length
    } / ${questions.length}`);
  }
}

// PREVIOUS
prevBtn.onclick = () => {
  if (current === 0) return;
  clearInterval(interval);
  userAnswers[current] = null;
  current--;
  loadQuestion();
};

// NEXT (FOOTER)
nextBtn.onclick = () => {
  clearInterval(interval);
  current++;
  if (current < questions.length) loadQuestion();
};

// EXIT
exitBtn.onclick = () => {
  location.reload();
};

// HELPERS
function arraysEqual(a, b) {
  return a.length === b.length &&
    a.every(v => b.includes(v));
}
