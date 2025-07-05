import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [inAppNotification, setInAppNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Event Management Section */}
          <Text style={styles.sectionTitle}>Event Management</Text>
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[styles.card, styles.blueCard]}
              onPress={() => {
                navigation.navigate("CreateEvent");
              }}
            >
              <Ionicons name="add" size={30} color="#fff" />
              <Text style={styles.cardTextWhite}>Create Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                navigation.navigate("UpcomingEvents");
              }}
            >
              <Ionicons name="calendar" size={30} color="#4A90E2" />
              <Text style={styles.cardText}>Active Events</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                navigation.navigate("Leaderboard");
              }}
            >
              <Ionicons name="trophy" size={30} color="#D4AF37" />
              <Text style={styles.cardText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>

          {/* Administrator Management Section */}
          <Text style={styles.sectionTitle}>Administrator Management</Text>
          <View
            style={[
              styles.gridContainer,
              { justifyContent: "flex-start", columnGap: 20 },
            ]}
          >
            <TouchableOpacity
              style={[styles.card, styles.blueCard]}
              onPress={() => {
                navigation.navigate("AddAdministrator");
              }}
            >
              <Ionicons name="person-add" size={30} color="#fff" />
              <Text style={styles.cardTextWhite}>Add Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                navigation.navigate("ManageAdmin");
              }}
            >
              <Ionicons name="people" size={30} color="#4A90E2" />
              <Text style={styles.cardText}>Manage Admins</Text>
            </TouchableOpacity>
          </View>

          {/* Posts & User Management Section */}
          <Text style={styles.sectionTitle}>Posts & User Management</Text>
          <View style={styles.gridContainer}>
            <TouchableOpacity style={styles.card}>
              <Ionicons name="image" size={30} color="red" />
              <Text style={styles.cardText}>Reported Posts</Text>
              <View style={styles.redDot} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <Ionicons name="people" size={30} color="red" />
              <Text style={styles.cardText}>Reported Users</Text>
              <View style={styles.redDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                navigation.navigate("ManageUsers");
              }}
            >
              <Ionicons name="ban" size={30} color="red" />
              <Text style={styles.cardText}>Ban/ Unban</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Notification Section */}
          {/* <Text style={styles.sectionTitle}>Custom Notification</Text>
          <TextInput
            style={styles.input}
            placeholder="Write your custom notification here..."
            maxLength={31}
          /> */}
          {/* <Text style={styles.charCount}>0/31</Text> */}

          {/* Notification Toggle Options */}
          {/* <View style={styles.switchContainer}>
            <View style={styles.switchOption}>
              <Switch
                value={inAppNotification}
                onValueChange={() => setInAppNotification(!inAppNotification)}
              />
              <Text style={styles.switchText}>Send in-app notification</Text>
            </View>

            <View style={styles.switchOption}>
              <Switch
                value={pushNotification}
                onValueChange={() => setPushNotification(!pushNotification)}
              />
              <Text style={styles.switchText}>Send push notification</Text>
            </View>
          </View> */}

          {/* Buttons */}
          {/* <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("NotificationsScreen")}
            >
              <Text style={styles.secondaryButtonText}>
                Recent Notifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Send Notification</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Styles for the dashboard UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50, // Extra space to prevent keyboard overlap
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    width: "30%",
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  blueCard: {
    backgroundColor: "#4A90E2",
  },
  cardText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  cardTextWhite: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    color: "#fff",
    textAlign: "center",
  },
  redDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
  input: {
    height: 50,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    marginTop: 5,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: "column",
    marginVertical: 10,
  },
  switchOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  switchText: {
    fontSize: 14,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});
