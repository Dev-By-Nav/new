import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Tile from "../Components/Tile";

const API_URL = "http://127.0.0.1:5000";

function Home() {
  const [decks, setDecks] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Auth state (simple code login)
  const [userCode, setUserCode] = useState(localStorage.getItem("user_code"));

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state (inside modal)
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [examBoard, setExamBoard] = useState("");
  const [yearGroup, setYearGroup] = useState("");

  useEffect(() => {
    loadDecks();
    setUserCode(localStorage.getItem("user_code"));
  }, []);

  async function loadDecks() {
    try {
      const res = await fetch(`${API_URL}/api/decks`);
      if (!res.ok) {
        setError(`Server error (${res.status}) while loading decks.`);
        return;
      }
      const data = await res.json();
      setDecks(data);
      setError("");
    } catch (err) {
      console.error("Error loading decks:", err);
      setError("Could not load decks from server.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_code");
    setUserCode(null);
  }

  function openModal() {
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError("");

    // reset form
    setName("");
    setSubject("");
    setExamBoard("");
    setYearGroup("");
  }

  async function handleCreateDeck(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Deck name cannot be empty.");
      return;
    }
    if (!subject || !examBoard || !yearGroup) {
      setError("Please select Subject, Exam Board, and Year Group.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          exam_board: examBoard,
          year_group: yearGroup,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create deck.");
        return;
      }

      // Add to UI instantly
      setDecks((prev) => [...prev, data]);
      closeModal();
    } catch (err) {
      console.error("Error creating deck:", err);
      setError("Could not reach the server.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* HEADER + AUTH */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Flashcard Revision App</h1>

        {userCode ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">
              Logged in as <span className="font-mono">{userCode}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-sm"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-sm"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition text-sm font-medium"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* ERROR (ONLY OUTSIDE MODAL) */}
      {error && !isModalOpen && (
        <div className="max-w-6xl mx-auto mb-4 px-4 py-2 rounded-xl bg-red-600/80 text-sm">
          {error}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* TOP BAR */}
        <div className="flex justify-end mb-6">
          <button
            onClick={openModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-medium"
          >
            + Create New Deck
          </button>
        </div>

        {/* DECK TILES */}
        <div className="flex flex-wrap gap-4">
          {decks.length === 0 && (
            <p className="text-slate-400">No decks yet. Create one to start.</p>
          )}

          {decks.map((deck) => (
            <Tile
              key={deck.id}
              title={deck.name}
              subject={deck.subject}
              examBoard={deck.exam_board}
              yearGroup={deck.year_group}
              onClickStudy={() =>
                userCode ? navigate(`/study/${deck.id}`) : navigate("/login")
              }
              onClickEdit={() =>
                userCode ? navigate(`/deck/${deck.id}`) : navigate("/login")
              }
            />
          ))}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* MODAL BOX */}
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Create New Deck</h2>
              <button
                onClick={closeModal}
                className="text-slate-300 hover:text-white text-xl"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-red-600/80 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Deck Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cell Structure & Transport"
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:ring focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700"
                  >
                    <option value="">Select</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Economics">Economics</option>
                    <option value="Maths">Maths</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Exam Board
                  </label>
                  <select
                    value={examBoard}
                    onChange={(e) => setExamBoard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700"
                  >
                    <option value="">Select</option>
                    <option value="AQA">AQA</option>
                    <option value="OCR">OCR</option>
                    <option value="Edexcel">Edexcel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Year Group
                  </label>
                  <select
                    value={yearGroup}
                    onChange={(e) => setYearGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700"
                  >
                    <option value="">Select</option>
                    <option value="Year 12">Year 12</option>
                    <option value="Year 13">Year 13</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-medium"
                >
                  Create Deck
                </button>
              </div>
            </form>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Click outside the popup or press ✕ to close.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;