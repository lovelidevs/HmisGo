import React, {useMemo, useState} from "react";

import debounce from "lodash.debounce";

import LLTextInput from "./LLTextInput";

const LLDebouncedTextInput = ({
  initialValue,
  onChange,
  placeholder,
  type,
  multiline,
  twStyle,
}: {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "email" | "password";
  multiline?: boolean;
  twStyle?: string;
}) => {
  const [optimsticValue, setOptimsticValue] = useState<string>(initialValue);

  const debouncedOnChange = useMemo(
    () =>
      debounce(
        (value: string, onChangeFn: (value: string) => void) =>
          onChangeFn(value),
        300,
      ),
    [],
  );

  return (
    <LLTextInput
      value={optimsticValue}
      onChange={(value: string) => {
        setOptimsticValue(value);
        debouncedOnChange(value, onChange);
      }}
      placeholder={placeholder}
      type={type}
      multiline={multiline}
      twStyle={twStyle}
    />
  );
};

export default LLDebouncedTextInput;
