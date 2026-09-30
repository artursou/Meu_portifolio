import styled from "styled-components";

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  h2 {
    margin: 0;
    font-size: 20px;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #888;
  }
`;

export const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
`;

export const Tile = styled.div`
  background-color: #111;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px 20px;

  span {
    display: block;
    font-size: 13px;
    color: #aaa;
  }
  strong {
    display: block;
    margin-top: 6px;
    font-size: 28px;
    font-variant-numeric: tabular-nums;
  }
`;

export const Card = styled.section`
  background-color: #111;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;

  h3 {
    margin: 0 0 4px;
    font-size: 16px;
  }
`;

export const Hint = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  color: #888;
`;

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

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  font-variant-numeric: tabular-nums;

  th,
  td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid #222;
  }
  th {
    color: #aaa;
    font-weight: 600;
    font-size: 13px;
  }
  td {
    color: #ddd;
  }
`;

export const Pager = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 13px;
  color: #aaa;
`;
