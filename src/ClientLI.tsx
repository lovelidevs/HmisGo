import React from "react";
import {Text, View} from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";

import {Client} from "./NewClientView";

const clientToString = (client: Client) => {
  let result = client.lastName + " " + client.firstName;

  if (client.alias) result += " (" + client.alias + ")";
  if (client.hmisID) result += " " + client.hmisID;

  return result;
};

// TODO: Eventually disableBuiltInState of the checkbox

const ClientLI = ({
  client,
  isChecked,
  onPress,
}: {
  client: Client;
  isChecked: boolean;
  onPress: (checked: boolean) => void;
}) => {
  return (
    <View className="flex flex-row flex-nowrap justify-start items-center">
      <BouncyCheckbox
        disableBuiltInState={true}
        isChecked={isChecked}
        onPress={onPress}
      />
      <Text className="text-black">{clientToString(client)}</Text>
    </View>
  );
};

export default ClientLI;
