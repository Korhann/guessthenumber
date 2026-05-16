import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useEffect, useState } from "react";
import GameMotor from "../gamecomponents/gamemotor";
import { SafeAreaView } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

export default function GameScreen() {
    const [player1Secret, setPlayer1Secret] = useState(null);
    const [player2Secret, setPlayer2Secret] = useState(null);
    const [activePlayer, setActivePlayer] = useState(1);
    const [currentPlayer,setCurrentPlayer] = useState(1);

    const bothPlayersReady = player1Secret !== null && player2Secret !== null;

    const handlePlayer1Submit = (secret) => {
        setPlayer1Secret(secret);
    };

    const handlePlayer2Submit = (secret) => {
        setPlayer2Secret(secret);
    };

    const handleGuessSubmitted = () => {
        setActivePlayer(activePlayer === 1 ? 2 : 1);
    };


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
            ) : (
                <>
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View style={[styles.container1, player1Secret === null && {backgroundColor: '#008000'}]}>
                        <View style={styles.contentWrapper}>
                            {player1Secret === null ? (
                                <GameMotor onSecretSubmit={handlePlayer1Submit} color={'#008000'} username="Player1" />
                            ) : (
                                <Text style={styles.readyText}>Ready!</Text>
                            )}
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View pointerEvents={currentPlayer === 2 ? 'none': 'auto'} style={[styles.container2, player2Secret === null && {backgroundColor: '#FF0000'}]}>
                        <View style={styles.contentWrapper}>
                            {player2Secret === null ? (
                                <GameMotor onSecretSubmit={handlePlayer2Submit} color={'#FF0000'} username="Player2"/>
                            ) : (
                                <Text style={styles.readyText}>Ready!</Text>
                            )}
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                </>
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