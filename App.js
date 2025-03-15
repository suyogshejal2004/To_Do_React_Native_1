import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Setup notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Splash Screen
const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('TodoScreen');
    }, 2000);
  }, []);

  return (
    <LinearGradient colors={['#FF512F', '#DD2476']} style={styles.splashContainer}>
      <Text style={styles.splashText}>To-Do App</Text>
    </LinearGradient>
  );
};

// Main To-Do Screen
const TodoScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadTasks();
    requestPermissions();
  }, []);

  // Request Notification Permission
  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Enable notifications to get reminders!');
    }
  };

  // Load tasks from storage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (error) {
      console.error(error);
    }
  };

  // Save tasks to storage
  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error(error);
    }
  };

  // Schedule a Notification
  const scheduleNotification = async (task, date) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder',
        body: `Task: ${task}`,
        sound: true,
      },
      trigger: new Date(date),
    });
    Alert.alert('Reminder Set', `Task reminder set for ${date.toLocaleString()}`);
  };

  // Add a new task
  const addTask = () => {
    if (task.trim()) {
      const newTask = { text: task, date: date.toLocaleString() };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setTask('');
      saveTasks(updatedTasks);
      scheduleNotification(task, date);
    }
  };

  // Remove a task
  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  return (
    <LinearGradient colors={['#1D2671', '#C33764']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerText}>Reminder: {date.toLocaleString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.taskItem}>
            <View>
              <Text style={styles.taskText}>{item.text}</Text>
              <Text style={styles.taskDate}>{item.date}</Text>
            </View>
            <TouchableOpacity onPress={() => removeTask(index)}>
              <Ionicons name="trash-outline" size={22} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter task"
          placeholderTextColor="#aaa"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons name="add-circle" size={50} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// Settings Screen
const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text>Feature settings coming soon...</Text>
    </View>
  );
};

// Navigation Stack
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="TodoScreen" component={TodoScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  splashContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  datePickerButton: { padding: 12, backgroundColor: '#ffffff22', borderRadius: 10, marginBottom: 10 },
  datePickerText: { color: 'white', fontWeight: 'bold' },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 8 },
  taskText: { fontSize: 18, fontWeight: 'bold' },
  taskDate: { fontSize: 14, color: 'gray' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  input: { flex: 1, padding: 10, backgroundColor: '#ffffff99', borderRadius: 10, color: 'black' },
  addButton: { marginLeft: 10 },
});
