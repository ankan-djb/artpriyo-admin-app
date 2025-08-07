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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
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
      const selectedImage = result.assets[0].uri;
      setImage(selectedImage);
      await uploadImageToCloudinary(selectedImage); // Pass the image URI directly
    }
  };

  // Function to upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    if (!imageUri) {
      Alert.alert("Upload Error", "Please select an image first.");
      return;
    }

    const data = new FormData();
    const filename = imageUri.split("/").pop();
    const fileType = filename.split(".").pop();

    data.append("file", {
      uri: imageUri,
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
      !endDate 
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
        endDate,
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 45}
      >
        {/* Fullscreen Loader */}
        {loading && (
          <Modal transparent={true} animationType="fade">
            <View style={styles.loaderContainer}>
              <View style={styles.loaderContent}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loaderText}>Processing...</Text>
              </View>
            </View>
          </Modal>
        )}

        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text style={styles.title}>Create New Event</Text>

          {/* Image Picker */}
          <Text style={styles.label}>Event Image</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imageUploadBox}>
            {image ? (
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: image }} style={styles.image} />
                {imageUrl && (
                  <View style={styles.uploadSuccessIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="camera-outline" size={40} color="#757575" />
                <Text style={styles.uploadText}>Tap to Upload Image</Text>
              </View>
            )}
          </TouchableOpacity>

        {/* Event Details */}
        <Text style={styles.label}>Event Name</Text>
        <TextInput
          placeholder="Enter event name"
          value={eventName}
          onChangeText={setEventName}
          style={styles.input}
        />

        <Text style={styles.label}>Pricing Details</Text>
        <View style={styles.row}>
          <View style={{ width: "48%" }}>
            <Text style={[styles.label, { marginTop: 0, marginBottom: 8, fontSize: 14 }]}>Entry Fee</Text>
            <TextInput
              placeholder="₹0"
              keyboardType="numeric"
              value={entryFee}
              onChangeText={setEntryFee}
              style={styles.smallInput}
            />
          </View>
          <View style={{ width: "48%" }}>
            <Text style={[styles.label, { marginTop: 0, marginBottom: 8, fontSize: 14 }]}>Prize Pool</Text>
            <TextInput
              placeholder="₹0"
              keyboardType="numeric"
              value={prizePool}
              onChangeText={setPrizePool}
              style={styles.smallInput}
            />
          </View>
        </View>

        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity style={styles.datePickerContainer}>
          <Text style={[styles.timeText, { color: endDate ? "#333" : "#999" }]}> 
            {endDate
              ? new Date(endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Select End Date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>
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
        <Text style={styles.label}>Event Rules & Guidelines</Text>
        <TextInput
          placeholder="Enter event rules and guidelines..."
          value={rules}
          onChangeText={setRules}
          style={styles.rulesInput}
          multiline
          maxLength={100}
          numberOfLines={5}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  safeArea: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  container: { 
    padding: 20, 
    backgroundColor: "#f8f9fa", 
    flexGrow: 1,
    paddingBottom: 40 // Extra padding at bottom for keyboard
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 15,
    color: "#333"
  },
  label: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginTop: 15,
    marginBottom: 8,
    color: "#444"
  },
  imageUploadBox: {
    width: 160,
    height: 160,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadText: { 
    color: "#757575",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8
  },
  image: { 
    width: 140, 
    height: 140, 
    borderRadius: 15 
  },
  uploadSuccessIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    marginBottom: 15
  },
  smallInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timePicker: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timeText: { 
    fontSize: 16, 
    color: "#555",
    fontWeight: "500"
  },
  rulesInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
    marginBottom: 15,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  createButton: { 
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loaderContent: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  datePickerContainer: {
    borderWidth: 1,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
};

export default CreateEventScreen;
