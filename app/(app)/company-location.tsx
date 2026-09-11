import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { updateCompanyLocation } from '@/lib/services/companyService';
import { searchAddress, type GeocodeResult } from '@/lib/services/geocodingService';
import { colors, space } from '@/lib/theme';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CompanyLocationScreen() {
  const { profile, refreshProfile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const res = await searchAddress(query);
        setResults(res);
      } catch (e) {
        setError('Recherche impossible pour le moment');
      } finally {
        setSearching(false);
      }
    }, 600); // Attend 600ms après la dernière frappe

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleSave() {
    if (!selected || !profile?.company_id) return;
    setSaving(true);
    setError(null);
    try {
      await updateCompanyLocation(profile.company_id, {
        address: selected.displayName,
        latitude: selected.latitude,
        longitude: selected.longitude,
      });
      await refreshProfile();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’enregistrer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Adresse du commerce" subtitle="Utilisée pour valider les pointages des employés.">
      <Field
        label="Rechercher une adresse"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setSelected(null);
        }}
        placeholder="123 rue Example, Montréal"
      />

      {searching ? <ActivityIndicator style={{ marginVertical: space.md }} /> : null}

      {!searching && results.length > 0 && !selected ? (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${item.latitude}-${item.longitude}-${idx}`}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => setSelected(item)}>
              <Text style={styles.resultText}>{item.displayName}</Text>
            </TouchableOpacity>
          )}
        />
      ) : null}

      {selected ? (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedLabel}>Adresse sélectionnée</Text>
          <Text style={styles.selectedText}>{selected.displayName}</Text>
          <Text onPress={() => setSelected(null)} style={styles.changeLink}>
            Changer
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={saving ? 'Enregistrement…' : 'Enregistrer l’adresse'}
        onPress={handleSave}
        disabled={!selected || saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 220, marginBottom: space.md },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: { fontSize: 14, color: colors.text },
  selectedBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  selectedLabel: { fontSize: 12, fontWeight: '600', color: '#16a34a', marginBottom: 4 },
  selectedText: { fontSize: 14, color: colors.text },
  changeLink: { fontSize: 12, color: colors.teal, marginTop: 6, fontWeight: '600' },
  error: { color: colors.danger, fontWeight: '600', marginBottom: space.md },
});