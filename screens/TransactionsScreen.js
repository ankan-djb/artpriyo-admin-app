import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
// Note: You may need to install this package if not already installed:
// npm install @react-native-community/datetimepicker --save
import DateTimePicker from "@react-native-community/datetimepicker";
import apiService from "../services/api";

const TransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const fetchTransactions = async (pageNum = 1, shouldRefresh = false) => {
    try {
      // Prepare filter parameters
      const params = {
        page: pageNum,
        limit: 10,
      };

      // Add type filter (if not 'all')
      if (filters.type !== "all") {
        params.type = filters.type;
      }

      // Add date filters if provided
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      // Add search query if provided
      if (searchQuery) {
        params.search = searchQuery;
      }

      console.log("Sending request with params:", params);

      // Pass filter parameters to the API call
      const response = await apiService.transactionService.getAllTransactions(
        params
      );

      if (response.data.success) {
        const newTransactions = response.data.transactions;

        // Create a Map to store unique transactions using transactionID as the key
        if (shouldRefresh) {
          // If refreshing, just use the new data
          setTransactions(newTransactions);
        } else {
          // When loading more, check for duplicates before adding
          const existingIds = new Set(transactions.map((t) => t.transactionID));
          const uniqueNewTransactions = newTransactions.filter(
            (t) => !existingIds.has(t.transactionID)
          );

          setTransactions([...transactions, ...uniqueNewTransactions]);
        }

        setHasMore(newTransactions.length === 10);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to fetch transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    setPage(1);
    fetchTransactions(1, true);
  }, [filters]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchTransactions(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  // Handle date selection for start date
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowStartDatePicker(Platform.OS === "ios");

    // Format date for display and API
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    setFilters({ ...filters, startDate: formattedDate });
  };

  // Handle date selection for end date
  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowEndDatePicker(Platform.OS === "ios");

    // Format date for display and API
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    setFilters({ ...filters, endDate: formattedDate });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
  };

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View
          style={[
            styles.transactionType,
            { backgroundColor: item.type === "credit" ? "#E8F5E9" : "#FFEBEE" },
          ]}
        >
          <Ionicons
            name={item.type === "credit" ? "arrow-down" : "arrow-up"}
            size={20}
            color={item.type === "credit" ? "#2E7D32" : "#C62828"}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.time)}</Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.type === "credit" ? "#2E7D32" : "#C62828" },
          ]}
        >
          {item.type === "credit" ? "+" : "-"}
          {formatAmount(item.amount)}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionId}>ID: {item.transactionID}</Text>
        <View style={styles.userDetails}>
          {item.user ? (
            <>
              <Text style={styles.userTitle}>User Information:</Text>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Name:</Text>
                <Text style={styles.userValue}>{item.user.name || "N/A"}</Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Email:</Text>
                <Text style={styles.userValue}>{item.user.email || "N/A"}</Text>
              </View>
              <Text style={styles.userId}>User ID: {item.userID}</Text>
            </>
          ) : (
            <Text style={styles.userId}>User ID: {item.userID}</Text>
          )}
        </View>
      </View>
    </View>
  );

  // Add a reset filters function
  const resetFilters = () => {
    setFilters({
      type: "all",
      startDate: "",
      endDate: "",
    });
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                resetFilters();
                setFilterModalVisible(false);
                setPage(1);
                fetchTransactions(1, true);
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Transaction Type</Text>
            <View style={styles.filterOptions}>
              {["all", "credit", "debit"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.type === type && styles.selectedFilterOption,
                  ]}
                  onPress={() => setFilters({ ...filters, type })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.type === type && styles.selectedFilterOptionText,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.dateInputs}>
              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Start Date:</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    {filters.startDate || "Select Date"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#1976D2" />
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={
                      filters.startDate
                        ? new Date(filters.startDate)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                  />
                )}
              </View>

              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>End Date:</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    {filters.endDate || "Select Date"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#1976D2" />
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={
                      filters.endDate ? new Date(filters.endDate) : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={onEndDateChange}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.resetAndApplyButton]}
              onPress={() => {
                resetFilters();
                setFilterModalVisible(false);
                setPage(1);
                fetchTransactions(1, true);
              }}
            >
              <Text style={styles.modalButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton]}
              onPress={() => {
                setFilterModalVisible(false);
                setPage(1);
                fetchTransactions(1, true);
              }}
            >
              <Text style={styles.modalButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          onSubmitEditing={() => {
            setPage(1);
            fetchTransactions(1, true);
          }}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setPage(1);
              fetchTransactions(1, true);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item, index) =>
            `transaction-${item._id || item.transactionID}-${index}`
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator style={styles.footerLoader} color="#1976D2" />
            ) : null
          }
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionType: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionDetails: {
    flexDirection: "column",
    justifyContent: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  transactionId: {
    fontSize: 12,
    color: "#666",
  },
  userId: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  footerLoader: {
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1976D2",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedFilterOption: {
    backgroundColor: "#1976D2",
  },
  filterOptionText: {
    color: "#666",
  },
  selectedFilterOptionText: {
    color: "#fff",
  },
  dateInputs: {
    gap: 8,
    width: "100%",
  },
  datePickerContainer: {
    marginBottom: 12,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  datePickerButtonText: {
    fontSize: 14,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  resetAndApplyButton: {
    backgroundColor: "#ff9800",
  },
  applyButton: {
    backgroundColor: "#1976D2",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  userDetails: {
    marginTop: 8,
    paddingTop: 8,
  },
  userTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  userRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 12,
    color: "#666",
    width: 60,
  },
  userValue: {
    fontSize: 12,
    color: "#333",
    flex: 1,
  },
  clearButton: {
    padding: 8,
  },
});

export default TransactionsScreen;
