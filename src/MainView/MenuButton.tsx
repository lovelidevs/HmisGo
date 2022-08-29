import React, {useContext, useRef} from "react";
import {
  ActionSheetIOS,
  Alert,
  findNodeHandle,
  Platform,
  Text,
  UIManager,
} from "react-native";

import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import "react-native-get-random-values";
import {ObjectId} from "bson";
import dayjs from "dayjs";

import {AuthContext} from "../Authentication/AuthProvider";
import {Contact, ContactService} from "../ContactEditor/ContactEditorNavigator";
import LLHeaderButton from "../LLComponents/LLHeaderButton";
import {RootStackParamList} from "../NavigationStack";
import {RealmStateContext} from "../RealmStateProvider";
import {Client, ClientContact, ClientService} from "./NewClientView";

const MenuButton = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "HmisGo",
    undefined
  >;
}) => {
  const auth = useContext(AuthContext);
  const realmState = useContext(RealmStateContext);

  const cityFromUUID = (cityUUID: string): string | undefined => {
    const result = realmState?.locations?.cities?.find(
      city => city.uuid === cityUUID,
    );
    return result ? result.city : undefined;
  };

  const locationCategoryFromUUIDs = (
    cityUUID: string,
    locationCategoryUUID: string,
  ): string | undefined => {
    const result = realmState?.locations?.cities
      ?.find(city => city.uuid === cityUUID)
      ?.categories?.find(cat => cat.uuid === locationCategoryUUID);
    return result ? result.category : undefined;
  };

  const clientServicesFromContactServices = (
    contactServices: ContactService[],
  ): ClientService[] | undefined => {
    if (contactServices.length === 0) return undefined;

    const clientServices: ClientService[] = [];
    for (const service of contactServices)
      clientServices.push({
        service: service.service,
        text: service.text ? service.text : undefined,
        count: service.count ? service.count : undefined,
        units: service.units ? service.units : undefined,
        list: service.list ? service.list : undefined,
      });
    return clientServices;
  };

  const clientContactFromContact = (contact: Contact): ClientContact => {
    return {
      date: dayjs(contact.timestamp).format("YYYY-MM-DD"),
      time: contact.timestamp,
      city: cityFromUUID(contact.cityUUID),
      locationCategory: locationCategoryFromUUIDs(
        contact.cityUUID,
        contact.locationCategoryUUID,
      ),
      location: contact.location ? contact.location : undefined,
      services: clientServicesFromContactServices(contact.services),
    };
  };

  const submitDailyList = () => {
    const errorAlert = () =>
      Alert.alert("Realm Error", "Unable to submit list. Please try again.");

    if (!realmState?.dailyList) return errorAlert();

    if (realmState.dailyList.note && realmState.dailyList.note?.length > 0)
      try {
        auth?.realm?.write(() => {
          auth?.realm?.create("note", {
            _id: new ObjectId(),
            organization: auth.organization,
            datetime: dayjs.utc().toISOString(),
            content: realmState.dailyList!.note,
          });
        });
      } catch (error) {
        return Alert.alert("", String(error));
      }

    if (
      realmState.dailyList.contacts &&
      realmState.dailyList.contacts.length > 0
    )
      for (const contact of realmState.dailyList.contacts)
        try {
          auth?.realm?.write(() => {
            const clients = auth?.realm
              ?.objects("client")
              .filtered(`_id == oid(${contact.clientId.toString()})`);

            if (!clients || clients.length === 0) return errorAlert();
            const client = clients[0] as unknown as Client;

            const clientcontact = clientContactFromContact(contact);

            if (client.serviceHistory)
              client.serviceHistory.push(clientcontact);
            else client.serviceHistory = [clientcontact];
          });
        } catch (error) {
          return Alert.alert("", String(error));
        }

    try {
      auth?.realm?.write(() => {
        const dailyListObject = realmState.getDailyListRealmObject();
        auth?.realm?.delete(dailyListObject);
      });

      realmState.setDailyListId(null);
    } catch (error) {
      return Alert.alert("", String(error));
    }
  };

  const menuItems = ["Submit", "New Client", "Logout"];

  const handlePress = (buttonIndex: number | undefined) => {
    switch (buttonIndex) {
      case 0:
        submitDailyList();
        break;
      case 1:
        navigation.navigate("NewClient");
        break;
      case 2:
        auth?.logOut();
        break;
    }
  };

  const node = useRef<Text>(null);

  return (
    <LLHeaderButton
      ref={node}
      title="☰"
      onPress={() => {
        const nodeHandle = findNodeHandle(node.current);
        if (!nodeHandle) return;

        if (Platform.OS === "ios")
          ActionSheetIOS.showActionSheetWithOptions(
            {
              anchor: nodeHandle,
              options: [...menuItems, "Cancel"],
              cancelButtonIndex: menuItems.length,
            },
            handlePress,
          );

        if (Platform.OS === "android")
          UIManager.showPopupMenu(
            nodeHandle,
            menuItems,
            () => {
              /* TODO */
            },
            (item: string, index: number | undefined) => handlePress(index),
          );
      }}
    />
  );
};

export default MenuButton;
