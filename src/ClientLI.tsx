import React from "react";
import {Button, Text, View} from "react-native";

import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import BouncyCheckbox from "react-native-bouncy-checkbox";

import {Contact} from "./MainView";
import {RootStackParamList} from "./NavigationStack";
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
  contact,
  dailyListIdAsString,
  navigation,
}: {
  client: Client;
  isChecked: boolean;
  onPress: (checked: boolean) => void;
  contact?: Contact;
  dailyListIdAsString?: string;
  navigation?: NativeStackNavigationProp<
    RootStackParamList,
    "HmisGo",
    undefined
  >;
}) => {
  return (
    <View className="flex flex-row flex-nowrap justify-start items-center">
      <BouncyCheckbox
        disableBuiltInState={true}
        isChecked={isChecked}
        onPress={onPress}
      />
      <Text className="text-black">{clientToString(client)}</Text>
      {isChecked && contact && dailyListIdAsString && (
        <View className="ml-4">
          <Button
            title="+/-"
            onPress={() => {
              navigation?.navigate("ClientServiceNavigator", {
                screen: "ServiceEditor",
                params: {
                  contact,
                  dailyListIdAsString: dailyListIdAsString,
                },
              });
            }}
          />
        </View>
      )}
    </View>
  );
};

export default ClientLI;
