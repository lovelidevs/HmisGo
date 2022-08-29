import React from "react";
import {Pressable, Text} from "react-native";

const LLButton = ({title, onPress}: {title: string; onPress: () => void}) => {
  const twBaseStyle =
    "rounded-lg text-xl text-center font-bold py-3 px-4 text-gray-800";

  return (
    <Pressable onPress={onPress}>
      {({pressed}) => (
        <Text
          className={
            pressed
              ? `${twBaseStyle} bg-cyan-400`
              : `${twBaseStyle} bg-cyan-300`
          }>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default LLButton;
