/*************************
 * GLOBAL QUIZ STATE
 *************************/
const QuizState = {
  allQuestions: [],
  allCategories: [],
  questions: [],
  currentIndex: 0,
  userAnswers: {}, // { questionId: [1,2] }
  results: {}, // { questionId: true/false }
  quizType: null, // "practice" | "category"
};

/*************************
 * UTILS
 *************************/
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function areAnswersCorrect(user, correct) {
  if (!user || user.length === 0) return false;

  const u = [...user].sort((a, b) => a - b);
  const c = [...correct].sort((a, b) => a - b);

  return JSON.stringify(u) === JSON.stringify(c);
}

async function loadJSON(path) {
  const res = await fetch(path);
  return await res.json();
}

/*************************
 * INITIAL LOAD
 *************************/
async function initApp() {
  QuizState.allQuestions = await loadJSON("questions.json");
  QuizState.allCategories = await loadJSON("categories.json");
}

/*************************
 * QUIZ STARTERS
 *************************/
function resetQuiz() {
  QuizState.currentIndex = 0;
  QuizState.userAnswers = {};
  QuizState.results = {};
}

function startPracticeQuiz() {
  QuizState.quizType = "practice";
  QuizState.questions = shuffle([...QuizState.allQuestions]).slice(0, 40);
  resetQuiz();
  goToQuizPage();
}

function startCategoryQuiz(questionsSubset) {
  QuizState.quizType = "category";
  QuizState.questions = questionsSubset;
  resetQuiz();
  goToQuizPage();
}

/*************************
 * ANSWERS
 *************************/
function selectAnswer(answerNumber) {
  const q = getCurrentQuestion();
  const qId = q.id;

  if (!QuizState.userAnswers[qId]) {
    QuizState.userAnswers[qId] = [];
  }

  const answers = QuizState.userAnswers[qId];
  const btn = document.querySelector(`button[data-answer="${answerNumber}"]`);

  // TOGGLE OFF
  if (answers.includes(answerNumber)) {
    QuizState.userAnswers[qId] = answers.filter((a) => a !== answerNumber);
  }
  // TOGGLE ON
  else if (answers.length < 4) {
    answers.push(answerNumber);
  }

  evaluateCurrentQuestion();
  updateAnswerSlotsUI();
  updateAnswerButtonsUI(); // 🔑 force sync
}

function updateAnswerButtonsUI() {
  const qId = getCurrentQuestion().id;
  const answers = QuizState.userAnswers[qId] || [];

  document.querySelectorAll("button[data-answer]").forEach((btn) => {
    const num = Number(btn.dataset.answer);

    if (answers.includes(num)) {
      btn.classList.remove("btn-outline-primary");
      btn.classList.add("btn-danger");
    } else {
      btn.classList.remove("btn-danger");
      btn.classList.add("btn-outline-primary");
    }
  });
}

function clearAnswers() {
  const qId = getCurrentQuestion().id;

  QuizState.userAnswers[qId] = [];
  QuizState.results[qId] = false;

  updateAnswerSlotsUI();
  updateAnswerButtonsUI(); // 🔑 THIS FIXES IT
}

/*************************
 * EVALUATION
 *************************/
function evaluateCurrentQuestion() {
  const q = getCurrentQuestion();
  const user = QuizState.userAnswers[q.id] || [];
  QuizState.results[q.id] = areAnswersCorrect(user, q.correctAnswers);
}

/*************************
 * NAVIGATION
 *************************/
function getCurrentQuestion() {
  return QuizState.questions[QuizState.currentIndex];
}

function nextQuestion() {
  evaluateCurrentQuestion();

  if (QuizState.currentIndex < QuizState.questions.length - 1) {
    QuizState.currentIndex++;
    renderQuestion();
  } else {
    endQuiz();
  }
}

function autoNextQuestion() {
  evaluateCurrentQuestion();
  nextQuestion();
}

function prevQuestion() {
  if (QuizState.currentIndex > 0) {
    QuizState.currentIndex--;
    renderQuestion();
  }
}

/*************************
 * QUIZ END
 *************************/
function endQuiz() {
  // Save quiz results in sessionStorage
  sessionStorage.setItem("quizResults", JSON.stringify(getResultsSummary()));

  // Redirect to results page
  window.location.href = "results.html";
}

function exitQuiz() {
  // Save current answers for partial results
  sessionStorage.setItem("quizResults", JSON.stringify(getResultsSummary()));

  window.location.href = "results.html";
}

/*************************
 * RESULTS DATA
 *************************/
function getResultsSummary() {
  return QuizState.questions.map((q) => {
    const user = QuizState.userAnswers[q.id] || [];
    const correct = q.correctAnswers;

    return {
      questionId: q.id,
      image: q.image,
      correctAnswers: correct,
      userAnswers: user,
      isCorrect: QuizState.results[q.id] === true,
    };
  });
}

/*************************
 * PAGE NAVIGATION (SIMPLE)
 *************************/
function goToQuizPage() {
  sessionStorage.setItem(
    "currentQuiz",
    JSON.stringify({
      questions: QuizState.questions,
      quizType: QuizState.quizType,
    })
  );

  window.location.href = "quiz.html";
}

function goToResultsPage() {
  window.location.href = "results.html";
}

function exitToIndex() {
  window.location.href = "index.html";
}

/*************************
 * UI HOOKS (TO IMPLEMENT)
 * These are called by JS
 * but implemented in HTML
 *************************/
function renderQuestion() {
  // show image
  // update question number
  // load previous answers if exist
}

function updateAnswerSlotsUI() {
  const qId = getCurrentQuestion().id;
  const answers = QuizState.userAnswers[qId] || [];

  const slots = document.querySelectorAll(".answer-slot");

  slots.forEach((slot) => {
    const value = Number(slot.dataset.value);

    if (answers.includes(value)) {
      slot.textContent = value;
      slot.classList.add("filled");
    } else {
      slot.textContent = "";
      slot.classList.remove("filled");
    }
  });
}
