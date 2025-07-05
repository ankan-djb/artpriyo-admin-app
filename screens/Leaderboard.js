import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../services/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Leaderboard = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    // Initial fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Fetch events from API
    fetchEvents();
  }, []);

  // Function to fetch events from API
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await apiService.eventService.getAllEvents();
      console.log(JSON.stringify(response.data, null, 2));
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "completed") return event.status === "completed";
    if (selectedFilter === "ongoing") return event.status === "ongoing";
    if (selectedFilter === "upcoming") return event.status === "upcoming";
    return true;
  });

  const handleEventPress = async (event) => {
    setSelectedEvent(event);
    setLoading(true);
    setLeaderboardData([]);

    console.log("Selected event:", event._id);

    // Animation for modal
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const response = await apiService.eventService.getEventLeaderboard(
        event._id
      );
      console.log(
        "Participant details: " + JSON.stringify(response.data, null, 2)
      );

      // Transform leaderboard data to match the expected format
      if (
        response.data &&
        response.data.leaderboard &&
        response.data.leaderboard.length > 0
      ) {
        const leaderboard = response.data.leaderboard.map((entry, index) => ({
          id: index + 1,
          name: entry.participant.name,
          username: entry.participant.userName,
          avatar: entry.participant.image || "https://via.placeholder.com/100",
          points: entry.stats.totalLikes * 10, // Calculate points (likes x 10)
          rank: index + 1,
          badge:
            index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "",
          submissions: entry.stats.totalPosts || 0,
          likes: entry.stats.totalLikes || 0,
          posts: entry.stats.posts || [],
        }));

        setLeaderboardData(leaderboard);
        console.log("Processed leaderboard data:", leaderboard);
      } else {
        console.log("No leaderboard data found in response");
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
      setShowLeaderboard(true);
    }
  };

  const closeLeaderboard = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLeaderboard(false);
      setSelectedEvent(null);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents().finally(() => {
      setRefreshing(false);
    });
  };

  const renderEventCard = ({ item }) => (
    <View style={styles.eventCardWrapper}>
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: item.image }} style={styles.eventImage} />
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "completed"
                    ? "#4CAF50"
                    : item.status === "ongoing"
                    ? "#FF9800"
                    : "#2196F3",
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={2}>
            {item.eventName}
          </Text>
          <Text style={styles.eventCategory}>
            Prize Pool: ₹{item.prizePool}
          </Text>

          <View style={styles.eventStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={styles.statText}>
                {item.participants ? item.participants.length : 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.statText}>
                {new Date(item.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewLeaderboardBtn}>
            <Text style={styles.viewLeaderboardText}>View Leaderboard</Text>
            <Ionicons name="chevron-forward" size={16} color="#297BCE" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={[styles.leaderboardItem, index < 3 && styles.topThreeItem]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{item.rank}</Text>
      </View>

      <Image
        source={{ uri: item.avatar }}
        style={styles.participantAvatar}
        defaultSource={require("../assets/icon.png")}
      />

      <View style={styles.participantDetails}>
        <Text style={styles.participantName}>{item.name}</Text>
        <Text style={styles.participantUsername}>@{item.username}</Text>
        <View style={styles.participantStats}>
          <View style={styles.statDetail}>
            <Ionicons name="image-outline" size={14} color="#666" />
            <Text style={styles.submissions}>{item.submissions} posts</Text>
          </View>
          <View style={styles.statDetail}>
            <Ionicons name="heart-outline" size={14} color="#666" />
            <Text style={styles.likes}>
              {item.submissions > 0 ? `${item.likes} likes` : "No posts"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rankingContainer}>
        {index < 3 ? (
          <Text
            style={[
              styles.rankBadge,
              index === 0
                ? styles.firstRank
                : index === 1
                ? styles.secondRank
                : styles.thirdRank,
            ]}
          >
            {item.badge}
          </Text>
        ) : (
          <Text style={styles.regularRank}>#{item.rank}</Text>
        )}
        <Text style={styles.pointsLabel}>{item.points} pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: "all", label: "All Events" },
          { key: "upcoming", label: "Upcoming" },
          { key: "ongoing", label: "Ongoing" },
          { key: "completed", label: "Completed" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}
              numberOfLines={1}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events Grid */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {loadingEvents ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#297BCE" />
            <Text style={styles.loadingText}>Loading Events...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubText}>
              There are no events matching your current filter
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item._id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapperStyle}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.eventsContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#297BCE"
                colors={["#297BCE"]}
              />
            }
          />
        )}
      </Animated.View>

      {/* Leaderboard Modal */}
      <Modal
        visible={showLeaderboard}
        transparent={true}
        animationType="none"
        onRequestClose={closeLeaderboard}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#297BCE" />
                <Text style={styles.loadingText}>Loading Leaderboard...</Text>
              </View>
            ) : (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={closeLeaderboard}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedEvent?.eventName}
                    </Text>
                    <Text style={styles.modalSubtitle}>Leaderboard</Text>
                  </View>
                  <View style={styles.headerRight} />
                </View>

                {/* Leaderboard Content */}
                {leaderboardData.length > 0 ? (
                  <ScrollView
                    style={styles.leaderboardScrollView}
                    contentContainerStyle={styles.leaderboardScrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    {/* Top Performers Banner */}
                    {leaderboardData.length >= 1 && (
                      <View style={styles.topThreeBanner}>
                        <View style={styles.bannerHeader}>
                          <Ionicons name="trophy" size={20} color="#FFD700" />
                          <Text style={styles.bannerTitle}>Top Performers</Text>
                        </View>
                        <View style={styles.topThreeContainer}>
                          {leaderboardData
                            .slice(0, Math.min(3, leaderboardData.length))
                            .map((participant, index) => (
                              <View
                                key={`top-${index}`}
                                style={styles.topParticipant}
                              >
                                <View
                                  style={[
                                    styles.topBadgeContainer,
                                    index === 0
                                      ? styles.firstBadge
                                      : index === 1
                                      ? styles.secondBadge
                                      : styles.thirdBadge,
                                  ]}
                                >
                                  <Text style={styles.topBadgeText}>
                                    {participant.badge}
                                  </Text>
                                </View>
                                <Image
                                  source={{ uri: participant.avatar }}
                                  style={styles.topAvatar}
                                  defaultSource={require("../assets/icon.png")}
                                />
                                <Text style={styles.topName} numberOfLines={1}>
                                  {participant.name}
                                </Text>
                                <Text style={styles.topLikes}>
                                  {participant.submissions > 0
                                    ? `${participant.likes} likes`
                                    : "No posts yet"}
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    )}

                    {/* Full Rankings List */}
                    <View style={styles.rankingsSection}>
                      <Text style={styles.sectionTitle}>All Participants</Text>

                      {/* Participant List Items */}
                      {leaderboardData.map((item, index) => (
                        <View key={`participant-${index}`}>
                          {renderLeaderboardItem({ item, index })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.emptyLeaderboardContainer}>
                    <Ionicons name="people-outline" size={70} color="#ccc" />
                    <Text style={styles.emptyLeaderboardTitle}>
                      No Participants Yet
                    </Text>
                    <Text style={styles.emptyLeaderboardText}>
                      No one has joined this event yet. Check back later!
                    </Text>
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerRight: {
    width: 30,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 3,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    minWidth: 70,
  },
  activeFilterTab: {
    backgroundColor: "#297BCE",
    borderColor: "#297BCE",
  },
  filterText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  activeFilterText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  eventsContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  eventCardWrapper: {
    width: "48%",
    margin: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  eventImageContainer: {
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  eventInfo: {
    padding: 15,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  eventCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  eventStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#666",
  },
  viewLeaderboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  viewLeaderboardText: {
    color: "#297BCE",
    fontWeight: "600",
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.8, // Fixed height instead of maxHeight
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
  },
  loadingContainer: {
    padding: 50,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f9fa",
  },
  closeButton: {
    padding: 5,
  },
  modalTitleContainer: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  leaderboardScrollView: {
    flex: 1,
  },
  leaderboardScrollContent: {
    paddingBottom: 30,
  },
  topThreeBanner: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  topParticipant: {
    alignItems: "center",
    width: screenWidth * 0.25,
  },
  topBadgeContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  firstBadge: {
    backgroundColor: "#FFD700",
  },
  secondBadge: {
    backgroundColor: "#C0C0C0",
  },
  thirdBadge: {
    backgroundColor: "#CD7F32",
  },
  topBadgeText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  topAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 8,
  },
  topName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  topLikes: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  rankingsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  leaderboardList: {
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  topThreeItem: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#297BCE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  participantUsername: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  participantStats: {
    flexDirection: "row",
    marginTop: 4,
  },
  statDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  submissions: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  likes: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  rankingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
  },
  rankBadge: {
    fontSize: 20,
    marginBottom: 2,
  },
  firstRank: {
    color: "#FFD700",
  },
  secondRank: {
    color: "#C0C0C0",
  },
  thirdRank: {
    color: "#CD7F32",
  },
  regularRank: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  pointsLabel: {
    fontSize: 11,
    color: "#666",
  },
  emptyLeaderboardContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  emptyLeaderboardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#555",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyLeaderboardText: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "80%",
  },
  emptyListContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 14,
    color: "#666",
  },
  columnWrapperStyle: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "#f9f9f9",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    maxWidth: "80%",
  },
});

export default Leaderboard;
