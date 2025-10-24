import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { useRef } from "react";
import { API_BASE } from "../config";

export function useMidi() {
  const synthRef = useRef(null);

  const ensureSynth = async () => {
    if (Tone.getContext().state !== "running") await Tone.start();

    if (!synthRef.current)
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
  };

  const playNote = async (midiNote) => {
    await ensureSynth();

    synthRef.current.triggerAttack(
      Tone.Frequency(midiNote, "midi"),
      Tone.now()
    );
  };

  const stopNote = async (midiNote) => {
    await ensureSynth();

    synthRef.current.triggerRelease(
      Tone.Frequency(midiNote, "midi"),
      Tone.now()
    );
  };

  const downloadMidi = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const playMidi = async (url) => {
    try {
      await ensureSynth();
      if (!url) throw new Error("No URL provided for MIDI playback.");

      const response = await fetch(url);
      if (!response.ok)
        throw new Error(
          `Failed to fetch MIDI file: ${response.status} ${response.statusText}`
        );

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0)
        throw new Error("Fetched MIDI file is empty.");

      const midi = new Midi(arrayBuffer);
      const now = Tone.now();
      midi.tracks.forEach((track) => {
        track.notes.forEach((note) => {
          synthRef.current.triggerAttackRelease(
            note.name,
            note.duration,
            now + note.time,
            note.velocity
          );
        });
      });

      synthRef.current.releaseAll(now + midi.duration);
    } catch (error) {
      console.error("Error during MIDI playback:", error);
    }
  };

  const generate = async (file, filename) => {
    const formData = new FormData();
    formData.append("midi", file, filename);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    try {
      const startRes = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        body: formData,
      });

      const { task_id } = await startRes.json();

      while (true) {
        await sleep(5000); // check every five seconds
        const generatedRes = await fetch(`${API_BASE}/result/${task_id}`);

        if (generatedRes.status === 202) continue; // still processing
        const genBlob = await generatedRes.blob();
        const url = URL.createObjectURL(genBlob);
        return url;
      }
    } catch (err) {
      console.error("Error during generation:", err);
    }
  };

  return { downloadMidi, playMidi, playNote, stopNote, generate };
}
