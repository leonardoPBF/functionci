import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
