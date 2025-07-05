import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CreateEventScreen from "../screens/CreateEventScreen ";
import DashboardScreen from "../screens/DashboardScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Custom Header Component
const CustomHeader = () => {
  const navigation = useNavigation();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const adminData = await AsyncStorage.getItem('adminData');
        if (adminData) {
          const parsedData = JSON.parse(adminData);
          setAdminName(parsedData.name || 'Admin');
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    loadAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('adminToken');
      await AsyncStorage.removeItem('adminData');
      navigation.replace('AdminLogin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.userIconContainer}>
        <Ionicons name="person-circle-outline" size={32} color="#ff5733" />
      </View>
      <Text style={styles.headerText}>Hello, {adminName}</Text>
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#ff5733" />
      </TouchableOpacity>
    </View>
  );
};

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Transactions")
            iconName = focused ? "receipt" : "receipt-outline";
          else if (route.name === "Settings")
            iconName = focused ? "settings" : "settings-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#ff5733", // Professional Orange-Red
        tabBarInactiveTintColor: "#aaaaaa", // Softer Gray
        headerTitle: () => <CustomHeader />,
        headerStyle: { backgroundColor: "#f8f8f8" },
        tabBarStyle: styles.floatingTabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Settings" component={CreateEventScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // Header styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: '100%',
    paddingHorizontal: 10,
  },
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 51, 0.1)',
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    color: '#333',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 87, 51, 0.1)',
  },

  // Floating Bottom Tab Styles
  floatingTabBar: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "#333", // Updated Dark Gray Background
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    paddingTop: 10,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
