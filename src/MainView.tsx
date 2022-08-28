import React, {useContext, useEffect, useRef, useState} from "react";
import {
  ActionSheetIOS,
  Alert,
  Button,
  findNodeHandle,
  Platform,
  ScrollView,
  UIManager,
  View,
} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import {AuthContext} from "./Authentication/AuthProvider";
import ClientLI from "./ClientLI";
import {Contact, ContactService} from "./ContactEditor/ContactEditor";
import LLActivityIndicatorView from "./LLComponents/LLActivityIndicatorView";
import LLTextInput from "./LLComponents/LLTextInput";
import LocationPickers from "./LocationPickers";
import {RootStackParamList} from "./NavigationStack";
import {Client, ClientContact, ClientService} from "./NewClientView";
import {RealmStateContext} from "./RealmStateProvider";

dayjs.extend(utc);

export type DailyList = {
  _id: ObjectId;
  organization: string;
  creator: string;
  timestamp: string;
  note: string[] | null;
  contacts: Contact[] | null;
};

const MainView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HmisGo">) => {
  const tw = useTailwind();

  const auth = useContext(AuthContext);
  const realmState = useContext(RealmStateContext);

  const [cityUUID, setCityUUID] = useState<string>("");
  const [locationCategoryUUID, setLocationCategoryUUID] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const menuButton = useRef<Button>(null);

  useEffect(() => {
    if (!realmState) return;
    if (!realmState.dailyListId) navigation.goBack();
  }, [navigation, realmState, realmState?.dailyListId]);

  useEffect(() => {
    const cityFromUUID = (uuid: string): string | undefined => {
      const result = realmState?.locations?.cities?.find(
        city => city.uuid === uuid,
      );
      return result ? result.city : undefined;
    };

    const locationCategoryFromUUIDs = (
      uuidCity: string,
      uuidLocationCategory: string,
    ): string | undefined => {
      const result = realmState?.locations?.cities
        ?.find(city => city.uuid === uuidCity)
        ?.categories?.find(cat => cat.uuid === uuidLocationCategory);
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
          const dailyLists = auth?.realm
            ?.objects("dailylist")
            .filtered(`_id == oid(${realmState?.dailyListId?.toString()})`);

          if (!dailyLists || dailyLists.length === 0) return errorAlert();
          const dailyList = dailyLists[0];

          auth?.realm?.delete(dailyList);
        });

        realmState.setDailyListId(null);
      } catch (error) {
        return Alert.alert("", String(error));
      }
    };

    const handlePress = (index: number | undefined) => {
      switch (index) {
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

    navigation.setOptions({
      headerRight: () => (
        <Button
          ref={menuButton}
          title="☰"
          onPress={() => {
            const node = findNodeHandle(menuButton.current);
            if (!node) return;

            const menuItems = ["Submit", "New Client", "Logout"];

            if (Platform.OS === "ios")
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  anchor: node,
                  options: [...menuItems, "Cancel"],
                  cancelButtonIndex: 3,
                },
                (index: number) => handlePress(index),
              );

            if (Platform.OS === "android")
              UIManager.showPopupMenu(
                node,
                menuItems,
                () => Alert.alert("", "Unable to open pop up menu"),
                (item: string, index: number | undefined) => handlePress(index),
              );
          }}
        />
      ),
    });
  }, [navigation, auth, realmState]);

  // TODO: Change the clients into a flatlist

  const clientMapFn = (client: Client, isChecked: boolean) => {
    if (!realmState?.dailyList) return;

    return (
      <View key={String(client._id)}>
        <ClientLI
          client={client}
          isChecked={isChecked}
          onCheckboxPress={() => {
            let contactsClone = cloneDeep(realmState?.dailyList?.contacts);
            if (!contactsClone) contactsClone = [];

            if (isChecked) {
              const index = contactsClone.findIndex(
                contact =>
                  contact.clientId.toString() === client._id.toString(),
              );
              contactsClone.splice(index, 1);
            } else
              contactsClone.push({
                clientId: client._id,
                timestamp: dayjs.utc().toISOString(),
                cityUUID,
                locationCategoryUUID,
                location,
                services: [],
              });

            realmState.updateDailyListContacts(contactsClone);
          }}
          contact={
            isChecked
              ? realmState.dailyList.contacts?.find(
                  contact =>
                    contact.clientId.toString() === client._id.toString(),
                )
              : undefined
          }
          onEditPress={
            isChecked
              ? clientId =>
                  navigation.navigate("ContactEditorNavigator", {
                    contactClientIdAsString: clientId.toString(),
                  })
              : undefined
          }
        />
      </View>
    );
  };

  if (
    !realmState ||
    !realmState.clients ||
    !realmState.locations ||
    !realmState.services ||
    !realmState.dailyList
  )
    return <LLActivityIndicatorView />;

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch",
        )}>
        <LLTextInput
          value={
            realmState.dailyList.note
              ? realmState.dailyList.note?.join("\n")
              : ""
          }
          onChange={
            value =>
              realmState.updateDailyListNote(value ? value.split("\n") : []) // TODO: need to debounce this
          }
          placeholder="NOTES"
          multiline={true}
          twStyles="mb-4"
        />
        <LocationPickers
          value={{
            cityUUID,
            locationCategoryUUID,
            location,
          }}
          onChange={value => {
            setCityUUID(value.cityUUID);
            setLocationCategoryUUID(value.locationCategoryUUID);
            setLocation(value.location);
          }}
          locations={realmState.locations}
        />
        <View className="space-y-4 my-6">
          {(() => {
            const selectedClients: Client[] = [];
            const unselectedClients: Client[] = [];

            const contactIds = [];
            if (realmState.dailyList.contacts)
              for (const contact of realmState.dailyList.contacts)
                contactIds.push(contact.clientId.toString());

            for (const client of realmState.clients)
              if (contactIds.includes(client._id.toString()))
                selectedClients.push(client);
              else unselectedClients.push(client);

            return [
              selectedClients.map(client => clientMapFn(client, true)),
              unselectedClients.map(client => clientMapFn(client, false)),
            ];
          })()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainView;
