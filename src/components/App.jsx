import styled from "styled-components";
import { Link } from "react-router-dom";

function App() {
  return (
    <Container>
      <Header>Music Generation App</Header>
      <StyledLink to="/record">
        <Button>Record</Button>
      </StyledLink>
      <StyledLink to="/upload">
        <Button>Upload MIDI</Button>
      </StyledLink>
    </Container>
  );
}

export default App;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #5a5a5a 0%, #6a6a6a 50%, #5a5a5a 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.h1`
  color: #ffffffd3;
  margin-top: 11vh;
  text-align: center;
`;

const StyledLink = styled(Link)`
  align-self: center;
  margin-top: 26vh;
  text-decoration: none;
`;

const Button = styled.button`
  width: 12vw;
  background-color: #ffffff94;
  color: #000000ae;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
`;
