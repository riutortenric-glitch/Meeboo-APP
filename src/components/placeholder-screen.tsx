import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = { title: string; note?: string; children?: ReactNode };

/** Temporary screen shell used until each tab is built against its design reference. */
export function PlaceholderScreen({ title, note, children }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-sky-top">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Image
          source={require('@/assets/mascot/meeboo-mascot.png')}
          style={{ width: 140, height: 140 }}
          contentFit="contain"
        />
        <Text className="text-3xl font-bold text-white">{title}</Text>
        {note ? <Text className="text-center text-base text-white/80">{note}</Text> : null}
        {children}
      </View>
    </SafeAreaView>
  );
}
