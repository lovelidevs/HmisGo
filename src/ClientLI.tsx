import React from "react";
import {Text, View} from "react-native";

import dayjs from "dayjs";
import BouncyCheckbox from "react-native-bouncy-checkbox";

import {ContactService} from "./ContactEditor/ContactEditor";
import {Contact} from "./MainView";
import {Client} from "./NewClientView";

const clientToString = (client: Client) => {
  let result = client.lastName + " " + client.firstName;

  if (client.alias) result += " (" + client.alias + ")";
  if (client.hmisID) result += " " + client.hmisID;

  return result;
};

const contactToString = (contact: Contact) => {
  let result =
    dayjs(contact.timestampAsString).format("h:mm A") +
    (contact.locationCategory && " @ " + contact.location);

  if (contact.services.length > 0)
    result += "\n" + servicesToString(contact.services);

  return result;
};

const servicesToString = (services: ContactService[]) => {
  const result: string[] = [];

  for (const service of services) {
    let text = service.service;

    if (service.count || service.list)
      text +=
        " (" +
        ((): string => {
          if (service.count) return service.count + " " + service.units;
          if (service.list) return service.list.join(", ");
          return "";
        })() +
        ")";

    result.push(text);
  }

  return result.join(", ");
};

const ClientLI = ({
  client,
  isChecked,
  onCheckboxPress,
  contact,
  onEditPress,
}: {
  client: Client;
  isChecked: boolean;
  onCheckboxPress: (checked: boolean) => void;
  contact?: Contact;
  onEditPress?: (contactClientIdAsString: string) => void;
}) => {
  return (
    <View className="flex flex-row flex-nowrap justify-start items-center">
      <BouncyCheckbox
        disableBuiltInState={true}
        isChecked={isChecked}
        onPress={onCheckboxPress}
      />
      <View className="shrink flex flex-col col-nowrap justify-start items-start">
        <Text className={`text-base text-black ${isChecked && "font-bold"}`}>
          {clientToString(client)}
        </Text>
        {isChecked && contact && onEditPress && (
          <Text
            className="shrink text-base text-black border border-orange-300 rounded-lg bg-white p-2 mt-1"
            onPress={() => onEditPress(contact.clientIdAsString)}>
            {contactToString(contact)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ClientLI;
