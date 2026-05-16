import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GameScreen from '../screens/GameScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StartGameScreen from '../screens/startGameScreen';

const Tab = createBottomTabNavigator();

export default function NavigationTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Start Game"
        component={StartGameScreen} 
        options={{ title: 'Start Game' }} 
      />
      <Tab.Screen
      name='Profile'
      component={ProfileScreen}
      >
      </Tab.Screen>
    </Tab.Navigator>
  );
}
