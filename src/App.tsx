import axios from 'axios';
import { useState } from 'react';

interface QuizResponse {
  image_url: string;
  quiz_options: string[];
  correct_answer: string;
  correct_meaning: string;
}

function LoadingSpinner() {
  return (
    <div className='flex flex-col items-center w-full'>
      <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      <p className='mt-4 text-lg text-gray-600'>読み込み中...</p>
    </div>
  );
}

function QuizContent({
  quiz,
  selected,
  result,
  onSelect,
  onNext,
}: {
  quiz: QuizResponse;
  selected: string | null;
  result: boolean | null;
  onSelect: (option: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <img src={quiz.image_url} alt='quiz' className='w-full h-auto mb-6 rounded-lg shadow' />
      <div className='grid grid-cols-2 gap-4 w-full'>
        {quiz.quiz_options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option)}
            disabled={selected !== null}
            className={`py-2 px-4 border text-base sm:text-lg font-medium rounded transition-colors duration-200 ${
              selected === option
                ? result
                  ? 'bg-green-300 border-green-500'
                  : 'bg-red-300 border-red-500'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {selected && (
        <div className='mt-6'>
          {result ? (
            <p className='text-green-600 text-base sm:text-lg font-semibold'>
              正解です！「{quiz.correct_answer}」は「{quiz.correct_meaning}」という意味です。
            </p>
          ) : (
            <p className='text-red-600 text-base sm:text-lg font-semibold'>
              不正解！正解は「{quiz.correct_answer}」（{quiz.correct_meaning}）です。
            </p>
          )}
          <button
            onClick={onNext}
            className='mt-4 py-2 px-6 bg-blue-500 text-white rounded hover:bg-blue-600 text-base sm:text-lg'
          >
            次の問題へ
          </button>
        </div>
      )}
    </>
  );
}

export default function App(): JSX.Element {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchQuiz = async () => {
    try {
      setError(null);
      setQuiz(null);
      setLoading(true);
      const res = await axios.get<QuizResponse>(`${BASE_URL}/generate-quiz`);
      setQuiz(res.data);
      setSelected(null);
      setResult(null);
    } catch (err) {
      console.error('クイズの取得に失敗しました', err);
      setError('クイズの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    fetchQuiz();
  };

  const handleAnswer = (option: string) => {
    if (!quiz) return;
    setSelected(option);
    setResult(option === quiz.correct_answer);
  };

  const handleNext = () => {
    fetchQuiz();
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 px-4'>
      <div className='p-6 w-full max-w-md md:max-w-lg text-center bg-white shadow-xl rounded-2xl flex flex-col items-center'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-6'>スペイン語クイズ</h1>

        {!started ? (
          <button
            onClick={handleStart}
            className='py-3 px-6 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-600'
          >
            開始
          </button>
        ) : (
          <>
            {error && (
              <>
                <div className='text-red-600 mt-4'>{error}</div>
                <button
                  onClick={fetchQuiz}
                  className='mt-4 py-2 px-6 bg-blue-500 text-white rounded hover:bg-blue-600 text-base sm:text-lg'
                >
                  再読み込み
                </button>
              </>
            )}

            {loading && !error && <LoadingSpinner />}

            {!loading && quiz && (
              <QuizContent
                quiz={quiz}
                selected={selected}
                result={result}
                onSelect={handleAnswer}
                onNext={handleNext}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
