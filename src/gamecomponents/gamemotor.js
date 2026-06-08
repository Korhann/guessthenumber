import { StyleSheet,View,TextInput,Alert,Text,TouchableOpacity, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useState, useRef, useEffect } from "react";
import MyButton from "./button";
import { useAuth } from '../context/AuthContext';
import StartGameScreen, { getSocket } from "../screens/startGameScreen";
import { showAlert, CustomAlertProvider } from "../constants/customAlert";
import {useNavigation} from '@react-navigation/native';

const API_URL = 'http://192.168.1.108:3000';


export default function GameMotor({ 
    onSecretSubmit,
    targetNumber,
    onGuessSubmitted,
    hideConfirm = false ,
    buttonClickable,
    username,
    roomId,
    playerRole
}) {
    const { token, isLoading, user} = useAuth();
    const [firstvalue, setfirstvalue] = useState('');
    const [secondvalue, setsecondvalue] = useState('');
    const [thirdvalue, setthirdvalue] = useState('');
    const [fourthvalue, setforthvalue] = useState('');

    // for going to the next textinput
    const firstInput = useRef(null);
    const secondInput = useRef(null);
    const thirdInput = useRef(null);
    const fourthInput = useRef(null);

    const [isEnteringNumber, setIsEnteringNumber] = useState(true);
    const [secretNumber, setSecretNumber] = useState('');
    const [resultModalVisible, setResultModalVisible] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [resultCallback, setResultCallback] = useState(null);

    //initialize the socket
    const socket = getSocket();
    const navigation = useNavigation();

    const handleSecretNumberChange = (text) => {
        const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
        setSecretNumber(filtered);
    };

    const handleSecretNumberSubmit = () => {
        const repeatingdigits = hasRepeatingdigits(secretNumber);
        const isFirstnumZero = startsWithZero(secretNumber);

        let t1 = 'The digits must be different from each other';
        let t2 = 'First digit can not be 0';
        let t3 = 'You must enter a 4 digit number';

        if (repeatingdigits) {
            setIsEnteringNumber(true);
            handleError(t1);
        } else if (isFirstnumZero) {
            setIsEnteringNumber(true);
            handleError(t2);
        } else if (secretNumber.length !== 4) {
            setIsEnteringNumber(true);
            handleError(t3);
        } else {
            if (onSecretSubmit) {
                onSecretSubmit(secretNumber);
            } else {
                setIsEnteringNumber(false);
            }
        }
    };

    function hasRepeatingdigits(N) {
        return (/([0-9]).*?\1/).test(N)
    }

    function startsWithZero(n) {
        return n.startsWith('0');
    }

    const handleError = (text) => {
        Alert.alert(
            "Error",
            text,
            [{ text: "OK"}]
        );
    };

    const handleFirstChange = (text) => {
        setfirstvalue(text);
        if (text.length === 1) {
            secondInput.current?.focus();
        }
    };

    const handleSecondChange = (text) => {
        setsecondvalue(text);
        if (text.length === 1) {
            thirdInput.current?.focus();
        }
    };

    const handleThirdChange = (text) => {
        setthirdvalue(text);
        if (text.length === 1) {
            fourthInput.current?.focus();
        }
    };

    const compareSubmission = () => {
        if (!targetNumber) return;
        
        const secretNumberIndexed = targetNumber.toString().split('').map(Number);
        const myValues = [firstvalue,secondvalue,thirdvalue,fourthvalue].map(Number);

        let truePosition = 0;
        let wrongPosition = 0;
        let allTrue = false;

        myValues.forEach((val, index) => {
            const isPresent = secretNumberIndexed.includes(val);
            const isAtSamePos = secretNumberIndexed[index] === val;

            if (isPresent && !isAtSamePos) {
                wrongPosition--;
            } else if (isAtSamePos) {
                truePosition++;
                if (truePosition === 4) {
                    allTrue = true;
                }
            }
        });

        if (allTrue) {
            // send alert to finish the game
            finishTheGame();
        } else {
            Alert.alert(
            "Result",
            `Correct position: ${truePosition}\nWrong position: ${Math.abs(wrongPosition)}`,
            [{ text: "OK", onPress: () => {
                setfirstvalue('');
                setsecondvalue('');
                setthirdvalue('');
                setforthvalue('');
                if (onGuessSubmitted) onGuessSubmitted();
            }}
        ]);
        }
    }

    // finish thte game and disconnect both users from the room
    function finishTheGame() {
        if (!socket) return;
        socket.emit('game_finished',{username,roomId});
        socket.emit('end_game',{roomId});
    }

    useEffect(() => {
        if (!socket) return;

        socket.on('game_over',(data) => {
            const mySecret = playerRole === 1 ? data.player1Secret : data.player2Secret;
            showAlert({
                title: "Game Finished",
                message: `${data.winner} won the game!\nYour secret: ${mySecret}`,
                buttons: [{ text: "OK", onPress: () => {
                    setfirstvalue('');
                    setsecondvalue('');
                    setthirdvalue('');
                    setforthvalue('');
                    if (onGuessSubmitted) onGuessSubmitted();
                    navigation.navigate('Main');
                }}],
                backgroundColor: '#1B5E20',
                titleColor: '#FFFFFF',
                messageColor: '#E8F5E9',
                buttonBgColor: '#4CAF50',
                buttonTextColor: '#FFFFFF',
            });
        });

        return () => {
            socket.off('game_over');
            socket.off('users_disconnected');
        }
    });

    if (targetNumber) {
        return (
            <>
            <CustomAlertProvider />
            <View style={styles.topContainer}>
                <View style={styles.container}>
                <TextInput 
                ref={firstInput}
                style= {styles.boxStyle}
                keyboardType="numeric"
                maxLength={1}
                value={firstvalue}
                onChangeText={handleFirstChange}
                textAlign="center"
                selectTextOnFocus={true}
                />
                <TextInput 
                ref={secondInput}
                style= {styles.boxStyle}
                keyboardType="numeric"
                maxLength={1}
                value={secondvalue}
                onChangeText={handleSecondChange}
                textAlign="center"
                selectTextOnFocus={true}
                />
                <TextInput 
                ref={thirdInput}
                style= {styles.boxStyle}
                keyboardType="numeric"
                maxLength={1}
                value={thirdvalue}
                onChangeText={handleThirdChange}
                textAlign="center"
                selectTextOnFocus={true}
                />
                <TextInput 
                ref={fourthInput}
                style= {styles.boxStyle}
                keyboardType="numeric"
                maxLength={1}
                value={fourthvalue}
                onChangeText={setforthvalue}
                textAlign="center"
                selectTextOnFocus={true}
                />
            </View>
            <MyButton title={'Submit'} onPress={compareSubmission} buttonClickable={buttonClickable}></MyButton>
            </View>
            </>
        );
    }

    if (isEnteringNumber) {
        return (
            <>
            <CustomAlertProvider />
            <View style={styles.topContainer}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={styles.container}>
                    <TextInput 
                    style={styles.boxStyle2}
                    value={secretNumber}
                    onChangeText={handleSecretNumberChange}
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    maxLength={4}
                    textAlign="center"
                    placeholder="Enter 4-digit number"
                    placeholderTextColor="#FFFFFF"
                    />
                </View>
                </TouchableWithoutFeedback>
                {
                !hideConfirm && <MyButton title={'Confirm'} onPress={handleSecretNumberSubmit} buttonClickable={true}>
                    </MyButton>
                }
            </View>
            </>
        );
    }

    return <CustomAlertProvider />;
}

const styles = StyleSheet.create({
    topContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    boxStyle: {
        width: 40,
        height: 60,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    boxStyle2: {
        width: 200,
        height: 60,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 5
    },
    buttonpadding: {
        marginTop: 20
    },
    startButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginBottom: 20,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
