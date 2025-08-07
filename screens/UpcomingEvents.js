import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import axios from "axios";
import apiService from "../services/api";

const UpcomingEvents = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    setRefreshing(true);
    try {
      const response = await apiService.eventService.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Failed to fetch events. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Filter events based on search input and show only upcoming events
  const filteredEvents = events.filter((event) =>
    event.status === "upcoming" && 
    event.eventName.toLowerCase().includes(search.toLowerCase())
  );

  const formatEventDate = (endDate) => {
    const end = new Date(endDate);
    const options = { 
      year: "numeric",
      month: "short", 
      day: "numeric" 
    };
    return end.toLocaleDateString("en-US", options);
  };

  const convertTo24Hour = (time) => {
    if (!time) return null;
    const [hour, minute] = time?.split(/[:\s]/);
    const period = time.toLowerCase().includes("pm") ? "PM" : "AM";

    let hour24 = parseInt(hour, 10);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;

    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  };

  const calculateTimeRemaining = (endDate, endTime) => {
    if (!endDate || !endTime) return "Time not set";
    
    const timeString = convertTo24Hour(endTime);
    if (!timeString) return "Time not set";
    
    const end = new Date(`${endDate} ${timeString}`);
    const now = new Date();

    const diffMs = end - now;
    if (diffMs <= 0) return "Event Ended";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const startEvent = async (eventId, eventName) => {
    Alert.alert(
      "Start Event", 
      `Are you sure you want to start "${eventName}"?`, 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          style: "default",
          onPress: async () => {
            try {
              // Add your start event API call here
             const response = await apiService.eventService.startEvent(eventId);
              
              if (response.status === 200) {
              // Assuming the API call is successful
                Alert.alert("Success", `Event "${eventName}" has been started!`);
                fetchEvents(); // Refresh the list
              }
            } catch (error) {
              console.error("Error starting event:", error);
              Alert.alert("Error", "Failed to start event. Please try again.");
            }
          },
        },
      ]
    );
  };

  const deleteEvent = async (eventId) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Replace with proper API service call when available
            await apiService.eventService.deleteEvent(eventId);
            setEvents((prevEvents) =>
              prevEvents.filter((event) => event._id !== eventId)
            );
            Alert.alert("Success", "Event deleted successfully!");
          } catch (error) {
            console.error("Error deleting event:", error);
            Alert.alert("Error", "Failed to delete event. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search events..."
          style={styles.searchInput}
          value={search}
          onChangeText={(text) => setSearch(text)}
        />
      </View>

      {/* Show "No Events" message when there are no events */}
      {filteredEvents.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2748/2748558.png",
            }}
            style={styles.noEventsImage}
          />
          <Text style={styles.noEventsText}>No upcoming events found</Text>
          <Text style={styles.noEventsSubText}>
            {search ? "Try searching with a different keyword." : "Create a new event to get started!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          numColumns={1}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Image source={{ uri: item.image }} style={styles.eventImage} />
              
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{item.eventName}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>ACTIVE</Text>
                  </View>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.eventDate}>
                      Ends: {formatEventDate(item.endDate)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.countdown}>
                      {calculateTimeRemaining(item.endDate, item.endTime)} remaining
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                      <Text style={styles.entryFee}>₹{item.entryFee}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="trophy-outline" size={14} color="#FF9800" />
                      <Text style={styles.prizePool}>₹{item.prizePool}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => startEvent(item._id, item.eventName)}
                  >
                    <Ionicons name="play" size={14} color="#fff" />
                    <Text style={styles.buttonText}>Start</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate("EditEvent", { event: item })}
                  >
                    <Ionicons name="create-outline" size={14} color="#fff" />
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteEvent(item._id)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#fff" />
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchEvents} />
          }
        />
      )}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4A90E2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  eventContent: {
    padding: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventDate: {
    color: "#666",
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  countdown: {
    color: "#FF5722",
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "600",
  },
  entryFee: {
    fontSize: 12,
    marginLeft: 4,
    color: "#4CAF50",
    fontWeight: "600",
  },
  prizePool: {
    fontSize: 12,
    marginLeft: 4,
    color: "#FF9800",
    fontWeight: "600",
  },
  participants: {
    fontSize: 14,
    marginLeft: 8,
    color: "#2196F3",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  // No Events Styles
  noEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 40,
  },
  noEventsImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.6,
  },
  noEventsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  noEventsSubText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default UpcomingEvents;
