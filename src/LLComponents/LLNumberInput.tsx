import React from "react";

import InputSpinner from "react-native-input-spinner";

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
      color="lightgreen"
    />
  );
};

export default LLNumberInput;
