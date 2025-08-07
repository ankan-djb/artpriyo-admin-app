import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import apiService from "../services/api";

const ReportedUsersScreen = ({ navigation }) => {
  const [reportedUsers, setReportedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");

  const fetchReportedUsers = async () => {
    setRefreshing(true);
    try {
      // Replace with actual API call
      const mockData = [
        {
          _id: "1",
          user: {
            _id: "user1",
            username: "john_doe",
            email: "john@example.com",
            profilePicture: "https://via.placeholder.com/100",
            isActive: true,
          },
          reports: [
            {
              _id: "report1",
              reportedBy: {
                username: "reporter1",
              },
              reason: "Inappropriate behavior",
              description: "User was being rude and offensive",
              createdAt: "2025-01-05T10:30:00Z",
            },
            {
              _id: "report2",
              reportedBy: {
                username: "reporter2",
              },
              reason: "Spam",
              description: "Posting spam content repeatedly",
              createdAt: "2025-01-04T15:20:00Z",
            },
          ],
          totalReports: 2,
          lastReportedAt: "2025-01-05T10:30:00Z",
        },
        {
          _id: "2",
          user: {
            _id: "user2",
            username: "jane_smith",
            email: "jane@example.com",
            profilePicture: "https://via.placeholder.com/100",
            isActive: true,
          },
          reports: [
            {
              _id: "report3",
              reportedBy: {
                username: "reporter3",
              },
              reason: "Fake account",
              description: "This appears to be a fake profile",
              createdAt: "2025-01-03T09:15:00Z",
            },
          ],
          totalReports: 1,
          lastReportedAt: "2025-01-03T09:15:00Z",
        },
      ];
      
      setReportedUsers(mockData);
    } catch (error) {
      console.error("Error fetching reported users:", error);
      Alert.alert("Error", "Failed to fetch reported users. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportedUsers();
    }, [])
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const banUser = async (userId, reason, duration) => {
    try {
      // Replace with actual API call
      console.log("Banning user:", userId, reason, duration);
      
      Alert.alert(
        "Success", 
        `User has been ${duration === "permanent" ? "permanently banned" : `banned for ${duration}`}!`
      );
      
      // Update local state
      setReportedUsers(prev => 
        prev.map(item => 
          item.user._id === userId 
            ? { ...item, user: { ...item.user, isActive: false } }
            : item
        )
      );
      
      setBanModalVisible(false);
      setBanReason("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error banning user:", error);
      Alert.alert("Error", "Failed to ban user. Please try again.");
    }
  };

  const unbanUser = async (userId) => {
    Alert.alert(
      "Unban User",
      "Are you sure you want to unban this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unban",
          style: "default",
          onPress: async () => {
            try {
              // Replace with actual API call
              console.log("Unbanning user:", userId);
              
              Alert.alert("Success", "User has been unbanned!");
              
              // Update local state
              setReportedUsers(prev => 
                prev.map(item => 
                  item.user._id === userId 
                    ? { ...item, user: { ...item.user, isActive: true } }
                    : item
                )
              );
            } catch (error) {
              console.error("Error unbanning user:", error);
              Alert.alert("Error", "Failed to unban user. Please try again.");
            }
          },
        },
      ]
    );
  };

  const dismissReport = async (reportId, userId) => {
    Alert.alert(
      "Dismiss Report",
      "Are you sure you want to dismiss this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dismiss",
          style: "default",
          onPress: async () => {
            try {
              // Replace with actual API call
              console.log("Dismissing report:", reportId);
              
              Alert.alert("Success", "Report has been dismissed!");
              fetchReportedUsers(); // Refresh the list
            } catch (error) {
              console.error("Error dismissing report:", error);
              Alert.alert("Error", "Failed to dismiss report. Please try again.");
            }
          },
        },
      ]
    );
  };

  const showBanModal = (user) => {
    setSelectedUser(user);
    setBanModalVisible(true);
  };

  const renderReportedUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <Image source={{ uri: item.user.profilePicture }} style={styles.profilePicture} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.email}>{item.user.email}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.user.isActive ? "#4CAF50" : "#F44336" }
            ]}>
              <Text style={styles.statusText}>
                {item.user.isActive ? "Active" : "Banned"}
              </Text>
            </View>
            <Text style={styles.reportCount}>{item.totalReports} Reports</Text>
          </View>
        </View>
      </View>

      <View style={styles.reportsSection}>
        <Text style={styles.reportsTitle}>Recent Reports:</Text>
        {item.reports.slice(0, 2).map((report, index) => (
          <View key={report._id} style={styles.reportItem}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportReason}>{report.reason}</Text>
              <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
            </View>
            <Text style={styles.reportDescription}>{report.description}</Text>
            <Text style={styles.reportedBy}>Reported by: {report.reportedBy.username}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        {item.user.isActive ? (
          <TouchableOpacity
            style={styles.banButton}
            onPress={() => showBanModal(item.user)}
          >
            <Ionicons name="ban" size={16} color="#fff" />
            <Text style={styles.buttonText}>Ban User</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.unbanButton}
            onPress={() => unbanUser(item.user._id)}
          >
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.buttonText}>Unban User</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => dismissReport(item.reports[0]._id, item.user._id)}
        >
          <Ionicons name="close-circle" size={16} color="#fff" />
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reportedUsers.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reportedUsers.filter(item => !item.user.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Banned Users</Text>
        </View>
      </View>

      {/* Reported Users List */}
      {reportedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No reported users found</Text>
          <Text style={styles.emptySubText}>All users are behaving well!</Text>
        </View>
      ) : (
        <FlatList
          data={reportedUsers}
          renderItem={renderReportedUser}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchReportedUsers} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Ban Modal */}
      <Modal
        visible={banModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ban User</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to ban {selectedUser?.username}?
            </Text>

            <Text style={styles.inputLabel}>Ban Reason:</Text>
            <TextInput
              style={styles.textInput}
              value={banReason}
              onChangeText={setBanReason}
              placeholder="Enter ban reason..."
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Ban Duration:</Text>
            <View style={styles.durationButtons}>
              {["7 days", "30 days", "permanent"].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    banDuration === duration && styles.selectedDuration
                  ]}
                  onPress={() => setBanDuration(duration)}
                >
                  <Text style={[
                    styles.durationText,
                    banDuration === duration && styles.selectedDurationText
                  ]}>
                    {duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setBanModalVisible(false);
                  setBanReason("");
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBanButton}
                onPress={() => banUser(selectedUser._id, banReason, banDuration)}
                disabled={!banReason.trim()}
              >
                <Text style={styles.confirmBanButtonText}>Ban User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 40, // To avoid content being hidden behind the bottom tab bar
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
    width: 34,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userHeader: {
    flexDirection: "row",
    marginBottom: 15,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  reportCount: {
    fontSize: 12,
    color: "#F44336",
    fontWeight: "600",
  },
  reportsSection: {
    marginBottom: 15,
  },
  reportsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  reportItem: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reportReason: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
  },
  reportDate: {
    fontSize: 12,
    color: "#666",
  },
  reportDescription: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  reportedBy: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  banButton: {
    backgroundColor: "#F44336",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  unbanButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  dismissButton: {
    backgroundColor: "#9E9E9E",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  durationButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  selectedDuration: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  durationText: {
    fontSize: 14,
    color: "#666",
  },
  selectedDurationText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  confirmBanButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F44336",
    alignItems: "center",
  },
  confirmBanButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default ReportedUsersScreen;
