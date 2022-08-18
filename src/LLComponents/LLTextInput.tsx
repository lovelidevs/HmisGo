import React from "react";
import {TextInput} from "react-native";

const LLTextInput = ({
  type,
  value,
  onChange,
  placeholder,
  styles,
}: {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  styles?: string;
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="lightgrey"
      defaultValue={value}
      onChangeText={onChange}
      className={`rounded-lg border text-lg p-2 text-black bg-white ${styles}`}
      {...(type === "email" && {keyboardType: "email-address"})}
      {...(type === "password" && {secureTextEntry: true})}
    />
  );
};

export default LLTextInput;
