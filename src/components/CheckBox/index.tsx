import React from "react";
import styled from "styled-components";

type BaseProps = {
  label: string;
};

type ControlledProps = BaseProps & {
  checked?: boolean;
  defaultChecked?: never;
};

type UncontrolledProps = BaseProps & {
  checked?: never;
  defaultChecked?: boolean;
};

type Props = ControlledProps | UncontrolledProps;

const Checkbox: React.FC<Props> = ({ checked, defaultChecked, label }) => (
  <CheckboxWrapper>
    <CheckboxCustom>
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
      />
      <CheckMark className="checkmark" />
    </CheckboxCustom>
    <Label>{label}</Label>
  </CheckboxWrapper>
);

const Label = styled.label`
  cursor: pointer;
`;

const CheckboxCustom = styled.div`
  display: block;
  position: relative;
  width: 18px;
  height: 18px;
  margin: 0 8px 0 0;

  input[type="checkbox"] {
    position: absolute;
    display: none;
    width: 100%;
    height: 100%;
  }

  input[type="checkbox"]:checked + .checkmark:after {
    content: "";
    position: absolute;
    left: 5px;
    top: 3.5px;
    height: 5.5px;
    width: 3px;
    border: solid #fff;
    border-width: 0px 2px 2px 0px;
    transform: rotate(45deg);
  }

  input[type="checkbox"]:checked + .checkmark {
    background: #3a86ff;
    border: 1.5px solid #3a86ff;
    box-sizing: border-box;
    box-shadow: 0 2px 6px 0 rgba(58, 134, 255, 0.39);
  }
`;

const CheckMark = styled.span`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  background: #fff;
  border: 1.5px solid #ccc;
  border-radius: 50%;
  box-sizing: border-box;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export default Checkbox;
