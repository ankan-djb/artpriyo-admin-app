import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CreateEventScreen from "./screens/CreateEventScreen ";
import TabNavigator from "./navigation/TabNavigator";
import UpcomingEvents from "./screens/UpcomingEvents";
import EditEventScreen from "./screens/EditEventScreen";
import ManageUsers from "./screens/ManageUsers";
import NotificationsScreen from "./screens/NotificationsScreen";
import AddAdministrator from "./screens/AddAdministrator";
import AdminLogin from "./screens/AdminLogin";
import ManageAdmin from "./screens/ManageAdmin";
import EditAdminPermissions from "./screens/EditAdminPermissions";
import Leaderboard from "./screens/Leaderboard";
import ReportedUsersScreen from "./screens/ReportedUsersScreen";
import ReportedPostsScreen from "./screens/ReportedPostsScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "BottomTab" : "AdminLogin"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="AdminLogin" component={AdminLogin} />
        <Stack.Screen name="BottomTab" component={TabNavigator} />
        <Stack.Screen
          name="CreateEvent"
          component={CreateEventScreen}
          options={{
            headerShown: true,
            title: "Create Event",
          }}
        />
        <Stack.Screen
          name="UpcomingEvents"
          component={UpcomingEvents}
          options={{
            headerShown: true,
            title: "Events",
          }}
        />
        <Stack.Screen
          name="EditEvent"
          component={EditEventScreen}
          options={{
            headerShown: true,
            title: "Edit Event",
          }}
        />
        <Stack.Screen
          name="ManageUsers"
          component={ManageUsers}
          options={{
            headerShown: true,
            title: "Users",
          }}
        />
        <Stack.Screen
          name="NotificationsScreen"
          component={NotificationsScreen}
          options={{
            headerShown: true,
            title: "Notifications",
          }}
        />
        <Stack.Screen
          name="AddAdministrator"
          component={AddAdministrator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageAdmin"
          component={ManageAdmin}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditAdminPermissions"
          component={EditAdminPermissions}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{
            headerShown: true,
            title: "Leaderboard",
          }}
        />
        <Stack.Screen
          name="ReportedUsers"
          component={ReportedUsersScreen}
          options={{
            headerShown: true,
            title: "Reported Users",
          }}
        />
        <Stack.Screen
          name="ReportedPosts"
          component={ReportedPostsScreen}
          options={{
            headerShown: true,
            title: "Reported Posts",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
