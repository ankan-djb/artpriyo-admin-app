import React, { useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";

const NotificationsScreen = () => {
  // Dummy notifications
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Event Updated",
      message: "The 'Music Fest' event time has been changed.",
      date: "Feb 8, 2025",
      time: "10:30 AM",
    },
    {
      id: "2",
      title: "New Event",
      message: "A new event 'Tech Conference' has been added.",
      date: "Feb 7, 2025",
      time: "3:45 PM",
    },
    {
      id: "3",
      title: "Reminder",
      message: "Don't forget your meeting at 5 PM today.",
      date: "Feb 6, 2025",
      time: "11:00 AM",
    },
  ]);

  return (
    <View style={styles.container}>
      {/* Show Empty State if No Notifications */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/4076/4076409.png",
            }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <View style={styles.textContainer}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>
                  {item.date} • {item.time}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  notificationCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -150,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});

export default NotificationsScreen;
