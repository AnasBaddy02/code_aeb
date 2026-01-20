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
  categoryName: null, // string shown in footer
};

/*************************
 * UTILS
 *************************/
const shuffle = (array) => array.sort(() => Math.random() - 0.5);

const areAnswersCorrect = (user, correct) => {
  if (!user || user.length === 0) return false;
  const u = [...user].sort((a, b) => a - b);
  const c = [...correct].sort((a, b) => a - b);
  return JSON.stringify(u) === JSON.stringify(c);
};

const loadJSON = async (path) => (await fetch(path)).json();

/*************************
 * AUDIO PLAYBACK
 *************************/
function playQuestionNumber() {
  const questionNumber = QuizState.currentIndex + 1;
  const audioPath = `audios/numbers/q${questionNumber}.wav`;
  
  const audio = new Audio(audioPath);
  audio.play().catch(err => {
    console.error("Failed to play audio:", err);
  });
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
  QuizState.categoryName = "تلقائي";

  // 🔑 Remove duplicates by question ID
  const uniqueQuestions = Array.from(
    new Map(QuizState.allQuestions.map((q) => [q.id, q])).values()
  );

  // Shuffle and take max 40
  QuizState.questions = shuffle(uniqueQuestions).slice(0, 40);

  resetQuiz();
  goToQuizPage();
}

function startCategoryQuiz(questionsSubset, categoryName) {
  QuizState.quizType = "category";
  QuizState.categoryName = categoryName;
  QuizState.questions = questionsSubset;
  resetQuiz();
  goToQuizPage();
}

/*************************
 * ANSWERS
 *************************/
function selectAnswer(answerNumber) {
  const qId = getCurrentQuestion().id;
  QuizState.userAnswers[qId] ||= [];

  const answers = QuizState.userAnswers[qId];

  // Toggle selection
  if (answers.includes(answerNumber)) {
    QuizState.userAnswers[qId] = answers.filter((a) => a !== answerNumber);
  } else if (answers.length < 4) {
    answers.push(answerNumber);
  }

  evaluateCurrentQuestion();
  updateAnswerSlotsUI();
  updateAnswerButtonsUI();
}

function updateAnswerButtonsUI() {
  const qId = getCurrentQuestion().id;
  const answers = QuizState.userAnswers[qId] || [];

  document.querySelectorAll("button[data-answer]").forEach((btn) => {
    const num = Number(btn.dataset.answer);
    btn.classList.toggle("btn-info", answers.includes(num));
    btn.classList.toggle("btn-outline-primary", !answers.includes(num));
  });
}

function clearAnswers() {
  const qId = getCurrentQuestion().id;
  QuizState.userAnswers[qId] = [];
  QuizState.results[qId] = false;
  updateAnswerSlotsUI();
  updateAnswerButtonsUI();
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
  sessionStorage.setItem("quizResults", JSON.stringify(getResultsSummary()));
  window.location.href = "results.html";
}

function exitQuiz() {
  sessionStorage.setItem("quizResults", JSON.stringify(getResultsSummary()));
  window.location.href = "results.html";
}

/*************************
 * RESULTS DATA
 *************************/
function getResultsSummary() {
  return QuizState.questions.map((q) => ({
    questionId: q.id,
    image: q.image,
    correctAnswers: q.correctAnswers,
    userAnswers: QuizState.userAnswers[q.id] || [],
    isCorrect: QuizState.results[q.id] === true,
  }));
}

/*************************
 * PAGE NAVIGATION
 *************************/
function goToQuizPage() {
  sessionStorage.setItem(
    "currentQuiz",
    JSON.stringify({
      questions: QuizState.questions,
      quizType: QuizState.quizType,
      categoryName: QuizState.categoryName,
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
 * UI HOOKS
 *************************/
function renderQuestion() {
  const q = getCurrentQuestion();
  document.getElementById("question-image").src = q.image;
  document.getElementById("question-number").textContent = `${
    QuizState.currentIndex + 1
  } / ${QuizState.questions.length}`;
  updateAnswerSlotsUI();
  updateAnswerButtonsUI();
  playQuestionNumber();
}

function updateAnswerSlotsUI() {
  const qId = getCurrentQuestion().id;
  const answers = QuizState.userAnswers[qId] || [];
  document.querySelectorAll(".answer-slot").forEach((slot) => {
    const value = Number(slot.dataset.value);
    slot.textContent = answers.includes(value) ? value : "";
    slot.classList.toggle("filled", answers.includes(value));
  });
}
