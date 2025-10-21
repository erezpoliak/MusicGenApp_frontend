import styled from "styled-components";
import { useRef, useState } from "react";
import { useMusicContext } from "../contex/hooks";
import { useNavigate } from "react-router-dom";
import { useMidi } from "../hooks/useMidi";

const FILENAME = "uploaded.mid";

function UploadMidi() {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const { setGeneratedUrl, setIsGenerating, isGenerating } = useMusicContext();
  const { playMidi } = useMidi();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const formData = new FormData();
      formData.append("midi", selectedFile, FILENAME);

      const response = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedUrl(url);
      setIsGenerating(false);
      navigate("/generated");
    } catch (err) {
      console.error("Error during generation:", err);
    }
  };

  const handlePlay = async () => {
    const url = URL.createObjectURL(selectedFile);
    await playMidi(url);
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <input
        type="file"
        accept=".mid,audio/midi"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <ButtonContainer>
        <Button onClick={() => navigate("/")}>Back</Button>
        <Button onClick={() => fileInputRef.current.click()}>
          Upload MIDI
        </Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button onClick={handlePlay} disabled={selectedFile === null}>
          ►
        </Button>
        {isGenerating ? (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        ) : (
          <Button disabled={selectedFile === null} onClick={handleGenerate}>
            Generate
          </Button>
        )}
      </ButtonContainer>
    </Container>
  );
}

export default UploadMidi;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #5a5a5a 0%, #6a6a6a 50%, #5a5a5a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15vh;
`;

const Button = styled.button`
  width: 12vw;
  background-color: #ffffff94;
  color: #000000ae;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
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
  width: 12vw;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 9.5vw;
`;
