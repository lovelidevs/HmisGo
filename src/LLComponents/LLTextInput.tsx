import React from "react";
import {TextInput} from "react-native";

const LLTextInput = ({
  value,
  onChange,
  placeholder,
  type,
  twStyles,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  twStyles?: string;
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="lightgrey"
      value={value}
      onChangeText={onChange}
      className={`rounded-lg border text-lg p-2 text-black bg-white ${twStyles}`}
      {...(type === "email" && {keyboardType: "email-address"})}
      {...(type === "password" && {secureTextEntry: true})}
    />
  );
};

export default LLTextInput;
