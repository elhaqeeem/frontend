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
  const [timer, setTimer] = useState(300); // Default to 5 minutes if no data is fetched
  const [submitted, setSubmitted] = useState(false);
  const [userTestId, setUserTestId] = useState(null);
  const [hasPreviousAnswers, setHasPreviousAnswers] = useState(false);
  const [isTimeValid, setIsTimeValid] = useState(false);

  // Fetch test details including timer duration
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get('/kraeplin-tests');
        const testData = response.data.find(test => test.id === 7);

        if (testData && testData.duration_minutes) {
          setTimer(testData.duration_minutes * 60);
        } else {
          toast.error("Failed to load test duration.");
        }
      } catch (error) {
        toast.error('Failed to fetch test data.');
        console.error('Error fetching test data:', error);
      }
    };

    fetchTestDetails();
  }, []);

  // Fetch user test details, including start_time and end_time
  useEffect(() => {
    const fetchUserTestId = async () => {
      try {
        const response = await axios.get('/user-tests');
        if (response.data?.length) {
          const userTest = response.data[0];
          setUserTestId(userTest.id);

          const currentTime = new Date();
          const startTime = new Date(userTest.start_time);
          const endTime = new Date(userTest.end_time);

          if (currentTime >= startTime && currentTime <= endTime) {
            setIsTimeValid(true);
          } else {
            toast.error('The test is not available at this time.');
          }
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

  // Fetch questions and check for previous answers
  useEffect(() => {
    if (userTestId && isTimeValid) {
      const fetchQuestions = async () => {
        try {
          const [questionsResponse, submittedResponse] = await Promise.all([
            axios.get('/questions'),
            axios.get(`/test-answers/${userTestId}`)
          ]);

          if (Array.isArray(questionsResponse.data)) {
            setQuestions(questionsResponse.data);
          } else {
            toast.error('Received unexpected response format for questions.');
          }

          if (submittedResponse.data?.length) {
            setHasPreviousAnswers(true);
            setSubmitted(true);
            toast.info('You have already submitted this quiz.');
          }
        } catch (error) {
          toast.error('Failed to fetch questions or check previous answers.');
          console.error('Error fetching data:', error);
        }
      };

      fetchQuestions();
    }
  }, [userTestId, isTimeValid]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0 && !submitted && !hasPreviousAnswers) {
      const intervalId = setInterval(() => setTimer(prevTime => prevTime - 1), 1000);
      return () => clearInterval(intervalId);
    } else if (timer === 0 && !submitted && !hasPreviousAnswers) {
      handleSubmit(); // Auto-submit when the timer runs out
    }
    // eslint-disable-next-line
  }, [timer, submitted, hasPreviousAnswers]);

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!userTestId) {
      toast.error("User test ID is missing.");
      return;
    }

    setSubmitted(true);

    const testAnswers = questions.map((question) => {
      const selectedAnswerIndex = answers[question.id];
      const selectedAnswer = question.answer_options[selectedAnswerIndex];
      const isCorrect = selectedAnswer === question.correct_answer;

      return {
        user_test_id: userTestId,
        question_id: question.id,
        answer: selectedAnswer || null, // Use null for unanswered questions
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      };
    }).filter(answer => answer.answer); // Only include answered questions

    try {
      await axios.post("/test-answers", { answers: testAnswers });
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("There was an error submitting your quiz.");
    }
  }, [answers, questions, userTestId]);

  return (
    <div className="container mx-auto p-4 bg-base-200 text-base-content">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Pretest</h2>

      {/* Timer component */}
      <TimerComponent timer={timer} />

      {isTimeValid && !hasPreviousAnswers && !submitted && questions.length > 0 ? (
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
