import React from "react";
import {Pressable, Text, View} from "react-native";

const LLButton = ({title, onPress}: {title: string; onPress: () => void}) => {
  const twBaseStyle = "rounded-lg";

  return (
    <Pressable onPress={onPress}>
      {({pressed}) => (
        <View
          className={
            pressed
              ? twBaseStyle + " bg-cyan-400"
              : twBaseStyle + " bg-cyan-300"
          }>
          <Text className="text-lg font-bold text-center py-3 px-4 text-gray-800">
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default LLButton;
