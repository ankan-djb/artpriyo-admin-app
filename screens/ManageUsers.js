import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform, // Import Platform to check OS
  ScrollView,
  ToastAndroid, // Import ScrollView
} from "react-native";
import apiService from "../services/api"; // Adjust the import path as necessary

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("unbanned");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [modalAction, setModalAction] = useState("");
  const [modalReason, setModalReason] = useState("");

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const fetchUsers = async (pageToFetch = 1, append = false) => {
    if (append) setLoadingMore(true);
    try {
      const response = await apiService.userManagementService.getUsers(pageToFetch, 20);
      const { users: fetchedUsers, pagination } = response.data;
      setHasNextPage(pagination.hasNextPage);
      if (append) {
        setUsers(prev => [...prev, ...fetchedUsers]);
      } else {
        setUsers(fetchedUsers);
      }
      setPage(pageToFetch);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingMore(false);
    }
  };

    const actionUser = async (userId, action, reason) => {
    try {
      const response = await apiService.userManagementService.actionUser(userId, action, reason);
      if (response.status === 200) {
        // Update the user list after action
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, isBanned: action === "ban" } : user
          )
        );
        setModalVisible(false);
        setModalUser(null);
        setModalAction("");
        setModalReason("");
        ToastAndroid.show(`User ${action === "ban" ? "banned" : "unbanned"} successfully`, ToastAndroid.SHORT);
      } else {
        console.error("Failed to update user status:", response.data);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.userName.toLowerCase().includes(search.toLowerCase())
  );

  const bannedUsers = filteredUsers.filter(u => u.isBanned);
  const unbannedUsers = filteredUsers.filter(u => !u.isBanned);

  const renderUserDetails = (user) => (
    <View style={styles.userDetailsBox}>
      <Text style={styles.detailTitle}>User Details</Text>
      <Text style={styles.detailItem}><Text style={styles.detailLabel}>Name:</Text> {user.firstName} {user.lastName}</Text>
      <Text style={styles.detailItem}><Text style={styles.detailLabel}>Username:</Text> @{user.userName}</Text>
      <Text style={styles.detailItem}><Text style={styles.detailLabel}>Email:</Text> {user.email}</Text>
      <Text style={styles.detailItem}><Text style={styles.detailLabel}>Balance:</Text> ₹{user.balance}</Text>
      <Text style={styles.detailItem}><Text style={styles.detailLabel}>Status:</Text> {user.isBanned ? "Banned" : "Active"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "unbanned" && styles.tabActive]}
          onPress={() => setTab("unbanned")}
        >
          <Text style={[styles.tabText, tab === "unbanned" && styles.tabTextActive]}>Unbanned</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "banned" && styles.tabActive]}
          onPress={() => setTab("banned")}
        >
          <Text style={[styles.tabText, tab === "banned" && styles.tabTextActive]}>Banned</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#2196F3" style={styles.searchIcon} />
        <TextInput
          placeholder="Search for users"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />
      </View>

      {/* User List or Empty State */}
      {(tab === "unbanned" ? unbannedUsers : bannedUsers).length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076409.png" }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={tab === "unbanned" ? unbannedUsers : bannedUsers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <Image
                source={{ uri: "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg" }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.userHandle}>@{item.userName}</Text>
                <Text style={[styles.userStatus, { color: item.isBanned ? '#F44336' : '#4CAF50' }]}>
                  {item.isBanned ? "Banned" : "Active"}
                </Text>
              </View>
              <TouchableOpacity
                style={item.isBanned ? styles.unbanButton : styles.banButton}
                onPress={() => {
                  setModalUser(item);
                  setModalAction(item.isBanned ? "unban" : "ban");
                  setModalReason("");
                  setModalVisible(true);
                }}
              >
                <Text style={item.isBanned ? styles.unbanText : styles.banText}>
                  {item.isBanned ? "Unban" : "Ban"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            hasNextPage ? (
              <TouchableOpacity
                style={{ padding: 16, alignItems: "center" }}
                onPress={() => fetchUsers(page + 1, true)}
                disabled={loadingMore}
              >
                <Text style={{ color: "#2196F3", fontWeight: "bold" }}>
                  {loadingMore ? "Loading..." : "Show More"}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {/* --- MODAL START --- */}
      {/* I've wrapped the entire modal content in a KeyboardAvoidingView and a ScrollView */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', minWidth: 300 }} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalAction === "ban" ? "Ban User" : "Unban User"}</Text>

              {modalUser && renderUserDetails(modalUser)}

              <Text style={styles.inputLabel}>Reason:</Text>
              <TextInput
                style={styles.reasonInput}
                value={modalReason}
                onChangeText={setModalReason}
                placeholder={`Enter reason for ${modalAction}...`}
                multiline
                numberOfLines={3}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: modalAction === "ban" ? "#F44336" : "#2196F3" },
                    !modalReason.trim() && { opacity: 0.6 } // Dim button when disabled
                  ]}
                  onPress={() => {
                    actionUser(modalUser._id, modalAction, modalReason);
                    setModalVisible(false);
                  }}
                  disabled={!modalReason.trim()}
                >
                  <Text style={styles.confirmButtonText}>{modalAction === "ban" ? "Ban" : "Unban"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      {/* --- MODAL END --- */}
    </View>
  );
};

// --- STYLES ---
// I've adjusted padding, margins, font sizes, and other properties for a more compact UI.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Slightly off-white for better contrast
    padding: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#2196F3",
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#222",
    paddingVertical: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "#e3f2fd",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },
  userHandle: {
    fontSize: 12,
    color: "#888",
  },
  userStatus: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  banButton: {
    borderWidth: 1,
    borderColor: "#F44336",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#ffebee",
  },
  banText: {
    color: "#F44336",
    fontSize: 13,
    fontWeight: "bold",
  },
  unbanButton: {
    borderWidth: 1,
    borderColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#e3f2fd",
  },
  unbanText: {
    color: "#2196F3",
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyImage: {
    width: 90,
    height: 90,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Add padding to avoid edges
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    width: "100%", // Modal content takes full width of its container
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 12,
    textAlign: "center",
  },
  userDetailsBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e3f2fd",
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2196F3",
    textAlign: "center",
  },
  detailItem: {
    fontSize: 13,
    marginBottom: 4,
    color: "#333",
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#2196F3",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginTop: 8,
    marginBottom: 6,
  },
  reasonInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: "top", // For Android
    minHeight: 80,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#555",
    fontWeight: '600'
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ManageUsers;