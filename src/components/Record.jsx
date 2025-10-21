import { useState } from "react";
import { Piano, MidiNumbers, KeyboardShortcuts } from "react-piano";
import "react-piano/dist/styles.css";
import styled from "styled-components";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { useMidi } from "../hooks/useMidi";
import { useMusicContext } from "../contex/hooks";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const firstNote = MidiNumbers.fromNote("a0");
const lastNote = MidiNumbers.fromNote("c8");
const FILENAME = "recording.mid";

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: MidiNumbers.fromNote("c4"),
  lastNote: MidiNumbers.fromNote("c5"),
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

function Record() {
  const [notes, setNotes] = useState([]);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const { downloadMidi, playMidi, playNote, stopNote } = useMidi();
  const [finsihedRecording, setFinishedRecording] = useState(false);
  const [recording, setRecording] = useState(false);
  const { setGeneratedUrl, isGenerating, setIsGenerating } = useMusicContext();
  const navigate = useNavigate();

  const onPlayNoteInput = (midiNote) => {
    if (!recording) return;

    setNotes((prevNotes) => {
      // Check if this note is already being played (no end time)
      const existingNote = prevNotes.find(
        (note) => note.note === midiNote && note.end === null
      );

      // If note is already being played, don't add a new entry
      if (existingNote) {
        return prevNotes;
      }

      // Add new note entry
      return [...prevNotes, { note: midiNote, start: Tone.now(), end: null }];
    });
  };

  const onStopNoteInput = (midiNote) => {
    if (!recording) return;

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.note === midiNote && note.end === null
          ? { ...note, end: Tone.now() }
          : note
      )
    );
  };

  const exportToMidi = () => {
    const midi = new Midi();
    const track = midi.addTrack();

    // Filter out incomplete notes
    const completedNotes = notes.filter((note) => note.end !== null);

    // Find the earliest start time to normalize timing
    const startTime = Math.min(...completedNotes.map((note) => note.start));

    completedNotes.forEach((note) => {
      track.addNote({
        midi: note.note,
        time: note.start - startTime,
        duration: note.end - note.start,
        velocity: 0.75,
      });
    });

    const midiData = midi.toArray();
    return new Blob([midiData], { type: "audio/midi" });
  };

  const handleDownload = () => {
    downloadMidi(recordedUrl, FILENAME);
  };

  const handlePlay = async () => {
    await playMidi(recordedUrl);
  };

  const handleFinishRecording = () => {
    setRecording(false);
    const completedNotes = notes.filter((note) => note.end !== null);
    if (completedNotes.length === 0) {
      alert("No notes were recorded, Please play some notes.");
      return;
    }
    setFinishedRecording(true);
    const blob = exportToMidi();
    const url = URL.createObjectURL(blob);
    setRecordedUrl(url);
  };

  const handleGenerate = async () => {
    const recBlob = exportToMidi();
    const formData = new FormData();
    formData.append("midi", recBlob, FILENAME);

    try {
      setIsGenerating(true);
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        body: formData,
      });
      const genBlob = await response.blob();
      const url = URL.createObjectURL(genBlob);
      setGeneratedUrl(url);
      setIsGenerating(false);
      navigate("/generated");
    } catch (err) {
      console.error("Error generating music:", err);
    }
  };

  return (
    <Container>
      <StyledPiano
        noteRange={{ first: firstNote, last: lastNote }}
        playNote={playNote}
        stopNote={stopNote}
        onPlayNoteInput={onPlayNoteInput}
        onStopNoteInput={onStopNoteInput}
        keyWidthToHeight={0.15}
        width={1200}
        keyboardShortcuts={keyboardShortcuts}
      />
      <ButtonContainer>
        {finsihedRecording ? (
          <Button onClick={handlePlay}>►</Button>
        ) : (
          <Button
            disabled={finsihedRecording}
            onClick={() => setRecording(true)}
          >
            🔴
          </Button>
        )}
        {finsihedRecording ? (
          <Button onClick={handleDownload}>Download</Button>
        ) : (
          <Button disabled={!recording} onClick={handleFinishRecording}>
            🟥
          </Button>
        )}
      </ButtonContainer>
      <ButtonContainer>
        <Button onClick={() => navigate("/")}>Back</Button>
        {isGenerating ? (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        ) : (
          <Button onClick={handleGenerate} disabled={!finsihedRecording}>
            Generate
          </Button>
        )}
      </ButtonContainer>
    </Container>
  );
}

export default Record;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #5a5a5a 0%, #6a6a6a 50%, #5a5a5a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledPiano = styled(Piano)`
  margin: 0 auto;
  margin-top: 20vh;
  max-width: 90vw;
`;

const Button = styled.button`
  border-radius: 12px;
  margin-bottom: 14vh;
  width: 15vw;
  height: 8vh;
  background-color: #ffffff94;
  color: #000000ae;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 4vw;
`;

const Spinner = styled.div`
  width: 2.3vw;
  height: 2.3vw;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: rgba(255, 255, 255, 0.9);
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SpinnerContainer = styled.div`
  border-radius: 12px;
  margin-bottom: 14vh;
  width: 15vw;
  height: 8vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;
