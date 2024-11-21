import React, { useState, useEffect, useCallback } from 'react';
import axios from './axiosInstance'; // Make sure the path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStopwatch } from 'react-icons/fa';

// Fungsi checkPreviousAnswers dideklarasikan di luar komponen
const checkPreviousAnswers = async (userTestId, setHasPreviousAnswers) => {
  try {
    // Langsung menggunakan kraeplin_test_id = 7
    const kraeplinTestId = 7;

    const answerResponse = await axios.get(`/test-answers?user_test_id=${userTestId}&kraeplin_test_id=${kraeplinTestId}`);

    if (answerResponse.data.length > 0) {
      setHasPreviousAnswers(true);
    }
  } catch (error) {
    toast.info('Anda bisa memulai mengerjakan test');
    console.error('Error:', error);
  }
};



const TimerComponent = ({ timer, initialTime }) => {
  // Menghitung progress dari timer
  const progress = ((initialTime - timer) / initialTime) * 100;

  return (
    <div className="flex flex-col items-center mb-4">
      <span className="badge badge-warning">
        <FaStopwatch className="mr-4" />
        Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
      </span>
      <div className="w-full mt-2">
        <progress className="progress progress-info" value={progress} max="100"></progress>
      </div>
    </div>
  );
};

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(null);
  const [submitted, setSubmitted] = useState(false);// eslint-disable-next-line
  const [userTestId, setUserTestId] = useState(null);
  const [hasPreviousAnswers, setHasPreviousAnswers] = useState(false);
  const [storedTestId, setStoredTestId] = useState(null);
  const [idToSubmit, setIdToSubmit] = useState(null);
  const [initialTime, setInitialTime] = useState(300); // Default waktu 5 menit

  // Mendapatkan test ID dari localStorage
  useEffect(() => {
    const testId = localStorage.getItem('id');
    if (testId) {
      setStoredTestId(testId);
    } else {
      toast.error('Test ID tidak ditemukan di local storage.');
    }
  }, []);

  const handleAnswerChange = (questionId, answerIndex, isMultipleChoice) => {
    setAnswers(prevAnswers => {
      if (isMultipleChoice) {
        const currentAnswers = prevAnswers[questionId] || [];
        if (currentAnswers.includes(answerIndex)) {
          return {
            ...prevAnswers,
            [questionId]: currentAnswers.filter(index => index !== answerIndex),
          };
        } else {
          return {
            ...prevAnswers,
            [questionId]: [...currentAnswers, answerIndex],
          };
        }
      } else {
        return {
          ...prevAnswers,
          [questionId]: answerIndex,
        };
      }
    });
  };

  // Mengambil data user test dan pertanyaan
  useEffect(() => {
    if (!storedTestId) return;

    const fetchTestData = async () => {
      try {
        const userTestResponse = await axios.get('/user-tests');
        const userTest = userTestResponse.data.find(test => test.user_id === parseInt(storedTestId));

        if (!userTest) {
          toast.error('User test tidak ditemukan.');
          return;
        }

        const idToSubmit = userTest.id;
        setIdToSubmit(idToSubmit);

        const questionResponse = await axios.get('/questions');
        const kraeplinTestId = userTest.kraeplin_test_id;

        const matchingQuestions = questionResponse.data.filter(
          question => [7].includes(question.kraeplin_test_id)
        );


        if (matchingQuestions.length === 0) {
          toast.error('Tidak ada pertanyaan yang cocok.');
          return;
        }

        setQuestions(matchingQuestions);
        setUserTestId(storedTestId);

        // Memeriksa jawaban sebelumnya
        checkPreviousAnswers(userTest.id, setHasPreviousAnswers);
      } catch (error) {
        toast.error('Gagal mengambil data pertanyaan atau user test.');
        console.error('Error:', error);
      }
    };

    fetchTestData();
  }, [storedTestId]);

  // Mengambil durasi dari Kraeplin test
  useEffect(() => {
    if (!storedTestId) return;

    const fetchKraeplinTest = async () => {
      try {
        const userTestResponse = await axios.get('/user-tests');
        const userTest = userTestResponse.data.find(test => test.user_id === parseInt(storedTestId));

        if (!userTest) {
          toast.error('User test tidak ditemukan.');
          return;
        }

        const kraeplinTestId = userTest.kraeplin_test_id;
        const response = await axios.get(`/kraeplin-tests/${kraeplinTestId}`);
        const test = response.data;

        if (test.id === kraeplinTestId) {
          const durationInSeconds = test.duration_minutes * 60;
          setTimer(durationInSeconds);
          setInitialTime(durationInSeconds);
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

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && !submitted && !hasPreviousAnswers) {
      const intervalId = setInterval(() => {
        setTimer(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timer === 0 && !submitted && !hasPreviousAnswers) {
      handleSubmit(); // Auto-submit ketika waktu habis
    }// eslint-disable-next-line
  }, [timer, submitted, hasPreviousAnswers]);

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!idToSubmit) {
      toast.error("ID yang akan disubmit tidak ada.");
      return;
    }

    setSubmitted(true);

    const testAnswers = questions.map((question) => {
      const selectedAnswerIndex = answers[question.id];

      let selectedAnswer = [];
      let isCorrect;

      if (question.kraeplin_test_id === 7 || question.kraeplin_test_id === 9) {
        const answer = question.answer_options[selectedAnswerIndex] || null;
        if (answer) {
          selectedAnswer = [answer];
        }
        isCorrect = answer === question.correct_answer[0];
      } else {
        selectedAnswer = selectedAnswerIndex?.map(index => question.answer_options[index]) || [];
        isCorrect = selectedAnswer.every(answer => question.correct_answer.includes(answer)) &&
          selectedAnswer.length === question.correct_answer.length;
      }

      return {
        user_test_id: parseInt(idToSubmit),
        question_id: question.id,
        kraeplin_test_id: question.kraeplin_test_id,
        answer: selectedAnswer,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      };
    }).filter(answer => answer.answer.length > 0);

    try {// eslint-disable-next-line
      const response = await axios.post("/test-answers", { answers: testAnswers });
      toast.success("Kuis berhasil disubmit!");
    } catch (error) {
      toast.error("Ada masalah saat submit kuis.");
      console.error("Error submitting quiz:", error.response?.data || error.message);
    }
  }, [answers, questions, idToSubmit]);

  return (
    <div className="container mx-auto p-4 bg-base-200 text-base-content">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Pretest</h2>

      {/* Timer */}
      {timer && <TimerComponent timer={timer} initialTime={initialTime} />}

      {!hasPreviousAnswers && !submitted && questions.length > 0 ? (
  <>
    {questions.map((question) => (
      <div
        key={question.id}
        className="question-block mb-4 p-4 border border-base-300 rounded-lg bg-base-100 shadow-md"
      >
        {/* Menampilkan pertanyaan sebagai gambar */}
        <div className="flex justify-center mb-4">
          <img
            src={question.question_text}
            alt={`Question ${question.id}`}
            className="w-40 h-20 object-contain"
          />
        </div>

        <div className="flex flex-wrap justify-center items-center space-x-4 mt-5">
  {(question.kraeplin_test_id === 7 || question.kraeplin_test_id === 9) ? (
    // Untuk opsi jawaban tunggal
    question.answer_options.map((option, index) => (
      <button
        key={index}
        onClick={() => handleAnswerChange(question.id, index, false)} // single-answer (false)
        className={`btn w-20 h-20 mr-2 mb-2 ${answers[question.id] === index ? 'btn-warning' : 'btn btn-outline'}`}
        disabled={hasPreviousAnswers}
      >
        {/* Menampilkan opsi jawaban sebagai gambar */}
        <img
          src={option}
          alt={`Answer option ${index}`}
          className="max-w-full max-h-full object-contain"
        />
      </button>
    ))
  ) : (
    // Untuk opsi jawaban ganda
    question.answer_options.map((option, index) => (
      <button
        key={index}
        onClick={() => handleAnswerChange(question.id, index, true)} // multiple-answer (true)
        className={`btn w-19 h-19 mr-2 mb-2 ${answers[question.id]?.includes(index) ? 'btn-warning' : 'btn btn-outline'}`}
        disabled={hasPreviousAnswers}
      >
        {/* Menampilkan opsi jawaban sebagai gambar */}
        <img
          src={option}
          alt={`Answer option ${index}`}
          className="max-w-full max-h-full object-contain"
        />
      </button>
    ))
  )}
</div>

      </div>
    ))}

    <div className="flex justify-end">
      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  </>
) 
 : (
        <p className="text-lg font-bold">
          {submitted ? 'Jawaban Anda telah disubmit!' : 'Anda sudah mengerjakan kuis ini.'}
        </p>
      )}
    </div>
  );
};

export default Quiz;