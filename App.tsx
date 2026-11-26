
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => setSession(nextSession)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const submitEmail = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert(
        'Έλεγξε τα στοιχεία',
        'Βάλε έγκυρο email και κωδικό τουλάχιστον 6 χαρακτήρων.'
      );
      return;
    }

    setBusy(true);

    const result = mode === 'signup'
      ? await supabase.auth.signUp({
          email: email.trim(),
          password
        })
      : await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

    setBusy(false);

    if (result.error) {
      Alert.alert('Σφάλμα', result.error.message);
    } else if (mode === 'signup' && !result.data.session) {
      Alert.alert(
        'Έλεγξε το email σου',
        'Σου στείλαμε σύνδεσμο επιβεβαίωσης.'
      );
    }
  };

  const googleLogin = async () => {
    setBusy(true);

    const redirectTo = Linking.createURL('/');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true
      }
    });

    if (error || !data.url) {
      setBusy(false);
      Alert.alert(
        'Δεν έγινε σύνδεση',
        error?.message || 'Δοκίμασε ξανά.'
      );
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    if (result.type === 'success' && result.url) {
      const parsed = Linking.parse(result.url);
      const params: any = parsed.queryParams || {};

      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: String(params.access_token),
          refresh_token: String(params.refresh_token)
        });
      }
    }

    setBusy(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logo}>CASHLY</Text>
          <Text style={styles.heading}>Καλώς ήρθες! 🎉</Text>
          <Text style={styles.sub}>
            Συνδέθηκες ως {session.user.email || 'χρήστης Google'}.
          </Text>
          <Text style={styles.note}>
            Ο λογαριασμός σου δημιουργήθηκε. Οι προσφορές και το προφίλ
            θα προστεθούν στο επόμενο στάδιο.
          </Text>
          <Pressable style={styles.secondary} onPress={logout}>
            <Text style={styles.secondaryText}>Αποσύνδεση</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>CASHLY</Text>
        <Text style={styles.heading}>
          {mode === 'signup'
            ? 'Δημιούργησε λογαριασμό'
            : 'Καλώς επέστρεψες'}
        </Text>
        <Text style={styles.sub}>
          Οι ευκαιρίες σου στην Κύπρο ξεκινούν εδώ.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Κωδικός (τουλάχιστον 6 χαρακτήρες)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={styles.primary}
          onPress={submitEmail}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryText}>
                {mode === 'signup'
                  ? 'Εγγραφή με email'
                  : 'Σύνδεση με email'}
              </Text>}
        </Pressable>

        <Text style={styles.or}>ή</Text>

        <Pressable
          style={styles.google}
          onPress={googleLogin}
          disabled={busy}
        >
          <Text style={styles.googleText}>Συνέχεια με Google</Text>
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          <Text style={styles.switch}>
            {mode === 'signup'
              ? 'Έχεις ήδη λογαριασμό; Σύνδεση'
              : 'Δεν έχεις λογαριασμό; Εγγραφή'}
          </Text>
        </Pressable>

        <Text style={styles.foot}>
          Με τη δημιουργία λογαριασμού αποδέχεσαι τους Όρους Χρήσης
          και την Πολιτική Απορρήτου (θα προστεθούν πριν τη δημόσια κυκλοφορία).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F6',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 14,
    shadowColor: '#0B1B33',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  logo: {
    color: '#10213B',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 2
  },
  heading: {
    color: '#10213B',
    fontSize: 23,
    fontWeight: '800'
  },
  sub: {
    color: '#657386',
    fontSize: 14,
    lineHeight: 21
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCE4E8',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: '#10213B'
  },
  primary: {
    backgroundColor: '#14A879',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15
  },
  or: {
    textAlign: 'center',
    color: '#8A96A5'
  },
  google: {
    borderWidth: 1,
    borderColor: '#DCE4E8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center'
  },
  googleText: {
    color: '#10213B',
    fontWeight: '700'
  },
  switch: {
    color: '#087B5A',
    fontWeight: '700',
    textAlign: 'center',
    padding: 8
  },
  foot: {
    color: '#8A96A5',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4
  },
  note: {
    color: '#657386',
    lineHeight: 22
  },
  secondary: {
    backgroundColor: '#EAF5F1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center'
  },
  secondaryText: {
    color: '#087B5A',
    fontWeight: '800'
  }
});
