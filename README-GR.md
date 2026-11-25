# CASHLY – Πρώτη τεχνική βάση

Αυτό είναι αρχικό project Expo / React Native για iPhone και Android. Περιλαμβάνει οθόνη εγγραφής/σύνδεσης με email και ροή σύνδεσης Google μέσω Supabase.

## Τι χρειάζεται πριν λειτουργήσει
1. Δημιούργησε δωρεάν project στο Supabase.
2. Από Project Settings → API, πάρε το Project URL και το anon/public key.
3. Αντέγραψε το `.env.example` σε `.env` και συμπλήρωσε τα δύο στοιχεία.
4. Στο Supabase → Authentication → Providers ενεργοποίησε Email και Google.
5. Ρύθμισε τα Google OAuth Client IDs και τα Redirect URLs σύμφωνα με τις οδηγίες Supabase/Expo. Το callback scheme της εφαρμογής είναι `cashly://`.
6. Εγκατάστησε Node.js και τρέξε:
   - `npm install`
   - `npx expo start`

## Σημαντικό
- Η εφαρμογή δεν είναι ακόμη δημοσιευμένη ούτε συνδεδεμένη με πραγματικό Supabase project.
- Η σύνδεση Google χρειάζεται σωστή ρύθμιση OAuth στο Google Cloud και στο Supabase.
- Πριν από δημόσια κυκλοφορία χρειάζονται Πολιτική Απορρήτου, Όροι Χρήσης, ασφαλής διαχείριση δεδομένων, έλεγχος εγγραφής και δοκιμές.
- Μην κοινοποιήσεις ποτέ κωδικούς ή secret keys. Το anon/public key μπαίνει στην εφαρμογή, όχι το service-role key.
- Τα στοιχεία `com.yourcompany.cashly` πρέπει να αλλαχθούν σε μοναδικά bundle/package IDs πριν την έκδοση.
