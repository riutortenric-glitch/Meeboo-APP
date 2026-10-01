import { useClerk } from '@clerk/expo';
import { Pressable, Text } from 'react-native';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function MeScreen() {
  const { signOut } = useClerk();
  return (
    <PlaceholderScreen title="Me" note="Profile, settings & account deletion — phase 5.">
      <Pressable className="rounded-full bg-glass-strong px-6 py-3" onPress={() => signOut()}>
        <Text className="font-semibold text-white">Sign out</Text>
      </Pressable>
    </PlaceholderScreen>
  );
}
