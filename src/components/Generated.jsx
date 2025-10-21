import styled from "styled-components";
import { useMusicContext } from "../contex/hooks";
import { useMidi } from "../hooks/useMidi";
import { useNavigate } from "react-router-dom";

const FILENAME = "generated.mid";

function Generated() {
  const { generatedUrl } = useMusicContext();
  const { playMidi, downloadMidi } = useMidi();
  const navigate = useNavigate();

  const handlePlay = async () => {
    await playMidi(generatedUrl);
  };

  const handleDownload = () => {
    downloadMidi(generatedUrl, FILENAME);
  };

  const handleBack = () => {
    if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    navigate("/");
  };

  return (
    <Container>
      <h1>Music Generated Successfully!</h1>
      <ButtonContainer>
        <Button onClick={handlePlay}>►</Button>
        <Button onClick={handleDownload}>Download</Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button onClick={handleBack}>Back</Button>
      </ButtonContainer>
    </Container>
  );
}

export default Generated;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #5a5a5a 0%, #6a6a6a 50%, #5a5a5a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20vh;
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
