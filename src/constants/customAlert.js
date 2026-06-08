import React, { useState, useCallback } from 'react';
import { Modal, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const alertInstances = [];
let listeners = [];

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function showAlert({ 
  title = 'Alert', 
  message = '', 
  buttons = [{ text: 'OK', onPress: () => {} }],
  backgroundColor = '#1E1E24',
  titleColor = '#FFFFFF',
  messageColor = '#FFFFFF',
  buttonBgColor = '#007AFF',
  buttonTextColor = '#FFFFFF',
}) {
  alertInstances.push({
    title,
    message,
    buttons,
    backgroundColor,
    titleColor,
    messageColor,
    buttonBgColor,
    buttonTextColor,
  });
  notifyListeners();
}

export function CustomAlertProvider() {
  const [currentAlert, setCurrentAlert] = useState(null);

  const checkForAlert = useCallback(() => {
    if (alertInstances.length > 0 && !currentAlert) {
      const nextAlert = alertInstances.shift();
      setCurrentAlert(nextAlert);
    }
  }, [currentAlert]);

  React.useEffect(() => {
    listeners.push(checkForAlert);
    checkForAlert();
    return () => {
      listeners = listeners.filter(fn => fn !== checkForAlert);
    };
  }, [checkForAlert]);

  if (!currentAlert) return null;

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    setCurrentAlert(null);
    setTimeout(checkForAlert, 100);
  };

  return (
    <Modal transparent={true} visible={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: currentAlert.backgroundColor }]}>
          <Text style={[styles.alertTitle, { color: currentAlert.titleColor }]}>{currentAlert.title}</Text>
          <Text style={[styles.alertMessage, { color: currentAlert.messageColor }]}>{currentAlert.message}</Text>
          <View style={styles.buttonContainer}>
            {currentAlert.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleButtonPress(button)}
                style={[styles.alertButton, { backgroundColor: currentAlert.buttonBgColor }]}
              >
                <Text style={[styles.alertButtonText, { color: currentAlert.buttonTextColor }]}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { width: 300, padding: 20, borderRadius: 12, alignItems: 'center' },
  alertTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', gap: 10 },
  alertButton: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 6 },
  alertButtonText: { fontWeight: 'bold' },
});
