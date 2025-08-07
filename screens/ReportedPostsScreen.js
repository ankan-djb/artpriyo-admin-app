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
  ScrollView,
  StatusBar,
  ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import apiService from "../services/api";

const ReportedPostsScreen = ({ navigation }) => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReportedPosts = async (pageToFetch = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setRefreshing(true);
    try {
      const response = await apiService.postService.getReportedPosts(pageToFetch, 20);
      console.log("Fetched reported posts:", JSON.stringify(response.data, null, 2));
      const { reports, pagination } = response.data;
      setHasNextPage(pagination.hasNextPage);
      if (append) {
        setReportedPosts(prev => [...prev, ...reports]);
      } else {
        setReportedPosts(reports);
      }
      setPage(pageToFetch);
    } catch (error) {
      console.error("Error fetching reported posts:", error);
      ToastAndroid.show(
        "Failed to fetch reported posts. Please try again later.",
        ToastAndroid.SHORT
      );
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportedPosts(1);
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

  const sendActionReports = async (postId, action, reason) => {
    try {
      const response = await apiService.postService.sendActionReports(postId, action, reason);
      console.log("Action sent successfully:", response.data);
      Alert.alert("Success", "Action has been sent successfully!");
      // Update local state
      setReportedPosts(prev =>
        prev.map(item =>
          item.post._id === postId
            ? { ...item, status: action === "remove" ? "removed" : "warned" }
            : item
        )
      );
    } catch (error) {
      console.error("Error sending action report:", error);
      Alert.alert("Error", "Failed to send action report. Please try again.");
    }
  };

  const removePost = async (postId, reason) => {
    try {
      // Replace with actual API call
      console.log("Removing post:", postId, "Reason:", reason);
      await sendActionReports(postId, "remove", reason);
      
      Alert.alert("Success", "Post has been removed successfully!");
      
      // Update local state
      setReportedPosts(prev => 
        prev.map(item => 
          item.post._id === postId 
            ? { ...item, status: "removed" }
            : item
        )
      );
      
      setActionModalVisible(false);
      setActionReason("");
      setSelectedPost(null);
    } catch (error) {
      console.error("Error removing post:", error);
      Alert.alert("Error", "Failed to remove post. Please try again.");
    }
  };

  const warnUser = async (userId, postId, reason) => {
    try {
      // Replace with actual API call
      console.log("Warning user:", userId, "for post:", postId, "Reason:", reason);
      
      await sendActionReports(postId, "warn", reason);

      Alert.alert("Success", "Warning has been sent to the user!");
      
      // Update local state
      setReportedPosts(prev => 
        prev.map(item => 
          item.post._id === postId 
            ? { ...item, status: "warned" }
            : item
        )
      );
      
      setActionModalVisible(false);
      setActionReason("");
      setSelectedPost(null);
    } catch (error) {
      console.error("Error warning user:", error);
      Alert.alert("Error", "Failed to send warning. Please try again.");
    }
  };

  const dismissReports = async (postId) => {
    Alert.alert(
      "Dismiss Reports",
      "Are you sure you want to dismiss all reports for this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dismiss",
          style: "default",
          onPress: async () => {
            try {
              // Replace with actual API call
              console.log("Dismissing reports for post:", postId);

              await sendActionReports(postId, "dismiss", "Reports dismissed by admin");
              
              Alert.alert("Success", "Reports have been dismissed!");
              
              // Update local state
              setReportedPosts(prev => 
                prev.map(item => 
                  item.post._id === postId 
                    ? { ...item, status: "dismissed" }
                    : item
                )
              );
            } catch (error) {
              console.error("Error dismissing reports:", error);
              Alert.alert("Error", "Failed to dismiss reports. Please try again.");
            }
          },
        },
      ]
    );
  };

  const showPostDetails = (item) => {
    setSelectedPost(item);
    setDetailModalVisible(true);
  };

  const showActionModal = (item, action) => {
    setSelectedPost({ ...item, action });
    setActionModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FF9800";
      case "removed": return "#F44336";
      case "warned": return "#2196F3";
      case "dismissed": return "#4CAF50";
      default: return "#9E9E9E";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "removed": return "Removed";
      case "warned": return "Warned";
      case "dismissed": return "Dismissed";
      default: return "Unknown";
    }
  };

  const renderReportedPost = ({ item }) => {
    // item is a report
    const post = item.post;
    const reporter = item.reporter;
    return (
      <TouchableOpacity 
        style={styles.postCard}
        onPress={() => showPostDetails(item)}
      >
        <View style={styles.postHeader}>
          <Image 
            source={{ uri: post?.preview || post?.media?.[0] || "https://via.placeholder.com/50" }} 
            style={styles.authorAvatar} 
          />
          <View style={styles.postInfo}>
            <Text style={styles.authorName}>{reporter?.userName || reporter?.firstName || "Unknown"}</Text>
            <Text style={styles.postDate}>{item.createdAt ? formatDate(item.createdAt) : ""}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        {post?.preview && (
          <Image source={{ uri: post.preview }} style={styles.postImage} />
        )}

        <Text style={styles.postContent} numberOfLines={3}>
          {post?.caption || "Post data not available."}
        </Text>

        <View style={styles.reportPreview}>
          <Text style={styles.reportTitle}>Report Reason:</Text>
          <Text style={styles.reportReason}>{item.reason || "No reason"}</Text>
          <Text style={styles.reportDescription} numberOfLines={2}>
            Reported by: {reporter?.userName || "Unknown"}
          </Text>
        </View>

        {item.status === "pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => showActionModal(item, "remove")}
            >
              <Ionicons name="trash" size={16} color="#fff" />
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.warnButton}
              onPress={() => showActionModal(item, "warn")}
            >
              <Ionicons name="warning" size={16} color="#fff" />
              <Text style={styles.buttonText}>Warn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => dismissReports(item?._id)}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const pendingPosts = reportedPosts.filter(item => item.status === "pending");
  const resolvedPosts = reportedPosts.filter(item => item.status !== "pending");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{pendingPosts.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{resolvedPosts.length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{reportedPosts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Posts List */}
      {reportedPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No reported posts found</Text>
          <Text style={styles.emptySubText}>All posts are following guidelines!</Text>
        </View>
      ) : (
        <FlatList
          data={reportedPosts}
          renderItem={renderReportedPost}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchReportedPosts(1)} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onEndReached={() => {
            if (hasNextPage && !loadingMore) {
              fetchReportedPosts(page + 1, true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasNextPage ? (
              <TouchableOpacity
                style={{ padding: 16, alignItems: "center" }}
                onPress={() => fetchReportedPosts(page + 1, true)}
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

      {/* Post Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Show post info if available */}
                {selectedPost.post ? (
                  <>
                    <View style={styles.postDetailHeader}>
                      <Image 
                        source={{ uri: selectedPost.post.preview || selectedPost.post.media?.[0] || "https://via.placeholder.com/50" }} 
                        style={styles.authorAvatar} 
                      />
                      <View style={styles.postInfo}>
                        <Text style={styles.authorName}>{selectedPost.reporter?.userName || selectedPost.reporter?.firstName || "Unknown"}</Text>
                        <Text style={styles.postDate}>{formatDate(selectedPost.createdAt)}</Text>
                      </View>
                    </View>

                    {selectedPost.post.preview && (
                      <Image 
                        source={{ uri: selectedPost.post.preview }} 
                        style={styles.detailPostImage} 
                      />
                    )}

                    <Text style={styles.detailPostContent}>{selectedPost.post.caption}</Text>
                  </>
                ) : (
                  <Text style={styles.detailPostContent}>Post data not available.</Text>
                )}

                <Text style={styles.reportsTitle}>Report Info:</Text>
                <View style={styles.reportDetailItem}>
                  <View style={styles.reportDetailHeader}>
                    <Text style={styles.reportReason}>{selectedPost.reason}</Text>
                    <Text style={styles.reportDate}>{formatDate(selectedPost.createdAt)}</Text>
                  </View>
                  <Text style={styles.reportedBy}>Reported by: {selectedPost.reporter?.userName || "Unknown"}</Text>
                  <Text style={styles.reportDescription}>Status: {getStatusText(selectedPost.status)}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionModalContent}>
            <Text style={styles.modalTitle}>
              {selectedPost?.action === "remove" ? "Remove Post" : "Warn User"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedPost?.action === "remove" 
                ? "Are you sure you want to remove this post?" 
                : "Send a warning to the user about this post?"
              }
            </Text>

            <Text style={styles.inputLabel}>Reason:</Text>
            <TextInput
              style={styles.textInput}
              value={actionReason}
              onChangeText={setActionReason}
              placeholder={`Enter ${selectedPost?.action} reason...`}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setActionModalVisible(false);
                  setActionReason("");
                  setSelectedPost(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: selectedPost?.action === "remove" ? "#F44336" : "#FF9800" }
                ]}
                onPress={() => {
                  if (selectedPost?.action === "remove") {
                    removePost(selectedPost.post?._id, actionReason);
                  } else {
                    warnUser(selectedPost.post?.author?._id, selectedPost.post?._id, actionReason);
                  }
                }}
                disabled={!actionReason.trim()}
              >
                <Text style={styles.confirmButtonText}>
                  {selectedPost?.action === "remove" ? "Remove Post" : "Send Warning"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  statBox: {
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
  postCard: {
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
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  postDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  reportPreview: {
    backgroundColor: "#fff5f5",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F44336",
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F44336",
    marginBottom: 4,
  },
  reportReason: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 13,
    color: "#333",
  },
  reportedBy: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  removeButton: {
    backgroundColor: "#F44336",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  warnButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  dismissButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
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
  detailModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "95%",
    maxHeight: "80%",
    padding: 20,
  },
  actionModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  postDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailPostImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailPostContent: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  reportDetailItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reportDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
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
    marginBottom: 20,
    textAlignVertical: "top",
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
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default ReportedPostsScreen;
