import React, { useState, useEffect, useCallback } from 'react';
import axios from './axiosInstance'; // Pastikan path benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStopwatch } from 'react-icons/fa';

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
  const [timer, setTimer] = useState(300); // Default 5 minutes
  const [submitted, setSubmitted] = useState(false);
  // eslint-disable-next-line
  const [userTestId, setUserTestId] = useState(null);
  // eslint-disable-next-line
  const [hasPreviousAnswers, setHasPreviousAnswers] = useState(false);
  const [storedTestId, setStoredTestId] = useState(null);
  const [idToSubmit, setIdToSubmit] = useState(null); // New state to hold idToSubmit

  // Ambil id dari localStorage
  useEffect(() => {
    const testId = localStorage.getItem('id');
    console.log('Fetched test ID from localStorage:', testId); // Console log added
    if (testId) {
      setStoredTestId(testId);
    } else {
      toast.error('Test ID tidak ditemukan di local storage.');
    }
  }, []);

  // Cek data test answers dengan user_test_id
  
 
 // Fetch data from user-tests and questions
 
 useEffect(() => {
  if (!storedTestId) return;

  const fetchTestData = async () => {
      try {
          // Fetch user tests to get the current user's test
          const userTestResponse = await axios.get('/user-tests');
          console.log('User tests response:', userTestResponse.data); // Console log added

          // Find the user test for the current user
          const userTest = userTestResponse.data.find(test => test.user_id === parseInt(storedTestId));

          if (!userTest) {
              toast.error('User test tidak ditemukan.');
              return;
          }

          // Set idToSubmit based on the found user test's id
          const idToSubmit = userTest.id; // Get the ID to submit
          setIdToSubmit(idToSubmit); // Store it in the state

          // Fetch all questions
          const questionResponse = await axios.get('/questions');
          console.log('Questions response:', questionResponse.data); // Console log added

          // Get the kraeplin_test_id from the user test
          const kraeplinTestId = userTest.kraeplin_test_id;

          // Filter questions that match the kraeplin_test_id
          const matchingQuestions = questionResponse.data.filter(
              question => question.kraeplin_test_id === kraeplinTestId
          );

          if (matchingQuestions.length === 0) {
              toast.error('Tidak ada pertanyaan yang cocok.');
              return;
          }

          // Set the matching questions and user test ID in state
          setQuestions(matchingQuestions);
          setUserTestId(storedTestId);

          // Use idToSubmit as needed, for example:
          console.log('ID to submit:', idToSubmit); // Console log to verify the id
      } catch (error) {
          toast.error('Gagal mengambil data pertanyaan atau user test.');
          console.error('Error:', error);
      }
  };

  fetchTestData();
}, [storedTestId]);


  // Ambil data kraeplin-tests dan set timer
  useEffect(() => {
    if (!storedTestId) return;
  
    const fetchKraeplinTest = async () => {
      try {
        // Fetch user tests to get the kraeplin_test_id
        const userTestResponse = await axios.get('/user-tests');
        const userTest = userTestResponse.data.find(test => test.user_id === parseInt(storedTestId)); // Assuming storedTestId is a string
  
        if (!userTest) {
          toast.error('User test tidak ditemukan.');
          return;
        }
  
        const kraeplinTestId = userTest.kraeplin_test_id; // Extract kraeplin_test_id
  
        // Fetch the corresponding kraeplin test using the kraeplin_test_id
        const response = await axios.get(`/kraeplin-tests/${kraeplinTestId}`);
        console.log('Kraeplin test response:', response.data); // Console log added
        const test = response.data;
  
        if (test.id === kraeplinTestId) {
          setTimer(test.duration_minutes * 60); // Set timer dalam detik
        } else {
          toast.error('Kraeplin test ID tidak cocok.');
        }
      } catch (error) {
        toast.error('Gagal mengambil durasi dari Kraeplin test.');
        console.error('Error:', error);
      }
    };
  
    fetchKraeplinTest();
  }, [storedTestId]);
  

  // Countdown timer
  useEffect(() => {
    if (timer > 0 && !submitted && !hasPreviousAnswers) {
      const intervalId = setInterval(() => {
        setTimer(prevTime => prevTime - 1);
        console.log('Timer:', timer); // Console log added
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timer === 0 && !submitted && !hasPreviousAnswers) {
      handleSubmit(); // Auto-submit ketika waktu habis
    }
    // eslint-disable-next-line
  }, [timer, submitted, hasPreviousAnswers]);

  const handleAnswerChange = (questionId, answerIndex) => {
    console.log(`Answer changed for question ${questionId} to option ${answerIndex}`); // Console log added
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
        e.preventDefault(); // Prevent default form submission behavior
    }

    if (!idToSubmit) { // Check if idToSubmit is available
        toast.error("ID yang akan disubmit tidak ada.");
        return;
    }

    setSubmitted(true);

    const testAnswers = questions.map((question) => {
        const selectedAnswerIndex = answers[question.id];
        const selectedAnswer = question.answer_options[selectedAnswerIndex] || null;
        const isCorrect = selectedAnswer === question.correct_answer;

        return {
            user_test_id: parseInt(idToSubmit), // Use idToSubmit instead of userTestId
            question_id: question.id,
            kraeplin_test_id: question.kraeplin_test_id,
            answer: selectedAnswer,
            is_correct: isCorrect,
            answered_at: new Date().toISOString(),
        };
    }).filter(answer => answer.answer !== null);

    console.log('Submitting answers:', testAnswers);

    try {
        const response = await axios.post("/test-answers", { answers: testAnswers });
        console.log("Response:", response.data);
        toast.success("Kuis berhasil disubmit!");
    } catch (error) {
        console.error("Error submitting quiz:", error.response?.data || error.message);
        toast.error("Ada masalah saat submit kuis.");
    }
}, [answers, questions, idToSubmit]);


  
  return (
    <div className="container mx-auto p-4 bg-base-200 text-base-content">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Pretest</h2>

      {/* Timer */}
      <TimerComponent timer={timer} />

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

          {!submitted && (
            <button onClick={handleSubmit} className="btn btn-primary">
              Submit
            </button>
          )}
        </>
      ) : (
        <p className="mt-4 text-lg">Tidak ada pertanyaan atau kuis sudah disubmit.</p>
      )}

      {(submitted || hasPreviousAnswers) && (
        <p className="mt-4 text-lg">Kuis sudah disubmit! Terima kasih telah berpartisipasi.</p>
      )}
    </div>
  );
};

export default Quiz;
