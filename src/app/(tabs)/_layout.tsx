import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workouts">
        <NativeTabs.Trigger.Label>Workouts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bolt.fill" md="bolt" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nutrition">
        <NativeTabs.Trigger.Label>Nutrition</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Label>Me</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
