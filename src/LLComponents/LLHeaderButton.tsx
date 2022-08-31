import React, {ReactElement} from "react";
import {Pressable, Text, View} from "react-native";

import {useTailwind} from "tailwindcss-react-native";

import {TW_CYAN_300, TW_CYAN_400} from "../Theme";

type LLHeaderButtonProps = {
  onPress: () => void;
  title?: string;
  children?: ReactElement;
};

const LLHeaderButton = React.forwardRef<Text, LLHeaderButtonProps>(
  ({onPress, title, children}, ref) => {
    const tw = useTailwind();
    const baseTextStyle = "text-2xl";

    return (
      <Pressable onPress={onPress}>
        {({pressed}) => {
          if (title)
            return (
              <Text
                ref={ref}
                style={
                  pressed
                    ? tw(`${baseTextStyle} text-cyan-400`)
                    : tw(`${baseTextStyle} text-cyan-300`)
                }>
                {title}
              </Text>
            );
          if (children)
            return (
              <View className="w-6 h-6">
                {React.cloneElement(children, {
                  color: pressed ? TW_CYAN_400 : TW_CYAN_300,
                })}
              </View>
            );
        }}
      </Pressable>
    );
  },
);

export default LLHeaderButton;
