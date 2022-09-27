import React, {useContext, useEffect, useState} from "react";
import {Alert, ScrollView, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";

import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import LLTextInput from "../LLComponents/LLTextInput";
import {ContactService} from "../Realm/DailyListProvider";
import {LocationContext} from "../Realm/LocationProvider";
import {Service, ServiceContext} from "../Realm/ServiceProvider";
import ContactEditorLI, {InputType} from "./ContactEditorLI";
import {ContactEditorStackParamList} from "./ContactEditorNavigator";
import {ContactEditorContext} from "./ContactEditorProvider";

const ServiceEditor = ({
  navigation,
  route,
}: NativeStackScreenProps<ContactEditorStackParamList, "ServiceEditor">) => {
  const {categoryUUID, serviceUUID} = route.params;

  const locationContext = useContext(LocationContext);
  const serviceContext = useContext(ServiceContext);
  const editorContext = useContext(ContactEditorContext);

  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    if (service || !serviceContext?.services) return;

    const category = serviceContext.services.categories?.find(
      cat => cat.uuid === categoryUUID,
    );
    if (!category) return Alert.alert("", "Unable to find services category");

    const result = category.services?.find(serv => serv.uuid === serviceUUID);
    if (!result) return Alert.alert("", "Unable to find service");

    navigation.setOptions({title: result.service});
    setService(result);
  }, [
    service,
    serviceContext?.services,
    categoryUUID,
    serviceUUID,
    navigation,
  ]);

  if (!service || !editorContext?.contact || !locationContext?.locations)
    return <LLActivityIndicatorView />;

  const toggleProps = (
    listItem: string,
  ): {toggleValue: boolean; onToggleChange: (value: boolean) => void} => {
    return {
      toggleValue: (() => {
        const contactService = editorContext.contact?.services?.find(
          serv => serv.uuid === service.uuid,
        );

        if (!contactService?.list) return false;
        if (contactService.list.includes(listItem)) return true;
        return false;
      })(),
      onToggleChange: value => {
        const contactClone = cloneDeep(editorContext.contact);

        if (!contactClone) return;

        const contactService = contactClone.services?.find(
          serv => serv.uuid === service.uuid,
        );

        if (!contactService) {
          contactClone.services.push({
            uuid: service.uuid,
            service: service.service,
            list: [listItem],
          });
          return editorContext.setContact(contactClone);
        }

        if (value)
          if (contactService.list) contactService.list.push(listItem);
          else contactService.list = [listItem];
        else if (contactService.list) {
          contactService.list.splice(contactService.list.indexOf(listItem), 1);
          if (contactService.list.length === 0)
            contactClone.services.splice(
              contactClone.services.indexOf(contactService),
              1,
            );
        }

        editorContext.setContact(contactClone);
      },
    };
  };

  return (
    <SafeAreaView>
      {((): JSX.Element => {
        switch (service.inputType) {
          case InputType.TEXTBOX:
            return (
              <View>
                <LLTextInput
                  value={((): string => {
                    const contactService =
                      editorContext?.contact?.services?.find(
                        serv => serv.uuid === service.uuid,
                      );

                    if (contactService?.text) return contactService.text;
                    else return "";
                  })()}
                  onChange={value => {
                    const contactClone = cloneDeep(editorContext.contact);

                    if (!contactClone) return;

                    const contactService: ContactService = {
                      uuid: service.uuid,
                      service: service.service,
                      text: value,
                    };

                    const index = contactClone.services.findIndex(
                      serv => serv.uuid === service.uuid,
                    );

                    if (index >= 0)
                      if (value) contactClone.services[index] = contactService;
                      else contactClone.services.splice(index, 1);
                    else if (value) contactClone.services.push(contactService);

                    editorContext.setContact(contactClone);
                  }}
                  multiline={true}
                  placeholder="DESCRIPTION"
                />
              </View>
            );
          case InputType.LOCATIONS:
            return (
              <ScrollView>
                <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2 mx-2 mb-4">
                  {locationContext.locations &&
                    locationContext.getAllLocations().map(listItem => (
                      <View key={listItem}>
                        <ContactEditorLI
                          label={listItem}
                          inputType={InputType.TOGGLE}
                          {...toggleProps(listItem)}
                        />
                      </View>
                    ))}
                </View>
              </ScrollView>
            );
          case InputType.CUSTOM_LIST:
            return (
              <ScrollView>
                <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2 mx-2 mb-4">
                  {service.customList?.map(listItem => (
                    <View key={listItem}>
                      <ContactEditorLI
                        label={listItem}
                        inputType={InputType.TOGGLE}
                        {...toggleProps(listItem)}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            );
          default:
            return <></>;
        }
      })()}
    </SafeAreaView>
  );
};

export default ServiceEditor;
