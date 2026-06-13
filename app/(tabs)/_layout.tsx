import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import { FontSizes, FontWeights } from "@/constants/Typography";

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}

function TabIcon({ name, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={name}
        size={28}
        color={focused ? Colors.primary : Colors.innactive}
      />

      <Text style={[styles.label, focused && styles.labelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "navigate-circle" : "navigate-circle-outline"}
              label="Mapa"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "heart" : "heart-outline"}
              label="Pedidos"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              label="Perfil"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Layout.bottomTabHeight + 5,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",

    paddingTop: 20,
    paddingBottom: 18,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 6,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  label: {
    fontSize: 7,
    color: "#A0A0A0",
    fontWeight: "500",
  },

  labelActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
});