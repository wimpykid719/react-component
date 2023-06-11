import React from "react";
import styled from "styled-components";

type Props = {
  onClick?: () => void;
};

const RemoveButton: React.FC<Props> = ({ onClick }) => (
  <RemoveButtonWrapper>
    <Button onClick={onClick} />
  </RemoveButtonWrapper>
);

const Button = styled.button`
  display: block;
  padding: 0;
  border: none;
  position: relative;
  background-color: #ffebf3;
  border: 1.5px solid #ff006e;
  box-sizing: border-box;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  cursor: pointer;

  &:before,
  &:after {
    position: absolute;
    left: 2.5px;
    top: 6.3px;
    content: "";
    height: 2px; /* thickness of cross */
    width: 10px;
    background-color: #ff006e;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }

  &:focus {
    outline: none;
  }
`;

const RemoveButtonWrapper = styled.div`
  width: 18px;
  height: 18px;
  margin: 0px 8px 0px 0px;
`;

export default RemoveButton;
