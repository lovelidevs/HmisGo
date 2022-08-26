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
  toggleValue,
  onToggleChange,
  count,
  onCountChange,
}: {
  label: string;
  onPress?: () => void;
  inputType?: string;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  count?: number;
  onCountChange?: (count: number) => void;
}) => {
  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-row flex-nowrap justify-between items-center rounded-lg border p-4 bg-orange-200 space-x-2">
        <Text className="shrink text-lg text-black">{label}</Text>
        {(() => {
          if (inputType === InputType.TOGGLE)
            return (
              <Switch value={toggleValue} onValueChange={onToggleChange} />
            );

          if (
            inputType === InputType.COUNTER &&
            count !== undefined &&
            onCountChange
          )
            return (
              <View>
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
