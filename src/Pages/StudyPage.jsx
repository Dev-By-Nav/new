import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deckName, setDeckName] = useState("Deck");
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState("");

  // Progress (loaded from DB + updated during session)
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    // If user not logged in, send them to login
    if (!userId) {
      navigate("/login");
      return;
    }

    loadDeckAndCards();
    loadSavedProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  async function loadDeckAndCards() {
    try {
      // Get deck name
      const decksRes = await fetch(`${API_URL}/api/decks`);
      if (decksRes.ok) {
        const decks = await decksRes.json();
        const deck = decks.find((d) => d.id === Number(deckId));
        if (deck) setDeckName(deck.name);
      }

      // Get cards
      const cardsRes = await fetch(`${API_URL}/api/decks/${deckId}/cards`);
      if (!cardsRes.ok) {
        setError(`Server error (${cardsRes.status}) while loading cards.`);
        return;
      }

      const cardsData = await cardsRes.json();
      setCards(cardsData);
      setCurrentIndex(0);
      setShowAnswer(false);
      setError("");
    } catch (err) {
      console.error("Error loading study page:", err);
      setError("Could not load deck from server.");
    }
  }

  async function loadSavedProgress() {
    try {
      const res = await fetch(
        `${API_URL}/api/progress/deck?user_id=${userId}&deck_id=${deckId}`
      );
      if (!res.ok) {
        console.error("Failed to load progress");
        return;
      }
      const data = await res.json();

      setTotalAnswered(data.answered ?? 0);
      setCorrectCount(data.correct ?? 0);
      setIncorrectCount(data.incorrect ?? 0);
    } catch (err) {
      console.error("Error loading saved progress:", err);
    }
  }

  async function sendProgress(isCorrect) {
    try {
      await fetch(`${API_URL}/api/progress/deck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          deck_id: Number(deckId),
          is_correct: isCorrect,
        }),
      });
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  }

  function handleShowAnswer() {
    setShowAnswer(true);
  }

  function goToNextCard() {
    if (cards.length === 0) return;

    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= cards.length) return 0; // loop
      return next;
    });

    setShowAnswer(false);
  }

  async function handleMarkCorrect() {
    await sendProgress(true);
    setCorrectCount((c) => c + 1);
    setTotalAnswered((t) => t + 1);
    goToNextCard();
  }

  async function handleMarkIncorrect() {
    await sendProgress(false);
    setIncorrectCount((i) => i + 1);
    setTotalAnswered((t) => t + 1);
    goToNextCard();
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="text-sm text-slate-300 hover:text-white">
            ← Back to decks
          </Link>

          <Link
            to={`/deck/${deckId}`}
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            Edit deck
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">{deckName}</h1>
        <p className="text-slate-400 mb-4">Study mode · Deck ID: {deckId}</p>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-red-600/80 text-sm">
            {error}
          </div>
        )}

        {/* Stats (from DB + session updates) */}
        <div className="mb-4 text-sm text-slate-300">
          <span className="mr-4">
            Cards:{" "}
            <span className="font-semibold text-white">{cards.length}</span>
          </span>
          <span className="mr-4">
            Answered:{" "}
            <span className="font-semibold text-white">{totalAnswered}</span>
          </span>
          <span className="mr-4">
            Correct:{" "}
            <span className="font-semibold text-emerald-400">
              {correctCount}
            </span>
          </span>
          <span>
            Incorrect:{" "}
            <span className="font-semibold text-red-400">{incorrectCount}</span>
          </span>
        </div>

        {cards.length === 0 ? (
          <p className="text-slate-400">
            This deck has no cards yet.{" "}
            <Link
              to={`/deck/${deckId}`}
              className="text-emerald-300 hover:text-emerald-200"
            >
              Add some cards first.
            </Link>
          </p>
        ) : (
          <>
            {/* Card display */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-4">
              <p className="text-sm text-slate-400 mb-2">
                Card {currentIndex + 1} of {cards.length}
              </p>
              <p className="text-xl font-semibold mb-4">
                {currentCard.question}
              </p>

              {showAnswer ? (
                <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-1">Answer:</p>
                  <p className="text-lg text-emerald-300">
                    {currentCard.answer}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 italic">
                  Click &quot;Show answer&quot; to reveal.
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              {!showAnswer && (
                <button
                  onClick={handleShowAnswer}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 transition"
                >
                  Show answer
                </button>
              )}

              {showAnswer && (
                <>
                  <button
                    onClick={handleMarkCorrect}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition"
                  >
                    I got it right
                  </button>
                  <button
                    onClick={handleMarkIncorrect}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition"
                  >
                    I got it wrong
                  </button>
                </>
              )}

              <button
                onClick={goToNextCard}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
              >
                Skip / Next card
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudyPage;
