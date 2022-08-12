import {useState} from "react";

import {Button, TextInput, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

//import {AuthContext} from "./AuthProvider";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  //const authContext = useContext(AuthContext);

  return (
    <SafeAreaView className="p-2">
      <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2">
        <TextInput
          placeholder="email"
          keyboardType="email-address"
          className="border text-lg p-2"
          defaultValue={email}
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          className="border text-lg p-2"
          defaultValue={password}
          onChangeText={text => setPassword(text)}
        />
        <View>
          {/* TODO: https://reactnative.dev/docs/pressable */}
          <Button title="Forgot Password?" onPress={() => {}} />
        </View>
        <View className="flex flex-row flex-wrap justify-evenly items-center">
          <Button title="Log In" onPress={() => {}} />
          <Button title="Sign Up" onPress={() => {}} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
