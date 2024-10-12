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
        <div className="fixed top-20 right-4 flex flex-col items-center mb-4 bg-gray-100 text-white p-4 rounded-full shadow-lg">
            <div className="radial-progress text-yellow-400" style={{ "--value": progress, "--size": "3rem", "--thickness": "4px" }}>
                <span className="text-sm text-gray-800 font-semibold">
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </span>
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
    const [deretAngka, setDeretAngka] = useState([]);

    // Mendapatkan test ID dari localStorage
    useEffect(() => {
        const testId = localStorage.getItem('id');
        if (testId) {
            setStoredTestId(testId);
        } else {
            toast.error('Test ID tidak ditemukan di local storage.');
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Retrieve the Bearer token from localStorage
                const token = localStorage.getItem('token'); // Assuming token is stored under 'token' key

                // Set up the request headers with Bearer token if available
                const headers = new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '' // Only add Authorization header if token is available
                });

                const response = await fetch('/kraeplin-test-result', { headers });
                const data = await response.json();
                if (data && data.length > 0) {
                    const result = data[0].deret_angka; // Assuming you want the first entry
                    setDeretAngka(JSON.parse(result)); // Parse the JSON string
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
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
                    question => question.kraeplin_test_id === kraeplinTestId
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

            {/* Timer */}
            {timer && <TimerComponent timer={timer} initialTime={initialTime} />}

            {!hasPreviousAnswers && !submitted && questions.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">  {/* Grid for three columns: sidebar + 2 columns */}

                        {/* Left Column (optional content like sidebar or other sections) */}
                        <div className="col-span-1">
                            {/* You can add any content here, like a sidebar, stats, etc. */}
                            <div className="p-4 border border-base-300 rounded-lg bg-base-100 shadow-md">
                                <div className="flex flex-col items-center mt-4">
                                    <div className="border border-gray-300 rounded-lg p-4 bg-gray shadow-md">
                                        <table className="table-auto border-collapse border border-gray-300 w-full sm:w-auto mx-auto" >
                                            <tbody>
                                                {deretAngka.length > 0 ? (
                                                    // Reverse the order of deretAngka to display from bottom to top
                                                    [...deretAngka].reverse().map((angka, index) => (
                                                        <React.Fragment key={index}>
                                                            {/* Number row */}
                                                            <tr className="text-center">
                                                                <td className="border border-gray-300 px-4 py-2 ">
                                                                    <button className="btn btn-rounded btn-primary  w-full">
                                                                        {angka}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            {/* Empty row for spacing, except after the last number */}
                                                            {index !== deretAngka.length - 1 && (
                                                                <tr>
                                                                    <td className="border border-gray-300">
                                                                    <div style={{ height: '30px' }}>
                                                                        </div>

                                                                       
                                                                      
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="1" className="text-center border px-4 py-2">
                                                            Loading...
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>


                                        </table>

                                    </div>
                                </div>
                            </div>



                        </div>

                        {/* Right Column: Questions */}
                        <div className="col-span-2 flex flex-col-reverse">
                            {questions.map((question) => (
                                <div key={question.id} className="p-3 border border-base-300 rounded-lg bg-base-100 shadow-md text-center mb-4">
                                    {/*  <h2 className="text-sm font-semibold">{question.question_text}</h2>  */}
                                    <div className="overflow-x-auto">
                                        <table className="table-auto border-collapse border border-gray-300 w-full sm:w-auto mx-auto">
                                            <tbody>
                                                <tr>
                                                    {(question.kraeplin_test_id === 7 || question.kraeplin_test_id === 9) ? (
                                                        question.answer_options.map((option, index) => (
                                                            <td key={index} className="px-2 py-1 border border-gray-300">
                                                                <button
                                                                    onClick={() => handleAnswerChange(question.id, index, false)} // single-answer (false)
                                                                    className={`btn ${answers[question.id] === index ? 'btn-warning' : 'btn-outline'} border border-gray-300`}
                                                                    disabled={hasPreviousAnswers}
                                                                >
                                                                    {option}
                                                                </button>
                                                            </td>
                                                        ))
                                                    ) : (
                                                        question.answer_options.map((option, index) => (
                                                            <td key={index} className="px-2 py-1 border border-gray-300">
                                                                <button
                                                                    onClick={() => handleAnswerChange(question.id, index, true)} // multiple-answer (true)
                                                                    className={`btn ${answers[question.id]?.includes(index) ? 'btn-warning' : 'btn-outline'} border border-gray-300`}
                                                                    disabled={hasPreviousAnswers}
                                                                >
                                                                    {option}
                                                                </button>
                                                            </td>
                                                        ))
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>

                    <div className="flex justify-end mt-4">
                        <button className="btn btn-info floating-btn" onClick={handleSubmit}>
                            <i className="fa fa-paper-plane" aria-hidden="true"> Submit</i>
                        </button>

                        <style jsx>{`
                        .floating-btn {
                            position: fixed;
                            bottom: 60px;
                            right: 20px;
                            z-index: 1000;
                            padding: 10px 20px;
                            border-radius: 50px;
                            color: white;
                            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                        }
    
                        .floating-btn:hover {
                            cursor: pointer;
                        }
                    `}</style>
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

export default Quiz;
