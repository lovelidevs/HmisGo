import React, {useContext, useEffect, useState} from "react";
import {Alert, Platform, ScrollView, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";

import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import {RealmStateContext} from "../RealmStateProvider";
import {ContactService, Service, ServiceCategory} from "./ContactEditor";
import ContactEditorLI, {InputType} from "./ContactEditorLI";
import {
  ContactEditorContext,
  ContactEditorStackParamList,
} from "./ContactEditorNavigator";

const CategoryEditor = ({
  navigation,
  route,
}: NativeStackScreenProps<ContactEditorStackParamList, "CategoryEditor">) => {
  const {categoryUUID} = route.params;

  const realmState = useContext(RealmStateContext);
  const editorContext = useContext(ContactEditorContext);

  const [category, setCategory] = useState<ServiceCategory | null>(null);

  useEffect(() => {
    if (category || !realmState?.services) return;

    const result = realmState.services.categories?.find(
      cat => cat.uuid === categoryUUID,
    );

    if (!result) return Alert.alert("", "Unable to find services category");

    navigation.setOptions({title: result.category});
    setCategory(result);
  }, [category, realmState?.services, categoryUUID, navigation]);

  if (!category || !editorContext?.contact) return <LLActivityIndicatorView />;

  const toggleProps = (
    service: Service,
  ): {
    toggleValue: boolean;
    onToggleChange: (value: any) => void;
  } => {
    return {
      toggleValue: (() => {
        const contactService = editorContext?.contact?.services?.find(
          serv => serv.uuid === service.uuid,
        );

        if (contactService) return true;
        return false;
      })(),
      onToggleChange: value => {
        const contactClone = cloneDeep(editorContext.contact);

        if (!contactClone) return;

        if (value)
          contactClone.services.push({
            uuid: service.uuid,
            service: service.service,
          });
        else {
          const index = contactClone.services.findIndex(
            serv => serv.uuid === service.uuid,
          );

          if (index >= 0) contactClone.services.splice(index, 1);
        }

        editorContext.setContact(contactClone);
      },
    };
  };

  const counterProps = (
    service: Service,
  ): {count: number; onCountChange: (count: number) => void} => {
    return {
      count: (() => {
        const count = editorContext?.contact?.services?.find(
          serv => serv.uuid === service.uuid,
        )?.count;

        if (!count) return 0;

        return count;
      })(),
      onCountChange: (count: number) => {
        const contactClone = cloneDeep(editorContext.contact);

        if (!contactClone) return;

        const contactService: ContactService = {
          uuid: service.uuid,
          service: service.service,
          count,
          units: service.units ? service.units : undefined,
        };

        const index = contactClone.services.findIndex(
          serv => serv.uuid === service.uuid,
        );

        if (index >= 0)
          if (count <= 0) contactClone.services.splice(index, 1);
          else contactClone.services[index] = contactService;
        else if (count > 0) contactClone.services.push(contactService);

        editorContext.setContact(contactClone);
      },
    };
  };

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView>
        <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2">
          {category.services &&
            category.services.map(service => (
              <View key={service.uuid}>
                <ContactEditorLI
                  label={service.service}
                  inputType={service.inputType}
                  {...(() => {
                    switch (service.inputType) {
                      case InputType.TOGGLE:
                        return toggleProps(service);
                      case InputType.COUNTER:
                        return counterProps(service);
                    }
                  })()}
                />
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryEditor;
