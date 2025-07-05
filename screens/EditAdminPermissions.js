import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';

const EditAdminPermissions = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { admin } = route.params;
  
  const [selectedRole, setSelectedRole] = useState(admin.role);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Content Admin', value: 'content_admin' },
    { label: 'Event Admin', value: 'event_admin' },
    { label: 'User Admin', value: 'user_admin' },
  ];

  const handleUpdateRole = async () => {
    if (selectedRole === admin.role) {
      Alert.alert('No Changes', 'No changes were made to the administrator role.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.adminService.updateAdminRole(admin._id, { role: selectedRole });

      if (response.data.success) {
        Alert.alert('Success', 'Administrator role updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Permissions</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.adminInfo}>
          <View style={styles.adminHeader}>
            <Ionicons name="person-circle-outline" size={40} color="#4A90E2" />
            <View style={styles.adminTextContainer}>
              <Text style={styles.adminName}>{admin.name}</Text>
              <Text style={styles.adminEmail}>{admin.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.roleContainer}>
            <Text style={styles.label}>Current Role</Text>
            <View style={styles.currentRoleContainer}>
              <Ionicons name="shield-outline" size={20} color="#4A90E2" />
              <Text style={styles.currentRole}>{admin.role.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.roleContainer}>
            <Text style={styles.label}>New Role</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedRole}
                onValueChange={(value) => setSelectedRole(value)}
                style={styles.picker}
              >
                {roles.map((role) => (
                  <Picker.Item
                    key={role.value}
                    label={role.label}
                    value={role.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleUpdateRole}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Update Role</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  adminInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminTextContainer: {
    marginLeft: 15,
  },
  adminName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  adminEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  currentRole: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 10,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditAdminPermissions; 