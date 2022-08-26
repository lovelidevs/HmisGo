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
    console.log(result);
  }, [category, realmState?.services, categoryUUID, navigation]);

  if (!category || !editorContext?.contact) return <LLActivityIndicatorView />;

  const updateCount = (
    services: ContactService[] | null,
    service: Service,
    count: number,
  ): ContactService[] => {
    const servicesClone = cloneDeep(services);

    const contactService: ContactService = {
      uuid: service.uuid,
      service: service.service,
      count,
      units: service.units ? service.units : undefined,
    };

    if (!servicesClone)
      if (count <= 0) return [];
      else return [contactService];

    const index = servicesClone.findIndex(serv => serv.uuid === service.uuid);

    if (index >= 0)
      if (count <= 0) {
        servicesClone.splice(index, 1);
        return servicesClone;
      } else {
        servicesClone[index] = contactService;
        return servicesClone;
      }
    else if (count <= 0) return servicesClone;
    else {
      servicesClone.push(contactService);
      return servicesClone;
    }
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
                  count={
                    service.inputType === InputType.COUNTER
                      ? (() => {
                          const result = editorContext?.contact?.services?.find(
                            serv => serv.uuid === service.uuid,
                          )?.count;

                          if (!result) return 0;

                          return result;
                        })()
                      : undefined
                  }
                  onCountChange={count => {
                    const contactClone = cloneDeep(editorContext.contact);

                    if (!contactClone) return;

                    contactClone.services = updateCount(
                      contactClone.services,
                      service,
                      count,
                    );

                    editorContext.setContact(contactClone);
                  }}
                  units={service.units ? service.units : undefined}
                />
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryEditor;
