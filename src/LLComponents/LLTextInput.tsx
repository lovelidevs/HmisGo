import React from "react";
import {TextInput} from "react-native";

const LLTextInput = ({
  value,
  onChange,
  placeholder,
  type,
  multiline,
  twStyle,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  twStyle?: string;
}) => {
  return (
    <TextInput
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor="lightgrey"
      value={value}
      onChangeText={onChange}
      autoCapitalize="none"
      className={`rounded-lg border border-gray-300 text-lg p-2 text-black bg-white ${twStyle}`}
      {...(type === "email" && {keyboardType: "email-address"})}
      {...(type === "password" && {secureTextEntry: true})}
    />
  );
};

export default LLTextInput;
