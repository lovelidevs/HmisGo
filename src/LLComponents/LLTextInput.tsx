import React from "react";
import {TextInput} from "react-native";

const LLTextInput = ({
  value,
  onChange,
  placeholder,
  type,
  multiline,
  twStyles,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  twStyles?: string;
}) => {
  return (
    <TextInput
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor="lightgrey"
      value={value}
      onChangeText={onChange}
      autoCapitalize="none"
      className={`rounded-lg border text-lg p-2 text-black bg-white ${twStyles}`}
      {...(type === "email" && {keyboardType: "email-address"})}
      {...(type === "password" && {secureTextEntry: true})}
    />
  );
};

export default LLTextInput;
