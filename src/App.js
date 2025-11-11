import React, { useState, useEffect } from "react";
import "./App.css";
import LogoScreen from "./components/LogoScreen";
import Navigation from "./components/Navigation";
import ChatInterface from "./components/ChatInterface";
import ResultsScreen from "./components/ResultsScreen";
import AIClassifier from "./aiClassifier";
import quizData from "./quizData";

function App() {
  const [showLogo, setShowLogo] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("chat"); // 'chat' or 'results'
  const [currentQuestionId, setCurrentQuestionId] = useState("Q1");
  const [userAnswers, setUserAnswers] = useState({});
  const [questionHistory, setQuestionHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [aiClassifier] = useState(() => new AIClassifier());
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    // Show logo for 7 seconds
    const timer = setTimeout(() => {
      setShowLogo(false);
      // Start the quiz with the first question
      addBotMessage(quizData.Q1.question, quizData.Q1);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("=== CURRENT QUESTION ID CHANGED ===");
    console.log("New Question ID:", currentQuestionId);
    console.log("Question Data:", quizData[currentQuestionId]);
  }, [currentQuestionId]);

  const addBotMessage = (text, questionData = null) => {
    const message = {
      id: Date.now(),
      type: "bot",
      text,
      questionData,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (
    text,
    isImageChoice = false,
    selectedOption = null
  ) => {
    const message = {
      id: Date.now(),
      type: "user",
      text,
      isImageChoice,
      selectedOption,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleUserAnswer = async (
    answer,
    isImageChoice = false,
    selectedOption = null
  ) => {
    console.log("=== USER ANSWER RECEIVED ===");
    console.log("Current Question ID:", currentQuestionId);
    console.log("Answer:", answer);
    console.log("Is Image Choice:", isImageChoice);
    console.log("Selected Option:", selectedOption);

    // 1) add user message to chat
    addUserMessage(answer, isImageChoice, selectedOption);

    const currentQuestion = quizData[currentQuestionId];

    // 2) build the answer object
    const answerData = {
      question: currentQuestion.question,
      answer: isImageChoice ? selectedOption.answer : answer,
      type: isImageChoice ? "image" : "text",
      ...(isImageChoice && { selectedImage: selectedOption.description }),
    };

    // 3) build the NEXT snapshot of userAnswers right here
    const nextUserAnswers = {
      ...userAnswers,
      [currentQuestionId]: answerData,
    };

    // 4) update state from this snapshot
    setUserAnswers(nextUserAnswers);
    setQuestionHistory((prev) => [...prev, currentQuestionId]);

    // 5) decide next question using the latest answers if needed
    const nextQuestionId = await determineNextQuestion(
      currentQuestion,
      answer,
      selectedOption
    );
    console.log("Next Question ID determined:", nextQuestionId);

    if (nextQuestionId === "RESULTS") {
      console.log("Going to results screen");

      setCurrentScreen("results");

      // IMPORTANT: pass the fresh snapshot to final result logic
      const finalId = await determineFinalResult(
        currentQuestion,
        nextUserAnswers
      );
      setFinalResult({ id: finalId, data: quizData[finalId] });
    } else {
      // normal flow
      setCurrentQuestionId(nextQuestionId);
      const nextQuestion = quizData[nextQuestionId];

      // skip classification nodes
      if (nextQuestion.type === "classification" && nextQuestion.next) {
        const finalNextQuestionId = nextQuestion.next;
        setCurrentQuestionId(finalNextQuestionId);
        const finalNextQuestion = quizData[finalNextQuestionId];

        setTimeout(() => {
          addBotMessage(finalNextQuestion.question, finalNextQuestion);
        }, 1000);
      } else {
        setTimeout(() => {
          addBotMessage(nextQuestion.question, nextQuestion);
        }, 1000);
      }
    }
  };

  const determineNextQuestion = async (question, answer, selectedOption) => {
    console.log(
      "Determining next question for:",
      question.id,
      "answer:",
      answer,
      "selectedOption:",
      selectedOption
    );

    // Handle classification nodes (auto-skip)
    if (question.type === "classification" && question.next) {
      console.log("Classification node, going to:", question.next);
      return question.next;
    }

    // Handle final questions
    if (question.finals) {
      console.log("Final question reached, going to RESULTS");
      return "RESULTS";
    }

    // Handle direct next
    if (question.next) {
      console.log("Direct next:", question.next);
      return question.next;
    }

    // Handle image choices
    if (question.imageNext && selectedOption) {
      console.log("Image choice selected, going to:", selectedOption.nextPath);
      return selectedOption.nextPath;
    }

    // Handle AI classification for text inputs
    if (question.paths) {
      console.log("Starting AI classification for paths:", question.paths);

      try {
        const classification = await aiClassifier.classifyTextAnswer(
          question,
          answer,
          question.paths
        );
        console.log("AI classification result:", classification);
        return classification;
      } catch (error) {
        console.error("Classification failed:", error);
        console.log("Using fallback path:", question.paths[0]);
        return question.paths[0]; // Fallback
      }
    }

    console.log("No matching logic, fallback to Q1");
    return "Q1"; // Fallback
  };

  const determineFinalResult = async (question, answersSnapshot) => {
    try {
      const finalResult = await aiClassifier.classifyForFinalResult(
        answersSnapshot,
        question.finals
      );
      return finalResult;
    } catch (error) {
      console.error("Final result determination failed:", error);
      return question.finals[0];
    }
  };

  const handlePreviousQuestion = () => {
    if (questionHistory.length > 0) {
      const previousQuestionId = questionHistory[questionHistory.length - 1];
      setQuestionHistory((prev) => prev.slice(0, -1));
      delete userAnswers[currentQuestionId];
      setCurrentQuestionId(previousQuestionId);

      // Remove last bot and user messages
      setMessages((prev) => prev.slice(0, -2));
    }
  };

  const handleRestartQuiz = () => {
    setCurrentScreen("chat");
    setCurrentQuestionId("Q1");
    setUserAnswers({});
    setQuestionHistory([]);
    setMessages([]);
    setFinalResult(null);

    // Start fresh with first question
    setTimeout(() => {
      addBotMessage(quizData.Q1.question, quizData.Q1);
    }, 500);
  };

  if (showLogo) {
    return <LogoScreen />;
  }

  return (
    <div className="App">
      <Navigation
        onPrevious={currentScreen === "chat" ? handlePreviousQuestion : null}
        onRestart={currentScreen === "results" ? handleRestartQuiz : null}
        canGoPrevious={questionHistory.length > 0}
        isResultsScreen={currentScreen === "results"}
      />

      {currentScreen === "chat" ? (
        <ChatInterface
          messages={messages}
          currentQuestion={quizData[currentQuestionId]}
          onUserAnswer={handleUserAnswer}
        />
      ) : (
        <ResultsScreen
          finalResult={finalResult}
          userAnswers={userAnswers}
          aiClassifier={aiClassifier}
        />
      )}
    </div>
  );
}

export default App;
