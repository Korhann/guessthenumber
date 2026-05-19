import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useEffect, useState } from "react";
import GameMotor from "../gamecomponents/gamemotor";
import { getSocket, initSocket } from "./startGameScreen";
import { useRoute } from "@react-navigation/native";

export default function GameScreen() {
    const [player1Secret, setPlayer1Secret] = useState(null);
    const [player2Secret, setPlayer2Secret] = useState(null);
    const [activePlayer, setActivePlayer] = useState(1);
    const [iHaveSubmitted, setIHaveSubmitted] = useState(false);

    const socket = getSocket();

    const route = useRoute();
    const {roomId, opponent, playerRole} = route.params || {};

    const bothPlayersReady = player1Secret !== null && player2Secret !== null;

    const handleOpponentSecretSubmit = (secret) => {
        if (playerRole === 1) {
            setPlayer2Secret(secret);
        } else {
            setPlayer1Secret(secret);
        }
        setIHaveSubmitted(true);
        socket.emit('secret_submitted', { roomId, secret, playerRole });
    };

    const handleGuessSubmitted = () => {
        setActivePlayer(activePlayer === 1 ? 2 : 1);
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('opponent_secret_submitted', (data) => {
            if (data.playerRole === 1) {
                setPlayer2Secret(data.secret);
            } else {
                setPlayer1Secret(data.secret);
            }
        });

        return () => {
            socket.off('opponent_secret_submitted');
        };
    }, [socket]);

    if (!playerRole) {
        console.log('GameScreen params:', route.params);
        return (
            <View style={styles.mainContainer}>
                <View style={styles.singleGameContainer}>
                    <Text style={styles.playerText}>Loading game...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            {bothPlayersReady ? (
                <View style={styles.singleGameContainer}>
                    <Text style={styles.playerText}>
                        Player {activePlayer}'s Turn
                    </Text>
                    <GameMotor
                        targetNumber={activePlayer === 1 ? player1Secret : player2Secret}
                        onGuessSubmitted={handleGuessSubmitted}
                        username={activePlayer === 1 ? "Player1" : "Player2"}
                    />
                </View>
            ) : iHaveSubmitted ? (
                <View style={styles.singleGameContainer}>
                    <Text style={styles.readyText}>Waiting for opponent to enter the number...</Text>
                </View>
            ) : (
                <View style={styles.mainContainer}>
                    <Text style={styles.playerText}>Enter {opponent}'s secret number:</Text>
                    <GameMotor 
                        onSecretSubmit={handleOpponentSecretSubmit}
                        color={playerRole === 1 ? '#008000' : '#FF0000'}
                        username={playerRole === 1 ? "Player1" : "Player2"}
                        hideConfirm={false}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    singleGameContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    playerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    readyText: {
        fontSize: 18,
        color: 'green'
    },
    container1: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        borderBottomWidth: 4,
        borderBottomColor: '#000000',
    },
    container2: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    }
});