import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Platform, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';
import * as Animatable from 'react-native-animatable';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null); 
  const [showMessage, setShowMessage] = useState(false); 
  const [loading, setLoading] = useState(false);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      setLoading(false); 
      setShowMessage(true);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const handleButtonPress = async () => {
    setLoading(true); 
    setShowMessage(false);
    setNotification(null);

    await schedulePushNotification();
  };

  return (
    <SafeAreaView style={styles.mainScreen}>
      <View style={styles.mainScreenImageView}>
        <Animatable.Image 
          source={require('./images/notificationsImage.png')} 
          style={styles.mainScreenImage} 
          resizeMode='contain' 
          animation='flipInY'
        />
        <Text style={styles.mainScreenTitle}>
          Clique no botão e receba uma notificação {expoPushToken}
        </Text>
        
        {loading && <ActivityIndicator size="large" color="#fff" />}
        
        {showMessage && notification && (
          <View style={styles.messageView}>
            <Text style={styles.mainScreenText}>
              {notification.request.content.title}
            </Text>
            <Text style={styles.mainScreenText}>
              {notification.request.content.body}
            </Text>
          </View>
        )}
    
        <TouchableOpacity
          style={styles.button}
          onPress={handleButtonPress}
        >
          <Text style={styles.buttonText}>Pressione para receber uma notificação</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos.",
      body: 'Provérbios 16:3',
      data: { data: 'dados adicionais' },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Falha ao obter a permissão para notificações!');
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}

const styles = StyleSheet.create({
  mainScreen:{
    flex: 1,
    backgroundColor: "#451776", 
  },

  mainScreenImageView:{
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    flex: 1.5,
  },

  mainScreenImage:{
    width: 300,
    height: 300,
  },

  mainScreenTitle:{
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },

  mainScreenText:{
    fontFamily: 'Poppins_600SemiBold',
    color: "#fff",
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#72418C',
    padding: 10,
    borderRadius: 5,
    width: '70%',
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },

  messageView:{
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D1365',
    padding: 10,
    borderRadius: 20,
    width: '70%',
    marginTop: 20,
  }
});
