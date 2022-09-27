import React, {useContext, useEffect, useState} from "react";
import {Alert, ScrollView, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";

import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import {ContactService} from "../Realm/DailyListProvider";
import {
  Service,
  ServiceCategory,
  ServiceContext,
} from "../Realm/ServiceProvider";
import ContactEditorLI, {InputType} from "./ContactEditorLI";
import {ContactEditorStackParamList} from "./ContactEditorNavigator";
import {ContactEditorContext} from "./ContactEditorProvider";

const CategoryEditor = ({
  navigation,
  route,
}: NativeStackScreenProps<ContactEditorStackParamList, "CategoryEditor">) => {
  const {categoryUUID} = route.params;

  const serviceContext = useContext(ServiceContext);
  const editorContext = useContext(ContactEditorContext);

  const [category, setCategory] = useState<ServiceCategory | null>(null);

  useEffect(() => {
    if (category || !serviceContext?.services) return;

    const result = serviceContext.services.categories?.find(
      cat => cat.uuid === categoryUUID,
    );

    if (!result) return Alert.alert("", "Unable to find services category");

    navigation.setOptions({title: result.category});
    setCategory(result);
  }, [category, serviceContext?.services, categoryUUID, navigation]);

  if (!category || !editorContext?.contact) return <LLActivityIndicatorView />;

  const toggleProps = (
    service: Service,
  ): {
    toggleValue: boolean;
    onToggleChange: (value: any) => void;
  } => {
    return {
      toggleValue: (() => {
        const contactService = editorContext.contact?.services?.find(
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
    <SafeAreaView>
      <ScrollView>
        <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2 mx-2 mb-4">
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
                      default:
                        return {
                          onPress: () =>
                            navigation.navigate("ServiceEditor", {
                              categoryUUID: categoryUUID,
                              serviceUUID: service.uuid,
                            }),
                        };
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
