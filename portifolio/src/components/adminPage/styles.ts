import styled from "styled-components";

export const Container = styled.div`
  padding: 40px;
  background-color: #000;
  color: #fff;
  min-height: 100vh;
  font-family: sans-serif;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 1px solid #333;
  padding-bottom: 20px;
`;

export const Title = styled.h1`
  font-size: 32px;
  margin: 0;
`;

export const LogoutButton = styled.button`
  padding: 10px 20px;
  background-color: #f43f5e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background-color: ${(props) => (props.$active ? "#5A8CFF" : "#333")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#5A8CFF" : "#444")};
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  background-color: #111;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #333;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #ccc;
`;

export const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #222;
  color: white;
  font-size: 16px;

  &:focus {
    outline: 2px solid #5A8CFF;
  }
`;

export const TextArea = styled.textarea`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #222;
  color: white;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: 2px solid #5A8CFF;
  }
`;

export const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #222;
  color: white;
  font-size: 16px;
`;

export const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 10px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
`;

export const SubmitButton = styled.button`
  padding: 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;

  &:hover {
    background-color: #218838;
  }
`;

export const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 800px;
`;

export const ProjectItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #111;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #333;
`;

export const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  strong {
    font-size: 18px;
  }
  span {
    font-size: 12px;
    color: #888;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 8px 15px;
  background-color: ${(props) => (props.$danger ? "#dc3545" : "#5A8CFF")};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.8;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalBox = styled.div`
  background-color: #222;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #444;
  max-width: 400px;
  width: 100%;

  h2 {
    margin-top: 0;
    margin-bottom: 20px;
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
`;