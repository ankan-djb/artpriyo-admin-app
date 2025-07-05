import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params; // Get event details from navigation

  // Local state to manage input fields
  const [eventName, setEventName] = useState(event.eventName);
  const [startDate, setStartDate] = useState(event.startDate);
  const [endDate, setEndDate] = useState(event.endDate);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [entryFee, setEntryFee] = useState(event.entryFee.toString());

  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // Show pickers
  const showStartTimePicker = () => setStartTimePickerVisible(true);
  const showEndTimePicker = () => setEndTimePickerVisible(true);

  // Hide pickers
  const hideStartTimePicker = () => setStartTimePickerVisible(false);
  const hideEndTimePicker = () => setEndTimePickerVisible(false);

  // Handle time selection
  const handleStartTimeConfirm = (time) => {
    setStartTime(
      time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (time) => {
    setEndTime(
      time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    hideEndTimePicker();
  };

  // Function to handle saving the updated event
  const handleSave = async () => {
    if (
      !eventName ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !entryFee
    ) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      await axios.put(
        `https://artpriyo-backend.onrender.com/api/event/update-event/${event._id}`,
        {
          eventName,
          startDate,
          endDate,
          startTime,
          endTime,
          entryFee,
        }
      );

      Alert.alert("Success", "Event updated successfully!");
      navigation.goBack(); // Navigate back to the event list
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Error", "Failed to update event. Try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Event Name */}
      <Text style={[styles.label, { marginTop: 0 }]}>Event Name</Text>
      <TextInput
        style={styles.input}
        value={eventName}
        onChangeText={setEventName}
      />

      {/* Start Date */}
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => setStartDate("")}
      >
        <Text style={styles.dateText}>{startDate || "Select Start Date"}</Text>
        <Ionicons name="calendar-outline" size={20} color="#555" />
      </TouchableOpacity>

      <View style={styles.calendarWrapper}>
        <Calendar
          minDate={new Date().toISOString().split("T")[0]}
          onDayPress={(day) => {
            setStartDate(day.dateString);
            if (endDate && day.dateString > endDate) {
              setEndDate(""); // Reset end date if invalid
            }
          }}
          markedDates={{
            [startDate]: {
              selected: true,
              selectedColor: "#00796B",
              selectedTextColor: "#fff",
            },
          }}
          theme={{
            selectedDayBackgroundColor: "#00796B",
            todayTextColor: "#00796B",
            arrowColor: "#00796B",
          }}
        />
      </View>

      {/* End Date */}
      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => setEndDate("")}
      >
        <Text style={styles.dateText}>{endDate || "Select End Date"}</Text>
        <Ionicons name="calendar-outline" size={20} color="#555" />
      </TouchableOpacity>

      <View style={styles.calendarWrapper}>
        <Calendar
          minDate={startDate || new Date().toISOString().split("T")[0]}
          onDayPress={(day) => setEndDate(day.dateString)}
          markedDates={{
            [endDate]: {
              selected: true,
              selectedColor: "#00796B",
              selectedTextColor: "#fff",
            },
          }}
          theme={{
            selectedDayBackgroundColor: "#00796B",
            todayTextColor: "#00796B",
            arrowColor: "#00796B",
          }}
        />
      </View>

      {/* Start Time */}
      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity onPress={showStartTimePicker} style={styles.timePicker}>
        <Text style={styles.timeText}>{startTime || "Select Start Time"}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={handleStartTimeConfirm}
        onCancel={hideStartTimePicker}
      />

      {/* End Time */}
      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity onPress={showEndTimePicker} style={styles.timePicker}>
        <Text style={styles.timeText}>{endTime || "Select End Time"}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={hideEndTimePicker}
      />

      {/* Entry Fee */}
      <Text style={styles.label}>Entry Fee (₹)</Text>
      <TextInput
        style={styles.input}
        value={entryFee}
        onChangeText={setEntryFee}
        keyboardType="numeric"
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>💾 Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
  },
  dateText: {
    fontSize: 16,
    color: "#555",
  },
  timePicker: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
    color: "#555",
  },
  saveButton: {
    backgroundColor: "#00796B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  calendarWrapper: {
    marginVertical: 10,
  },
});

export default EditEventScreen;
