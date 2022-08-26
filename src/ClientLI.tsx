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
        "(" +
        (service.count && service.count + " " + service.units) +
        (service.count && service.list && " ") +
        service.list?.join(", ") +
        ")";

    result.push(text);
  }

  return result;
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
      <View className="flex flex-col col-nowrap justify-start items-start">
        <Text className="text-base text-black">{clientToString(client)}</Text>
        {isChecked && contact && onEditPress && (
          <View className="rounded-lg border bg-white p-1">
            <Text
              className="text-base text-black"
              onPress={() => onEditPress(contact.clientIdAsString)}>
              {contactToString(contact)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ClientLI;
