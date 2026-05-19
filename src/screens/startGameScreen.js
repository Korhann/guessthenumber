import {useEffect, useState} from "react";
import { StyleSheet,View,TouchableOpacity, Alert, Text, ActivityIndicator, Modal} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useAuth } from "../context/AuthContext";
import { io } from 'socket.io-client';
import { API_URL, mac_IP_localHost } from "../../config";   


let socket = null;
let playerList = [];

export function initSocket() {
    if (!socket) {
        socket = io(mac_IP_localHost, {
            transports: ['websocket'],
            autoConnect: true,
        });
        socket.on('connection', () => {
            console.log('Connected to server:', socket.id);
        });

        socket.on('waiting_room', (data) => {
            console.log(`${data.username} is in the waiting room`);
        });

        socket.on('game_start', (data) => {
            console.log('Match found:', data);
            Alert.alert('Match Found!', 'Game is starting!');
        });


        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }
    return socket;
}

export function startGame(username, userId) {
    playerList.push(userId);
    if (!socket) {
        socket = initSocket();
    }
    if (!socket.connected) {
        socket.connect();
    }
    console.log('starting the game');
    socket.emit('waiting_room',{username,userId});
}

export function getSocket() {
    return socket;
}

export default function StartGameScreen() {

    const navigation = useNavigation();
    const { token, isLoading, user} = useAuth();
    const [userId, setUserId] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (socket) {
        socket.on('game_start', (data) => {
            console.log('game_start received in component:', data);
            setIsSearching(false);
            navigation.navigate('Game', {
                roomId: data.roomId,
                opponent: data.opponent,
                playerRole: data.playerRole
            });
        });
            return () => {
                socket.off('game_start');
            }
        }
    },[socket,navigation]);


    const getUserData = async () => {
        try {
            if (!token) {
                throw new Error('No auth token available');
            }
            const response = await fetch(`${API_URL}/api/auth/getMe`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            return {id: data._id, username: data.username };
        } catch (e) {
            console.error('Failed to get user ID:', e);
            return null;
        }
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.topContainer}>
                <TouchableOpacity
                style={styles.startButton}
                onPress= { async () => {
                    const userData = await getUserData();
                    if (userData) {
                        setUserId(userData.id);
                        setIsSearching(true);
                        initSocket();
                        startGame(userData.username, userData.id);
                    }
                }}
            >
                <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
            </View>
            <Modal
                visible={isSearching}
                transparent={true}
                animationType="fade"
                onRequestClose={() => null}
            >
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>Looking for an opponent...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    topContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginBottom: 20,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#333',
    }
});