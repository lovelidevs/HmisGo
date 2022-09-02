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

import {AuthContext} from "../Authentication/AuthProvider";
import LLHeaderButton from "../LLComponents/LLHeaderButton";
import {RootStackParamList} from "../NavigationStack";
import {DailyListContext} from "../Realm/DailyListProvider";

const MenuButton = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "HmisGo",
    undefined
  >;
}) => {
  const authContext = useContext(AuthContext);
  const dailyListContext = useContext(DailyListContext);

  const submit = () => {
    if (!dailyListContext) Alert.alert("", "Unable to connect to daily list");

    try {
      dailyListContext?.submitDailyList();
    } catch (error) {
      Alert.alert("", String(error));
    }
  };

  const menuItems = ["Submit", "New Client", "Review", "Logout"];

  const handlePress = (buttonIndex: number | undefined) => {
    switch (buttonIndex) {
      case 0:
        submit();
        break;
      case 1:
        navigation.navigate("NewClient");
        break;
      case 2:
        navigation.navigate("Review");
        break;
      case 3:
        authContext?.logOut();
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
