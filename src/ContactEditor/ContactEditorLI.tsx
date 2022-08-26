import React from "react";
import {Pressable, Switch, Text, View} from "react-native";

import LLNumberInput from "../LLComponents/LLNumberInput";

export enum InputType {
  TOGGLE = "Toggle",
  COUNTER = "Counter",
  TEXTBOX = "Textbox",
  LOCATIONS = "Locations",
  CUSTOM_LIST = "Custom List",
}

const ContactEditorLI = ({
  label,
  onPress,
  inputType,
  count,
  units,
  onCountChange,
}: {
  label: string;
  onPress?: () => void;
  inputType?: string;
  count?: number;
  onCountChange?: (count: number) => void;
  units?: string;
}) => {
  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-row flex-nowrap justify-between items-center rounded-lg border p-4 bg-orange-200 space-x-12">
        <Text className="shrink text-lg text-black">{label}</Text>
        {(() => {
          if (inputType === InputType.TOGGLE)
            return (
              <Switch
                value={false}
                onValueChange={value => console.log(value)}
              />
            );

          if (inputType === InputType.COUNTER && count && onCountChange)
            return (
              <View className="flex flex-col flex-nowrap justify-start items-center">
                {units && (
                  <Text className="text-base text-black mb-2 font-bold">
                    {units + ":"}
                  </Text>
                )}
                <LLNumberInput value={count} onChange={onCountChange} />
              </View>
            );

          return <Text className="text-2xl text-black font-bold">{"›"}</Text>;
        })()}
      </View>
    </Pressable>
  );
};

export default ContactEditorLI;

//
