import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function DeckPage() {
  const { deckId } = useParams();
  const [deckName, setDeckName] = useState("Deck");
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDeckAndCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  async function loadDeckAndCards() {
    try {
      // get deck name
      const decksRes = await fetch(`${API_URL}/api/decks`);
      if (decksRes.ok) {
        const decks = await decksRes.json();
        const deck = decks.find((d) => d.id === Number(deckId));
        if (deck) setDeckName(deck.name);
      }

      // get cards
      const cardsRes = await fetch(`${API_URL}/api/decks/${deckId}/cards`);
      if (!cardsRes.ok) {
        setError(`Server error (${cardsRes.status}) while loading cards.`);
        return;
      }
      const cardsData = await cardsRes.json();
      setCards(cardsData);
      setError("");
    } catch (err) {
      console.error("Error loading deck page:", err);
      setError("Could not load deck from server.");
    }
  }

  async function handleAddCard(e) {
    e.preventDefault();
    setError("");

    if (!question.trim() || !answer.trim()) {
      setError("Question and answer cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add card.");
        return;
      }

      setCards((prev) => [...prev, data]);
      setQuestion("");
      setAnswer("");
    } catch (err) {
      console.error("Error adding card:", err);
      setError("Could not reach the server.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-block mb-4 text-sm text-slate-300 hover:text-white"
        >
          ← Back to decks
        </Link>

        <h1 className="text-3xl font-bold mb-2">{deckName}</h1>
        <p className="text-slate-400 mb-4">Deck ID: {deckId}</p>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-red-600/80 text-sm">
            {error}
          </div>
        )}

        {/* Add card form */}
        <form onSubmit={handleAddCard} className="space-y-2 mb-6">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:ring focus:ring-emerald-500"
          />
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:ring focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition"
          >
            Add Card
          </button>
        </form>

        {/* Card list */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {cards.length === 0 && (
            <p className="text-slate-400">
              No cards in this deck yet. Add some above.
            </p>
          )}
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2"
            >
              <p className="font-medium">{card.question}</p>
              <p className="text-sm text-emerald-300">{card.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeckPage;
