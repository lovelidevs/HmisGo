import React from "react";
import {Platform, Text, View} from "react-native";

import "react-native-get-random-values";
import CheckBox from "@react-native-community/checkbox";
import {ObjectId} from "bson";
import dayjs from "dayjs";

import {Client} from "../Realm/ClientProvider";
import {Contact, ContactService} from "../Realm/DailyListProvider";
import {TW_CYAN_300, TW_CYAN_400} from "../Theme";

const clientToString = (client: Client) => {
  let stringArray = [client.lastName, client.firstName];

  if (client.alias) stringArray.push("(" + client.alias + ")");
  if (client.hmisID) stringArray.push(client.hmisID);

  return stringArray.join(" ");
};

const contactToString = (contact: Contact) => {
  let result =
    dayjs(contact.timestamp).format("h:mm A") +
    (contact.location && " @ " + contact.location);

  if (contact.services.length > 0)
    result += "\n" + servicesToString(contact.services);

  return result;
};

const servicesToString = (services: ContactService[]) => {
  const result: string[] = [];

  for (const service of services) {
    let text = service.service;

    if (
      service.text ||
      service.count ||
      (service.list && service.list.length > 0)
    )
      text +=
        " (" +
        ((): string => {
          if (service.text) return service.text;
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
  onEditPress?: (ClientId: ObjectId) => void;
}) => {
  // TW_CYAN-300

  return (
    <View className="flex flex-row flex-nowrap justify-start items-center">
      <CheckBox
        value={isChecked}
        onValueChange={onCheckboxPress}
        {...(Platform.OS === "android" && {
          tintColors: {true: TW_CYAN_300, false: TW_CYAN_400},
        })}
        {...(Platform.OS === "ios" && {
          tintColor: TW_CYAN_400,
          onTintColor: TW_CYAN_400,
          onCheckColor: "white",
          onFillColor: TW_CYAN_300,
        })}
      />
      <View className="shrink flex flex-col col-nowrap justify-start items-start ml-3">
        <Text className={`text-base text-black ${isChecked && "font-bold"}`}>
          {clientToString(client)}
        </Text>
        {isChecked && contact && onEditPress && (
          <Text
            className={
              "shrink text-base text-black border border-gray-300 rounded-lg bg-white p-2 mt-1"
            }
            onPress={() => onEditPress(contact.clientId)}>
            {contactToString(contact)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ClientLI;
