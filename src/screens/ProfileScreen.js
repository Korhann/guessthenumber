import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyButton from '../gamecomponents/button';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout(navigation.navigate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <MyButton title="Logout" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});