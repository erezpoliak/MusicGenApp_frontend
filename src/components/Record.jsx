import { useState } from "react";
import { Piano, MidiNumbers, KeyboardShortcuts } from "react-piano";
import "react-piano/dist/styles.css";
import styled from "styled-components";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { useMidi } from "../hooks/useMidi";
import { useMusicContext } from "../contex/hooks";
import { useNavigate } from "react-router-dom";

const firstNote = MidiNumbers.fromNote("a0");
const lastNote = MidiNumbers.fromNote("c8");
const FILENAME = "recording.mid";

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: MidiNumbers.fromNote("c4"),
  lastNote: MidiNumbers.fromNote("c5"),
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

// const synth = new Tone.PolySynth(Tone.Synth).toDestination();

function Record() {
  const [notes, setNotes] = useState([]);
  // const [generatedUrl, setGeneratedUrl] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const { downloadMidi, playMidi, playNote, stopNote } = useMidi();
  const [finsihedRecording, setFinishedRecording] = useState(false);
  const [recording, setRecording] = useState(false);
  const { setGeneratedUrl, isGenerating, setIsGenerating } = useMusicContext();
  const navigate = useNavigate();
  // const [isGenerating, setIsGenerating] = useState(false);

  // const playNote = (midiNote) => {
  //   synth.triggerAttack(Tone.Frequency(midiNote, "midi"), Tone.now());
  // };

  // const stopNote = (midiNote) => {
  //   synth.triggerRelease(Tone.Frequency(midiNote, "midi"), Tone.now());
  // };

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

    // if (completedNotes.length === 0) {
    //   return new Blob([], { type: "audio/midi" });
    // }

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

  // const handleDownload = () => {
  //   const blob = exportToMidi();
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "recording.mid";
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  const handleDownload = () => {
    downloadMidi(recordedUrl, FILENAME);
  };

  // const handleGenerate = async () => {
  //   const midiFile = exportToMidi();
  //   const formData = new FormData();
  //   formData.append("midi", midiFile, "recording.mid");

  //   try {
  //     const response = await fetch("http://127.0.0.1:5000/generate", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     const blob = await response.blob();

  //     /////
  //     const arrayBuffer = await blob.arrayBuffer();
  //     const returnedMidi = new Midi(arrayBuffer);
  //     console.log("Returned MIDI tracks:", returnedMidi.tracks.length);
  //     returnedMidi.tracks.forEach((track, index) => {
  //       console.log(`Returned track ${index} has ${track.notes.length} notes`);
  //     });
  //     //////
  //     const url = URL.createObjectURL(blob);
  //     setGeneratedUrl(url);
  //   } catch (error) {
  //     console.log("Error generating music: ", error);
  //   }
  // };

  // const playGenerated = async () => {
  //   try {
  //     console.log("Starting playback...");

  //     // Start Tone.js audio context
  //     if (Tone.context.state !== "running") {
  //       await Tone.start();
  //       console.log("Tone.js started");
  //     }

  //     if (!generatedUrl) {
  //       console.error("No generated URL available");
  //       return;
  //     }

  //     const response = await fetch(generatedUrl);
  //     if (!response.ok) {
  //       console.error("Failed to fetch generated music");
  //       return;
  //     }

  //     const arrayBuffer = await response.arrayBuffer();
  //     console.log("ArrayBuffer size:", arrayBuffer.byteLength);

  //     const midi = new Midi(arrayBuffer);
  //     console.log("MIDI tracks:", midi.tracks.length);
  //     console.log(
  //       "Total notes:",
  //       midi.tracks.reduce((sum, track) => sum + track.notes.length, 0)
  //     );

  //     // Stop any currently playing notes
  //     synth.releaseAll();

  //     const now = Tone.now();
  //     let noteCount = 0;

  //     midi.tracks.forEach((track, trackIndex) => {
  //       console.log(`Track ${trackIndex} has ${track.notes.length} notes`);
  //       track.notes.forEach((note, noteIndex) => {
  //         console.log(
  //           `Note ${noteIndex}: ${note.name}, time: ${note.time}, duration: ${note.duration}`
  //         );
  //         synth.triggerAttackRelease(
  //           note.name,
  //           note.duration,
  //           now + note.time,
  //           note.velocity
  //         );
  //         noteCount++;
  //       });
  //     });

  //     console.log(`Scheduled ${noteCount} notes to play`);
  //   } catch (error) {
  //     console.error("Error playing generated music:", error);
  //   }
  // };

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
    // setRecording(false);
    setFinishedRecording(true);
    const blob = exportToMidi();
    const url = URL.createObjectURL(blob);
    setRecordedUrl(url);
  };

  // const concatMidiFiles = async (recBlob, genBlob) => {
  //   try {
  //     const recArrayBuffer = await recBlob.arrayBuffer();
  //     const genArrayBuffer = await genBlob.arrayBuffer();

  //     const recMidi = new Midi(recArrayBuffer);
  //     const genMidi = new Midi(genArrayBuffer);

  //     const combinedMidi = new Midi();
  //     const combinedTrack = combinedMidi.addTrack();
  //     let recDuration = 0;

  //     recMidi.tracks.forEach((track) => {
  //       track.notes.forEach((note) => {
  //         const endTime = note.time + note.duration;
  //         if (endTime > recDuration) recDuration = endTime;
  //         combinedTrack.addNote({
  //           midi: note.midi,
  //           time: note.time,
  //           duration: note.duration,
  //           velocity: note.velocity,
  //         });
  //       });
  //     });

  //     genMidi.tracks.forEach((track) => {
  //       track.notes.forEach((note) => {
  //         combinedTrack.addNote({
  //           midi: note.midi,
  //           time: note.time + recDuration + 0.1,
  //           duration: note.duration,
  //           velocity: note.velocity,
  //         });
  //       });
  //     });

  //     const combinedMidiData = combinedMidi.toArray();
  //     return new Blob([combinedMidiData], { type: "audio/midi" });
  //   } catch (err) {
  //     console.error("Error concatenating MIDI files:", err);
  //   }
  // };

  const handleGenerate = async () => {
    // const midiFile = exportToMidi();
    const recBlob = exportToMidi();
    const formData = new FormData();
    // formData.append("midi", midiFile, "recording.mid");
    formData.append("midi", recBlob, FILENAME);

    try {
      setIsGenerating(true);
      const response = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        body: formData,
      });
      const genBlob = await response.blob();
      // const combinedBlob = await concatMidiFiles(recBlob, genBlob);
      // const url = URL.createObjectURL(combinedBlob);
      const url = URL.createObjectURL(genBlob);
      setGeneratedUrl(url);
      // const url = URL.createObjectURL(blob);
      // setGeneratedUrl(url);
      setIsGenerating(false);
      navigate("/generated");
    } catch (err) {
      console.error("Error generating music:", err);
    }
  };

  const handleBack = () => {
    // if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    navigate("/");
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
      {/* <ButtonContainer>
        <Button onClick={handleGenerate}>Generate</Button>
        <Button onClick={handleDownload}>Download Midi</Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button onClick={playGenerated} disabled={!generatedUrl}>
          Play Generated
        </Button>
        <Button onClick={handleDownload}>Download Generated</Button>
      </ButtonContainer> */}
      <ButtonContainer>
        {finsihedRecording ? (
          <Button onClick={handlePlay}>{/* Play */}►</Button>
        ) : (
          <Button
            disabled={finsihedRecording}
            onClick={() => setRecording(true)}
          >
            {/* Start Recording (icon) */}
            🔴
          </Button>
        )}
        {finsihedRecording ? (
          <Button onClick={handleDownload}>Download</Button>
        ) : (
          <Button disabled={!recording} onClick={handleFinishRecording}>
            {/* Finish Recording (icon) */}🟥
          </Button>
        )}
      </ButtonContainer>
      <ButtonContainer>
        <Button onClick={handleBack}>Back</Button>
        {/* {finsihedRecording ? (
          <Button onClick={handleGenerate}>Generate</Button>
        ) : null} */}
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
  /* width: 16px; */
  /* height: 16px; */
  width: 2.3vw;
  height: 2.3vw;
  border-radius: 50%;
  /* margin-right: 8px; */
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
