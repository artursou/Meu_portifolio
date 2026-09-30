import styled from "styled-components";

export const ChartArea = styled.div`
  position: relative;
  width: 100%;

  svg {
    display: block;
    overflow: visible;
  }
  .bar-hit {
    cursor: pointer;
    outline: none;
  }
  .bar-hit:focus-visible rect.hit {
    stroke: #fff;
    stroke-width: 1;
  }
`;

export const Tooltip = styled.div`
  position: absolute;
  transform: translate(-50%, calc(-100% - 8px));
  background-color: #222;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: #fff;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;

  small {
    display: block;
    color: #aaa;
    font-size: 12px;
  }
`;
