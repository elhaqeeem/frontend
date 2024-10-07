import React, { useState, useEffect, useCallback } from 'react';
import axios from './axiosInstance'; // Make sure the path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStopwatch } from 'react-icons/fa';

// Fungsi checkPreviousAnswers dideklarasikan di luar komponen
const checkPreviousAnswers = async (userTestId, setHasPreviousAnswers) => {
    try {
        const answerResponse = await axios.get(`/test-answers?user_test_id=${userTestId}`);
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

const QuizKraeplin = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timer, setTimer] = useState(null);
    const [submitted, setSubmitted] = useState(false);// eslint-disable-next-line
    const [userTestId, setUserTestId] = useState(null);
    const [hasPreviousAnswers, setHasPreviousAnswers] = useState(false);
    const [storedTestId, setStoredTestId] = useState(null);
    const [idToSubmit, setIdToSubmit] = useState(null);// eslint-disable-next-line
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
// eslint-disable-next-line
    const handleAnswerChange = (questionId, answerIndex) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: answerIndex
        }));
    };

    // Mengambil data user test dan pertanyaan dari kraeplin-test-result
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

                // Mengambil pertanyaan dari kraeplin-test-result
                const questionResponse = await axios.get('/kraeplin-test-result');

                const matchingQuestions = questionResponse.data.filter(
                    question => question.kraeplin_test_id === userTest.kraeplin_test_id
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
            const selectedAnswer = question.deret_angka[selectedAnswerIndex] || [];

            const isCorrect = selectedAnswer === question.correct_answer[0];

            return {
                user_test_id: parseInt(idToSubmit),
                question_id: question.id,
                kraeplin_test_id: question.kraeplin_test_id,
                answer: [selectedAnswer],
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

<div key={question.id} className="question-block mb-4 p-4 border border-base-300 rounded-lg bg-base-100 shadow-md">
  <h2 className="text-sm font-semibold text-center">Kolom {question.column_number}</h2>
  <div className="overflow-x-auto"> {/* Responsive wrapper */}
    <table className="table-auto border-collapse border border-gray-400 w-full max-w-xl mt-4 mx-auto text-center">
      <tbody>
        {Array.isArray(question.deret_angka)
          ? question.deret_angka.slice().reverse().map((num, index, arr) => (
              <React.Fragment key={index}>
                {/* Row with number and buttons */}
                <tr className="border-b border-gray-300">
                  <td className="p-2 text-center border border-gray-300" style={{ backgroundColor: '#f0f0f0' }}>{num}</td>
                  {/* Create a button in the second column */}
                  <td className="p-2 text-center border border-gray-300">
                    <button className="bg-blue-500 text-white py-1 px-2 rounded w-full sm:w-auto">Tombol</button>
                  </td>
                  {/* Add 10 empty columns */}
                  {[...Array(10)].map((_, colIndex) => (
                    <td key={colIndex} className="p-2 text-center border border-gray-300">&nbsp;</td>
                  ))}
                </tr>
                {/* Empty row (line break) */}
                {index < arr.length - 1 && (
                  <tr>
                    <td className="p-2 text-center border border-gray-300">&nbsp;</td>
                    {/* Button in the second column for empty row */}
                    <td className="p-2 text-center border border-gray-300">
                      <button className="bg-blue-500 text-white py-1 px-2 rounded w-full sm:w-auto">Tombol</button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          : JSON.parse(question.deret_angka).slice().reverse().map((num, index, arr) => (
              <React.Fragment key={index}>
                {/* Row with number and buttons */}
                <tr className="border-b border-black-300">
                  <td className="p-2 text-center border border-gray-300" style={{ background: 'white', position: 'relative' }}>
                    {num}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(45deg)', transformOrigin: 'center' }}></div>
                  </td>
                  {[...Array(10)].map((_, colIndex) => (
                    <td key={colIndex} className="p-2 text-center border border-gray-300">&nbsp;</td>
                  ))}
                </tr>
                {/* Empty row (line break) */}
                {index < arr.length - 1 && (
                  <tr>
                    <td className="p-2 text-center border border-gray-300">&nbsp;</td>
                    <td className="p-2 text-center border border-gray-300">
                      <button className="btn btn-outline btn-warning text-white">0</button>
                    </td>
                    {[...Array(9)].map((_, colIndex) => (
                      <td key={colIndex} className="p-2 text-center border border-gray-300">
                        <button className="btn btn-outline btn-warning text-white">{colIndex + 1}</button>
                      </td>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            ))
        }
      </tbody>
    </table>
  </div>
</div>






                        </div>
                    ))}

                    <div className="flex justify-end">
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            Submit
                        </button>
                    </div>
                </>
            ) : (
                <p className="text-lg font-bold">
                    {submitted ? 'Jawaban Anda telah disubmit!' : 'Anda sudah mengerjakan kuis ini.'}
                </p>
            )}
        </div>
    );
};

export default QuizKraeplin;
