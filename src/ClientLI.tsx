import React from "react";
import {Text, View} from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";

import {Client} from "./MainView";

const clientToString = (client: Client) => {
  let result = client.lastName + " " + client.firstName;

  if (client.alias) result += " (" + client.alias + ")";
  if (client.hmisID) result += " " + client.hmisID;

  return result;
};

// TODO: Eventually disableBuiltInState of the checkbox

const ClientLI = ({client, isActive}: {client: Client; isActive: boolean}) => {
  return (
    <View className="flex flex-row flex-nowrap justify-start items-center">
      <BouncyCheckbox isChecked={isActive} />
      <Text className="text-black">{clientToString(client)}</Text>
    </View>
  );
};

export default ClientLI;
