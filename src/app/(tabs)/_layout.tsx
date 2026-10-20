import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0284c7",
        tabBarInactiveTintColor: "#64748b",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat & Tersimpan",
          tabBarLabel: "Riwayat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan Aplikasi",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang Aplikasi",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "information-circle" : "information-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}