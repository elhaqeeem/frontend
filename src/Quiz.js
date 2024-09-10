import React, { useState, useEffect, useCallback } from 'react';
import axios from './axiosInstance'; // Ensure the path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStopwatch } from 'react-icons/fa'; // Import icon

const TimerComponent = ({ timer }) => (
  <div className="flex justify-center mb-4">
    <span className="badge badge-warning">
      <FaStopwatch className="mr-2" />
      Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
    </span>
  </div>
);

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(300); // 5 minutes countdown
  const [submitted, setSubmitted] = useState(false);
  const [userTestId, setUserTestId] = useState(null);
  const [hasPreviousAnswers, setHasPreviousAnswers] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!userTestId) {
      toast.error("User test ID is missing.");
      return;
    }

    setSubmitted(true);

    const testAnswers = Object.keys(answers).map((questionId) => {
      const question = questions.find((q) => q.id === parseInt(questionId));
      const selectedAnswerIndex = answers[questionId];
      const selectedAnswer = question.answer_options[selectedAnswerIndex];
      const isCorrect = question ? question.correct_answer === selectedAnswer : false;

      return {
        user_test_id: userTestId,
        question_id: parseInt(questionId),
        answer: selectedAnswer,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      };
    });

    try {
      await axios.post("/test-answers", { answers: testAnswers });
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("There was an error submitting your quiz.");
    }
  }, [answers, questions, userTestId]);

  useEffect(() => {
    const fetchUserTestId = async () => {
      try {
        const response = await axios.get('/user-tests');
        if (response.data && response.data.length > 0) {
          setUserTestId(response.data[0].id);
        } else {
          toast.error('No user test ID found.');
        }
      } catch (error) {
        toast.error('Failed to fetch user test ID.');
        console.error('Error fetching user test ID:', error);
      }
    };

    fetchUserTestId();
  }, []);

  useEffect(() => {
    if (userTestId) {
      const fetchQuestions = async () => {
        try {
          const response = await axios.get('/questions');
          if (Array.isArray(response.data)) {
            setQuestions(response.data);
          } else {
            toast.error('Received unexpected response format.');
            console.error('Expected an array but received:', response.data);
          }
        } catch (error) {
          toast.error('Failed to fetch questions.');
          console.error('Error fetching questions:', error);
        }
      };

      const checkIfSubmitted = async () => {
        try {
          const response = await axios.get(`/test-answers/${userTestId}`);
          if (response.data && response.data.length > 0) {
            setHasPreviousAnswers(true);
            setSubmitted(true);
            toast.info('You have already submitted this quiz.');
          }
        } catch (error) {
          console.error('Error checking previous answers:', error);
        }
      };

      fetchQuestions();
      checkIfSubmitted();
    }
  }, [userTestId]);

  useEffect(() => {
    if (timer > 0 && !submitted && !hasPreviousAnswers) {
      const intervalId = setInterval(() => setTimer(prevTime => prevTime - 1), 1000);
      return () => clearInterval(intervalId);
    } else if (timer === 0 && !submitted && !hasPreviousAnswers) {
      handleSubmit();
    }
  }, [timer, submitted, hasPreviousAnswers, handleSubmit]);

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answerIndex,
    }));
  };

  return (
    <div className="container mx-auto p-4 bg-base-200 text-base-content">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Pretest</h2>
      <TimerComponent timer={timer} />

      {/* Conditional rendering of quiz form */}
      {!hasPreviousAnswers && !submitted && questions.length > 0 ? (
        <>
          {questions.map((question) => (
            <div key={question.id} className="question-block mb-4 p-4 border border-base-300 rounded-lg bg-base-100 shadow-md">
              <h2 className="text-sm font-semibold">{question.question_text}</h2>
              <div className="flex flex-wrap space-x-4 mt-5">
                {question.answer_options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerChange(question.id, index)}
                    className={`btn mr-2 mb-2 ${answers[question.id] === index ? 'btn-warning' : 'btn btn-outline'}`}
                    disabled={submitted}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          {!submitted && (
            <button onClick={handleSubmit} className="btn btn-primary">
              Submit
            </button>
          )}
        </>
      ) : (
        <p className="mt-4 text-lg">No questions available or quiz has already been submitted.</p>
      )}

      {(submitted || hasPreviousAnswers) && (
        <p className="mt-4 text-lg">Quiz has been submitted! Thank you for participating.</p>
      )}
    </div>
  );
};

export default Quiz;
