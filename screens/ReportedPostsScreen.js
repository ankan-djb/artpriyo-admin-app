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

  const fetchReportedPosts = async () => {
    setRefreshing(true);
    try {
      // Replace with actual API call
      const mockData = [
        {
          _id: "1",
          post: {
            _id: "post1",
            content: "This is some inappropriate content that violates community guidelines...",
            imageUrl: "https://via.placeholder.com/300x200",
            author: {
              _id: "user1",
              username: "problematic_user",
              profilePicture: "https://via.placeholder.com/50",
            },
            createdAt: "2025-01-05T08:30:00Z",
            likes: 15,
            comments: 8,
          },
          reports: [
            {
              _id: "report1",
              reportedBy: {
                username: "concerned_user1",
              },
              reason: "Hate speech",
              description: "This post contains offensive language and promotes hate",
              createdAt: "2025-01-05T10:30:00Z",
            },
            {
              _id: "report2",
              reportedBy: {
                username: "concerned_user2",
              },
              reason: "Inappropriate content",
              description: "This content is not suitable for the platform",
              createdAt: "2025-01-05T09:15:00Z",
            },
          ],
          totalReports: 2,
          status: "pending",
          lastReportedAt: "2025-01-05T10:30:00Z",
        },
        {
          _id: "2",
          post: {
            _id: "post2",
            content: "Spam content trying to sell fake products. Click here to buy now! Limited time offer!!!",
            imageUrl: "https://via.placeholder.com/300x200",
            author: {
              _id: "user2",
              username: "spam_account",
              profilePicture: "https://via.placeholder.com/50",
            },
            createdAt: "2025-01-04T14:20:00Z",
            likes: 2,
            comments: 1,
          },
          reports: [
            {
              _id: "report3",
              reportedBy: {
                username: "vigilant_user",
              },
              reason: "Spam",
              description: "This is clearly spam content trying to sell fake products",
              createdAt: "2025-01-04T16:45:00Z",
            },
          ],
          totalReports: 1,
          status: "pending",
          lastReportedAt: "2025-01-04T16:45:00Z",
        },
        {
          _id: "3",
          post: {
            _id: "post3",
            content: "This post was reported but found to be legitimate content about art techniques.",
            imageUrl: "https://via.placeholder.com/300x200",
            author: {
              _id: "user3",
              username: "art_lover",
              profilePicture: "https://via.placeholder.com/50",
            },
            createdAt: "2025-01-03T11:10:00Z",
            likes: 45,
            comments: 12,
          },
          reports: [
            {
              _id: "report4",
              reportedBy: {
                username: "misunderstood_user",
              },
              reason: "Inappropriate content",
              description: "I think this might be inappropriate",
              createdAt: "2025-01-03T12:30:00Z",
            },
          ],
          totalReports: 1,
          status: "dismissed",
          lastReportedAt: "2025-01-03T12:30:00Z",
        },
      ];
      
      setReportedPosts(mockData);
    } catch (error) {
      console.error("Error fetching reported posts:", error);
      Alert.alert("Error", "Failed to fetch reported posts. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportedPosts();
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

  const removePost = async (postId, reason) => {
    try {
      // Replace with actual API call
      console.log("Removing post:", postId, "Reason:", reason);
      
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

  const renderReportedPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => showPostDetails(item)}
    >
      <View style={styles.postHeader}>
        <Image source={{ uri: item.post.author.profilePicture }} style={styles.authorAvatar} />
        <View style={styles.postInfo}>
          <Text style={styles.authorName}>{item.post.author.username}</Text>
          <Text style={styles.postDate}>{formatDate(item.post.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.post.imageUrl && (
        <Image source={{ uri: item.post.imageUrl }} style={styles.postImage} />
      )}

      <Text style={styles.postContent} numberOfLines={3}>
        {item.post.content}
      </Text>

      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#F44336" />
          <Text style={styles.statText}>{item.post.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={16} color="#2196F3" />
          <Text style={styles.statText}>{item.post.comments}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flag" size={16} color="#FF9800" />
          <Text style={styles.statText}>{item.totalReports} Reports</Text>
        </View>
      </View>

      <View style={styles.reportPreview}>
        <Text style={styles.reportTitle}>Latest Report:</Text>
        <Text style={styles.reportReason}>{item.reports[0].reason}</Text>
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.reports[0].description}
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
            onPress={() => dismissReports(item.post._id)}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.buttonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

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
            <RefreshControl refreshing={refreshing} onRefresh={fetchReportedPosts} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
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
              <Text style={styles.modalTitle}>Post Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.postDetailHeader}>
                  <Image 
                    source={{ uri: selectedPost.post.author.profilePicture }} 
                    style={styles.authorAvatar} 
                  />
                  <View style={styles.postInfo}>
                    <Text style={styles.authorName}>{selectedPost.post.author.username}</Text>
                    <Text style={styles.postDate}>{formatDate(selectedPost.post.createdAt)}</Text>
                  </View>
                </View>

                {selectedPost.post.imageUrl && (
                  <Image 
                    source={{ uri: selectedPost.post.imageUrl }} 
                    style={styles.detailPostImage} 
                  />
                )}

                <Text style={styles.detailPostContent}>{selectedPost.post.content}</Text>

                <Text style={styles.reportsTitle}>All Reports ({selectedPost.reports.length}):</Text>
                {selectedPost.reports.map((report, index) => (
                  <View key={report._id} style={styles.reportDetailItem}>
                    <View style={styles.reportDetailHeader}>
                      <Text style={styles.reportReason}>{report.reason}</Text>
                      <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
                    </View>
                    <Text style={styles.reportDescription}>{report.description}</Text>
                    <Text style={styles.reportedBy}>Reported by: {report.reportedBy.username}</Text>
                  </View>
                ))}
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
                    removePost(selectedPost.post._id, actionReason);
                  } else {
                    warnUser(selectedPost.post.author._id, selectedPost.post._id, actionReason);
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
};

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
