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
  timer: null,
  timeLeft: 30,
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
  startTimer();
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
 * TIMER
 *************************/
function startTimer() {
  clearInterval(QuizState.timer);
  QuizState.timeLeft = 30;

  QuizState.timer = setInterval(() => {
    QuizState.timeLeft--;

    // UI hook
    updateTimerUI(QuizState.timeLeft);

    if (QuizState.timeLeft <= 0) {
      clearInterval(QuizState.timer);
      autoNextQuestion();
    }
  }, 1000);
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

  // Allow duplicates? NO
  if (
    !QuizState.userAnswers[qId].includes(answerNumber) &&
    QuizState.userAnswers[qId].length < 4
  ) {
    // PUSH only (left → right)
    QuizState.userAnswers[qId].push(answerNumber);
  }

  evaluateCurrentQuestion();
  updateAnswerSlotsUI();
}

function clearAnswers() {
  const qId = getCurrentQuestion().id;
  QuizState.userAnswers[qId] = [];
  QuizState.results[qId] = false;
  updateAnswerSlotsUI();
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
    startTimer();
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
    startTimer();
    renderQuestion();
  }
}

/*************************
 * QUIZ END
 *************************/
function endQuiz() {
  clearInterval(QuizState.timer);

  // Save quiz results in sessionStorage
  sessionStorage.setItem("quizResults", JSON.stringify(getResultsSummary()));

  // Redirect to results page
  window.location.href = "results.html";
}

function exitQuiz() {
  clearInterval(QuizState.timer);

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

function updateTimerUI(seconds) {
  // update timer text
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
