import styled, { keyframes } from 'styled-components';

/* --- LAYOUT DA PÁGINA --- */
export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000;
`;

export const Title = styled.h1`
  font-size: 40px;
  margin: 20px 0 40px;
  color: #fff;
  text-align: center;
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px; 
  width: 300px;
`;

/* --- INPUT ANIMADO --- */
export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Label = styled.label`
  position: absolute;
  top: 15px;
  left: 0;
  pointer-events: none;

  span {
    display: inline-block;
    font-size: 18px;
    min-width: 5px;
    color: #fff;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
`;

export const InputField = styled.input`
  background-color: transparent;
  border: 0;
  border-bottom: 2px #fff solid;
  display: block;
  width: 100%;
  padding: 15px 0;
  font-size: 18px;
  color: #fff;

  &:focus,
  &:valid {
    outline: 0;
    border-bottom-color: lightblue;
  }

  &:focus + ${Label} span,
  &:valid + ${Label} span {
    color: lightblue;
    transform: translateY(-30px);
  }
`;

/* --- ANIMAÇÕES DO BOTÃO GALÁXIA --- */
const rotateNebula = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const starDrift = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.1) translate(-2%, -2%); }
`;

/* --- COMPONENTES DO BOTÃO GALÁXIA --- */
export const GalaxyBtnIcon = styled.svg`
  width: 1.25em;
  height: 1.25em;
  transition: transform 0.3s ease;
  fill: var(--btn-text);
`;

export const GalaxyBtnStars = styled.span`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: radial-gradient(circle at 20% 30%, white 1px, transparent 1.5px),
                    radial-gradient(circle at 80% 70%, white 1px, transparent 1.5px),
                    radial-gradient(circle at 40% 80%, white 0.5px, transparent 1px);
  background-size: 120% 120%;
  opacity: 0.3;
  transition: opacity 0.3s ease, background-position 0.3s ease;
`;

export const GalaxyBtnContent = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75em;
  position: relative;
  z-index: 2;
  color: var(--btn-text);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const GalaxyBtn = styled.button`
  --btn-bg: #0c0c14;
  --btn-text: #ffffff;
  --btn-primary: #8553f4; 
  --btn-secondary: #3b82f6; 
  --btn-accent: #f43f5e; 
  --btn-font-size: 16px; 

  font-family: system-ui, -apple-system, sans-serif;
  font-size: var(--btn-font-size);
  padding: 0.9em 2em;
  border-radius: 0.75em;
  border: none;
  background: var(--btn-bg);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 0.5em 1.5em -0.5em rgba(133, 83, 244, 0.4);
  width: 100%; 
  margin-top: 10px;

  &:focus-visible {
    outline: 2px solid var(--btn-primary);
    outline-offset: 4px;
  }

  &:active {
    transform: scale(0.96);
  }

  &::before {
    content: "";
    position: absolute;
    inset: -4px;
    z-index: 0;
    background: conic-gradient(
      from 0deg,
      var(--btn-bg) 0deg,
      var(--btn-primary) 60deg,
      var(--btn-secondary) 120deg,
      var(--btn-bg) 180deg,
      var(--btn-accent) 240deg,
      var(--btn-primary) 300deg,
      var(--btn-bg) 360deg
    );
    border-radius: 0.75em;
    animation: ${rotateNebula} 4s linear infinite;
    filter: blur(8px);
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
    animation-duration: 2s;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: var(--btn-bg);
    border-radius: 0.6em;
    z-index: 1;
  }

  &:hover ${GalaxyBtnIcon} {
    transform: translateX(0.25em) rotate(-10deg);
  }

  &:hover ${GalaxyBtnStars} {
    opacity: 0.8;
    animation: ${starDrift} 5s linear infinite alternate;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;