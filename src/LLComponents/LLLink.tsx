import React from "react";
import {Pressable, Text, View} from "react-native";

const LLLink = ({title, onPress}: {title: string; onPress: () => void}) => {
  return (
    <View className="flex flex-row flex-nowrap justify-start items-center">
      <Pressable onPress={onPress}>
        <Text className="underline text-gray-800 text-lg p-2">{title}</Text>
      </Pressable>
    </View>
  );
};

export default LLLink;
