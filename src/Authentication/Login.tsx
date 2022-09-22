import React, {useContext, useState} from "react";
import {Alert, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {SafeAreaView} from "react-native-safe-area-context";

import LLButton from "../LLComponents/LLButton";
import LLLink from "../LLComponents/LLLink";
import LLTextInput from "../LLComponents/LLTextInput";
import {RootStackParamList} from "../NavigationStack";
import {AuthContext} from "./AuthProvider";

const Login = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Login">) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const authContext = useContext(AuthContext);

  return (
    <SafeAreaView className="px-6">
      <View className="h-full flex flex-col flex-nowrap justify-center items-stretch">
        <View>
          <LLTextInput
            value={email}
            onChange={value => setEmail(value)}
            placeholder="email"
            type="email"
          />
        </View>
        <View className="mt-4">
          <LLTextInput
            value={password}
            onChange={value => setPassword(value)}
            placeholder="password"
            type="password"
          />
        </View>
        <View>
          <LLLink
            title="Forgot/Reset Password"
            onPress={() => {
              navigation.navigate("ResetPassword", {email: email});
            }}
          />
        </View>
        <View className="flex flex-row flex-wrap justify-evenly items-center mt-4">
          <LLButton
            title="Log In"
            onPress={async () => {
              try {
                await authContext?.logIn(email, password);
              } catch (error) {
                Alert.alert("", String(error));
              }
            }}
          />
          <LLButton
            title="Sign Up"
            onPress={() => {
              navigation.navigate("SignUp", {email: email});
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
