import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { Button } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

import apiService from "../services/api"; // Adjust the import path as necessary

const CreateEventScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // Image states
  const [image, setImage] = useState(null); // Selected image URI
  const [imageUrl, setImageUrl] = useState(""); // Uploaded Cloudinary URL

  const [eventName, setEventName] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rules, setRules] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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

  // Function to pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to upload image to Cloudinary
  const uploadImage = async () => {
    if (!image) {
      Alert.alert("Upload Error", "Please select an image first.");
      return;
    }

    const data = new FormData();
    const filename = image.split("/").pop();
    const fileType = filename.split(".").pop();

    data.append("file", {
      uri: image,
      name: filename,
      type: `image/${fileType}`,
    });

    data.append("upload_preset", "artpriyo");

    try {
      setLoading(true); // Show loader
      console.log("Uploading image..."); // Debugging
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dbueqvycn/image/upload",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload success:", res.data);
      setImageUrl(res.data.secure_url);
      ToastAndroid.show("Image uploaded successfully!", ToastAndroid.SHORT);
    } catch (error) {
      console.log(
        "Upload failed:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "Failed to upload image. Try again.");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  // Function to handle event creation
  const handleCreateEvent = async () => {
    if (!imageUrl) {
      Alert.alert(
        "Upload Required",
        "Please upload an image before creating the event."
      );
      return;
    }

    if (
      !eventName ||
      !entryFee ||
      !prizePool ||
      !startDate ||
      !endDate ||
      !rules
    ) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }

    try {
      setLoading(true); // Show loader

      const eventData = {
        eventName,
        entryFee,
        prizePool,
        startDate,
        endDate,
        startTime,
        endTime,
        rules,
        image: imageUrl, // Use uploaded image URL
      };

      const response = await apiService.eventService.createEvent(eventData);

      if (response.data.message == "Event created successfully") {
        ToastAndroid.show("Event created successfully!", ToastAndroid.SHORT);
        setTimeout(() => {
          navigation.navigate("UpcomingEvents");
        }, 1000);
      } else {
        Alert.alert("Error", "Failed to create event.");
      }
    } catch (error) {
      console.error("Event creation error:", error);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fullscreen Loader */}
      {loading && (
        <Modal transparent={true} animationType="fade">
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loaderText}>Processing...</Text>
          </View>
        </Modal>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        {/* Image Picker */}
        <TouchableOpacity onPress={pickImage} style={styles.imageUploadBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.uploadText}>Upload Image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={uploadImage}
          style={{
            padding: 12,
            width: "30%",
            marginHorizontal: "auto",
            alignItems: "center",
            borderRadius: 12,
            marginBottom: 10,
            backgroundColor: "#4A90E2",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: 700 }}>Upload</Text>
        </TouchableOpacity>

        {/* Event Details */}
        <TextInput
          placeholder="Event Name"
          value={eventName}
          onChangeText={setEventName}
          style={styles.input}
        />

        <View style={styles.row}>
          <TextInput
            placeholder="Entry Fee"
            keyboardType="numeric"
            value={entryFee}
            onChangeText={setEntryFee}
            style={styles.smallInput}
          />
          <TextInput
            placeholder="Prize Pool"
            keyboardType="numeric"
            value={prizePool}
            onChangeText={setPrizePool}
            style={styles.smallInput}
          />
        </View>

        {/* Date Selection */}
        <View
          style={{
            borderWidth: 1,
            marginTop: 15,
            padding: 15,
            borderRadius: 20,
            borderColor: "#CCC",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={[styles.label, { marginTop: 0 }]}> 
            {startDate
              ? new Date(startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Start Date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#aaa" />
        </View>
        <View style={styles.calendarWrapper}>
          <Calendar
            minDate={new Date().toISOString().split("T")[0]} // Disable past dates
            onDayPress={(day) => {
              setStartDate(day.dateString); // Always store as YYYY-MM-DD
              if (endDate && day.dateString > endDate) {
                setEndDate(""); // Reset end date if invalid
              }
            }}
            markedDates={
              startDate
                ? {
                    [startDate]: {
                      selected: true,
                      selectedColor: "#4A90E2",
                      selectedTextColor: "#ffffff",
                    },
                  }
                : {}
            }
            hideExtraDays={true}
            enableSwipeMonths={true}
            showWeekNumbers={false}
            displayLoadingIndicator={false}
            monthFormat={'MMM yyyy'}
            renderHeader={(date) => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const month = monthNames[date.getMonth()];
              const year = date.getFullYear();
              return (
                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333'}}>
                  {month} {year}
                </Text>
              );
            }}
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
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
              textDayFontWeight: "600",
              textDayHeaderFontWeight: "bold",
              'stylesheet.calendar.header': {
                header: {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginTop: 10,
                  marginBottom: 10,
                  alignItems: 'center',
                },
                monthText: {
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                }
              }
            }}
          />
        </View>

        {/* Time Selection */}
        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity
          onPress={showStartTimePicker}
          style={styles.timePicker}
        >
          <Text style={styles.timeText}>
            {startTime || "Select Start Time"}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isStartTimePickerVisible}
          mode="time"
          onConfirm={handleStartTimeConfirm}
          onCancel={hideStartTimePicker}
        />

        <View
          style={{
            borderWidth: 1,
            marginTop: 15,
            padding: 15,
            borderRadius: 20,
            borderColor: "#CCC",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={[styles.label, { marginTop: 0 }]}> 
            {endDate
              ? new Date(endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "End Date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#aaa" />
        </View>
        <View style={styles.calendarWrapper}>
          <Calendar
            minDate={startDate || new Date().toISOString().split("T")[0]} // Ensure end date is after start date
            onDayPress={(day) => setEndDate(day.dateString)}
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
            hideExtraDays={true}
            enableSwipeMonths={true}
            showWeekNumbers={false}
            displayLoadingIndicator={false}
            monthFormat={'MMM yyyy'}
            renderHeader={(date) => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const month = monthNames[date.getMonth()];
              const year = date.getFullYear();
              return (
                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333'}}>
                  {month} {year}
                </Text>
              );
            }}
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
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
              textDayFontWeight: "600",
              textDayHeaderFontWeight: "bold",
              'stylesheet.calendar.header': {
                header: {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginTop: 10,
                  marginBottom: 10,
                  alignItems: 'center',
                },
                monthText: {
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                }
              }
            }}
          />
        </View>

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

        {/* Event Rules */}
        <TextInput
          placeholder="Event Rules"
          value={rules}
          onChangeText={setRules}
          style={styles.rulesInput}
          multiline
        />

        {/* Submit Button */}
        <Button
          mode="contained"
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          Create Event
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = {
  container: { padding: 20, backgroundColor: "white", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  imageUploadBox: {
    width: 140,
    height: 140,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  uploadText: { color: "#757575" },
  image: { width: 120, height: 120, borderRadius: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  smallInput: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 12,
    borderRadius: 8,
  },
  timePicker: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  timeText: { fontSize: 16, color: "#555" },
  rulesInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 12,
    borderRadius: 8,
    height: 80,
    textAlignVertical: "top",
  },
  createButton: { marginTop: 20, backgroundColor: "#1976D2" },
  calendarWrapper: {
    borderWidth: 1,
    borderColor: "#eee", // Light gray border
    borderRadius: 15, // Rounded corners
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginVertical: 10,
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loader: {
    backgroundColor: "#4A90E2",
    padding: 20,
    borderRadius: 10,
  },
  loaderText: {
    marginTop: 10, // Adds spacing between the spinner and text
    fontSize: 18, // Increases readability
    fontWeight: "bold", // Makes it stand out
    color: "#ffffff", // White text for contrast
    textAlign: "center", // Centers the text
    letterSpacing: 1, // Adds slight spacing for better readability
  },
};

export default CreateEventScreen;
