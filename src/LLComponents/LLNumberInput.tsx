import React from "react";

import InputSpinner from "react-native-input-spinner";

import {TW_CYAN_300} from "../Theme";

const LLNumberInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  return (
    <InputSpinner
      value={value}
      onChange={onChange}
      skin="modern"
      color={TW_CYAN_300}
    />
  );
};

export default LLNumberInput;
