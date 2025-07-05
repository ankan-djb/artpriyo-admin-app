import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import apiService from "../services/api";

const ManageAdmin = () => {
  const navigation = useNavigation();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdmins = async () => {
    try {
      const response = await apiService.adminService.getAllAdmins();

      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch administrators";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdmins();
  };

  const handleEditPermissions = (admin) => {
    navigation.navigate("EditAdminPermissions", { admin });
  };

  const renderAdminItem = ({ item }) => (
    <View style={styles.adminCard}>
      <View style={styles.adminInfo}>
        <View style={styles.adminHeader}>
          <Ionicons name="person-circle-outline" size={24} color="#4A90E2" />
          <Text style={styles.adminName}>{item.name}</Text>
        </View>
        <View style={styles.adminDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.adminEmail}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="shield-outline" size={16} color="#666" />
            <Text style={styles.adminRole}>
              {item.role.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditPermissions(item)}
      >
        <Ionicons name="settings-outline" size={24} color="#4A90E2" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#4A90E2", "#357ABD"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Administrators</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddAdministrator")}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Admin</Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={admins}
        renderItem={renderAdminItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No administrators found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  adminCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminInfo: {
    flex: 1,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adminName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  adminDetails: {
    marginLeft: 32,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  adminEmail: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  adminRole: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
    marginLeft: 8,
  },
  editButton: {
    padding: 10,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
    zIndex: 1,
  },
});

export default ManageAdmin;
