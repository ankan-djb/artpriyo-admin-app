import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../services/api";

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params; // Get event details from navigation

  // Helper function to extract date only from ISO string
  const getDateOnly = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Extract YYYY-MM-DD part only
  };

  // Local state to manage input fields
  const [eventName, setEventName] = useState(event.eventName);
  const [endDate, setEndDate] = useState(getDateOnly(event.endDate));
  const [endTime, setEndTime] = useState(event.endTime);
  const [entryFee, setEntryFee] = useState(event.entryFee.toString());
  const [prizePool, setPrizePool] = useState(event.prizePool?.toString() || '');
  const [rules, setRules] = useState(event.rules || '');

  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // Show/Hide pickers
  const showEndTimePicker = () => setEndTimePickerVisible(true);
  const hideEndTimePicker = () => setEndTimePickerVisible(false);

  // Handle time selection
  const handleEndTimeConfirm = (time) => {
    setEndTime(
      time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    hideEndTimePicker();
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Select End Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Function to handle saving the updated event
  const handleSave = async () => {
    if (!eventName || !endDate || !endTime || !entryFee) {
      Alert.alert("Validation Error", "Please fill all required fields!");
      return;
    }

    try {
      const updatedEvent = {
        eventName,
        endDate: `${endDate}T${endTime}:00`, // Combine date and time
        endTime,
        entryFee: parseFloat(entryFee),
        prizePool: parseFloat(prizePool) || 0,
        rules,
      };
      // Make API call to update the event
      const response = await apiService.eventService.editEvent(event._id, updatedEvent);

      if(response.status === 200) {
        console.log("Event updated successfully:", response.data);
        Alert.alert("Success", "Event updated successfully!");
        navigation.goBack(); // Navigate back to the event list
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Error", "Failed to update event. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
      >

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Name */}
          <Text style={styles.label}>Event Name *</Text>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Enter event name"
          />

          {/* Entry Fee and Prize Pool Row */}
          <Text style={styles.label}>Pricing Details</Text>
          <View style={styles.row}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.subLabel}>Entry Fee (₹) *</Text>
              <TextInput
                style={styles.halfInput}
                value={entryFee}
                onChangeText={setEntryFee}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.subLabel}>Prize Pool (₹)</Text>
              <TextInput
                style={styles.halfInput}
                value={prizePool}
                onChangeText={setPrizePool}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          {/* End Date */}
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity style={styles.datePickerContainer}>
            <Text style={[styles.dateText, { color: endDate ? "#333" : "#999" }]}>
              {formatDateForDisplay(endDate)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>

          <View style={styles.calendarWrapper}>
            <Calendar
              current={endDate || new Date().toISOString().split("T")[0]}
              minDate={new Date().toISOString().split("T")[0]}
              onDayPress={(day) => setEndDate(day.dateString)}
              enableSwipeMonths={true}
              renderHeader={(date) => {
                // This will correctly format and display month name
                const header = new Date(date).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <Text style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#333",
                    paddingVertical: 10,
                    textAlign: "center",
                  }}>
                    {header}
                  </Text>
                );
              }}
              markedDates={
                endDate
                  ? {
                    [endDate]: {
                      selected: true,
                      selectedColor: "#4A90E2",
                      selectedTextColor: "#ffffff",
                    },
                  }
                  : {}
              }
              theme={{
                backgroundColor: "#fff",
                calendarBackground: "#fff",
                textSectionTitleColor: "#A0A0A0",
                selectedDayBackgroundColor: "#4A90E2",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#4A90E2",
                dayTextColor: "#333",
                textDisabledColor: "#D3D3D3",
                arrowColor: "#4A90E2",
                monthTextColor: "#333",
                textMonthFontSize: 20,
                textMonthFontWeight: "bold",
                textDayFontSize: 16,
                textDayHeaderFontSize: 14,
                textDayFontWeight: "600",
                textDayHeaderFontWeight: "bold",
              }}
            />

          </View>


          {/* End Time */}
          <Text style={styles.label}>End Time *</Text>
          <TouchableOpacity onPress={showEndTimePicker} style={styles.timePicker}>
            <Text style={[styles.timeText, { color: endTime ? "#333" : "#999" }]}>
              {endTime || "Select End Time"}
            </Text>
            <Ionicons name="time-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={hideEndTimePicker}
          />

          {/* Event Rules */}
          <Text style={styles.label}>Event Rules & Guidelines</Text>
          <TextInput
            style={styles.rulesInput}
            value={rules}
            onChangeText={setRules}
            placeholder="Enter event rules and guidelines..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 40, // Add padding to avoid content being cut off
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerSpacer: {
    width: 34, // Same width as back button for centering
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  halfInputContainer: {
    flex: 1,
  },
  halfInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  timePicker: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  rulesInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 120,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 30,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  calendarWrapper: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginVertical: 15,
  },
});

export default EditEventScreen;
