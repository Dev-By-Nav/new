import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import DeckPage from "./Pages/DeckPage";
import StudyPage from "./Pages/StudyPage";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/deck/:deckId" element={<DeckPage />} />
      <Route path="/study/:deckId" element={<StudyPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
