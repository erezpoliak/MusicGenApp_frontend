import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./components/App.jsx";
import Record from "./components/Record.jsx";
import { MusicProvider } from "./contex/MusicContext.jsx";
import Generated from "./components/Generated.jsx";
import UploadMidi from "./components/UploadMidi.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <MusicProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/record" element={<Record />} />
          <Route path="/generated" element={<Generated />} />
          <Route path="/upload" element={<UploadMidi />} />
        </Routes>
      </MusicProvider>
    </Router>
  </StrictMode>
);
