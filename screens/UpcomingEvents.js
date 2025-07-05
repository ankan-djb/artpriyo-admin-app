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
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const UpcomingEvents = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      axios
        .get("https://artpriyo-backend.onrender.com/api/event/upcoming-events")
        .then((response) => setEvents(response.data))
        .catch((error) => console.error("Error fetching events:", error));
    }, [])
  );
  const fetchEvents = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(
        "https://artpriyo-backend.onrender.com/api/event/upcoming-events"
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Filter events based on search input
  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(search.toLowerCase())
  );

  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const options = { month: "short", day: "numeric" }; // Feb 10
    const yearOptions = { year: "numeric" }; // 2025

    // Check if the start and end dates are in the same month
    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString(
          "en-US",
          options
        )} - ${end.getDate()}, ${start.toLocaleDateString(
          "en-US",
          yearOptions
        )}`;
      }
      return `${start.toLocaleDateString(
        "en-US",
        options
      )} - ${end.toLocaleDateString(
        "en-US",
        options
      )}, ${start.toLocaleDateString("en-US", yearOptions)}`;
    }

    return `${start.toLocaleDateString(
      "en-US",
      options
    )}, ${start.getFullYear()} - ${end.toLocaleDateString(
      "en-US",
      options
    )}, ${end.getFullYear()}`;
  };

  const convertTo24Hour = (time) => {
    const [hour, minute] = time.split(/[:\s]/);
    const period = time.toLowerCase().includes("pm") ? "PM" : "AM";

    let hour24 = parseInt(hour, 10);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;

    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  };

  const calculateTimeRemaining = (startDate, startTime, endDate, endTime) => {
    const start = new Date(`${startDate} ${convertTo24Hour(startTime)}`);
    const end = new Date(`${endDate} ${convertTo24Hour(endTime)}`);

    const diffMs = end - start; // Time difference in milliseconds
    if (diffMs <= 0) return "Event Ended"; // If event already ended

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d | ${hours}h | ${minutes}m\nremaining`;
  };

  const deleteEvent = async (eventId) => {
    console.log(eventId);

    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(
              `https://artpriyo-backend.onrender.com/api/event/delete-event/${eventId}`
            );
            setEvents((prevEvents) =>
              prevEvents.filter((event) => event._id !== eventId)
            );
          } catch (error) {
            console.error("Error deleting event:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search for competitions"
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
          <Text style={styles.noEventsText}>No events found</Text>
          <Text style={styles.noEventsSubText}>
            Try searching with a different keyword.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          key={2}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View
                style={[
                  styles.eventImageContainer,
                  { backgroundColor: item.isJoined ? "#FFCC80" : "#444" },
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.eventImage} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{item.eventName}</Text>
                <Text style={styles.eventDate}>
                  {formatEventDate(item.startDate, item.endDate)}
                </Text>
                <Text style={styles.countdown}>
                  ⏳{" "}
                  {calculateTimeRemaining(
                    item.startDate,
                    item.startTime,
                    item.endDate,
                    item.endTime
                  )}
                </Text>
                <Text style={styles.entryFee}>
                  💰 Entry Fee: ₹{item.entryFee} Only
                </Text>
                <Text style={styles.participants}>
                  👥 {item.participants || 0} Participants
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("EditEvent", { event: item })
                  }
                >
                  <Text style={styles.editButtonText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => deleteEvent(item._id)}
                >
                  <Text style={styles.editButtonText}>✏️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={fetchEvents} // Enable pull-to-refresh
        />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f7f7f7",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  row: {
    justifyContent: "space-between", // Make 2 cards per row
    margin: 5,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 15,
    width: "48%", // Adjust for 2 columns
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  eventImageContainer: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  eventInfo: {
    padding: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventDate: {
    color: "#666",
    fontSize: 14,
    marginBottom: 5,
  },
  countdown: {
    color: "red",
    fontSize: 14,
    marginBottom: 5,
  },
  entryFee: {
    fontSize: 14,
    marginBottom: 5,
  },
  participants: {
    fontSize: 14,
    marginBottom: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  joinBtn: {
    backgroundColor: "green",
  },
  joinedBtn: {
    backgroundColor: "black",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },

  // No Events Styles
  noEventsContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  noEventsImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  noEventsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  noEventsSubText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    width: "80%",
  },
  editButton: {
    backgroundColor: "#1E1E1E", // Sleek dark gray/black
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase", // Makes it look professional
  },
});

export default UpcomingEvents;
