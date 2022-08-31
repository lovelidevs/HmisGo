import React from "react";
import {Platform, Pressable, Switch, Text, View} from "react-native";

import LLNumberInput from "../LLComponents/LLNumberInput";
import {TW_CYAN_300, TW_CYAN_400, TW_GRAY_300, TW_GRAY_500} from "../Theme";

export enum InputType {
  TOGGLE = "Toggle",
  COUNTER = "Counter",
  TEXTBOX = "Textbox",
  LOCATIONS = "Locations",
  CUSTOM_LIST = "Custom List",
}

type SwitchStyleProps = {
  trackColor: {true: string; false: string};
  thumbColor: string;
  ios_backgroundColor?: string;
};

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
      <View
        className={
          "flex flex-row flex-nowrap justify-between items-center rounded-lg p-4 bg-gray-800 space-x-2"
        }>
        <Text className={"shrink text-lg text-cyan-300 font-bold"}>
          {label}
        </Text>
        {(() => {
          if (inputType === InputType.TOGGLE)
            return (
              <Switch
                value={toggleValue}
                onValueChange={onToggleChange}
                {...((): SwitchStyleProps => {
                  const switchStyleProps: SwitchStyleProps = {
                    trackColor: {true: TW_CYAN_400, false: TW_GRAY_500},
                    thumbColor: toggleValue ? TW_CYAN_300 : TW_GRAY_300,
                  };

                  if (Platform.OS === "ios")
                    switchStyleProps.ios_backgroundColor = TW_GRAY_500;

                  return switchStyleProps;
                })()}
              />
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

          return (
            <Text className={"text-2xl text-cyan-300 font-bold"}>{"›"}</Text>
          );
        })()}
      </View>
    </Pressable>
  );
};

export default ContactEditorLI;

//
