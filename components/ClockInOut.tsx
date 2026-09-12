import { Button } from '@/components/Button';
import { useAuth } from '@/lib/context/AuthContext';
import {
  clockIn,
  clockOut,
  getActiveShiftForNow,
  hasOpenTimeEntry,
} from '@/lib/services/timeEntryService';
import { colors, space } from '@/lib/theme';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function ClockInOut() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [shift, setShift] = useState<any>(null);
  const [openEntry, setOpenEntry] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ distance: number; flagged: boolean } | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id || !profile?.company_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const activeShift = await getActiveShiftForNow(profile.id, profile.company_id);
      setShift(activeShift);

      if (activeShift) {
        const entry = await hasOpenTimeEntry(profile.id, activeShift.id);
        setOpenEntry(entry);
      } else {
        setOpenEntry(null);
      }
    } catch (e) {
      setError('Impossible de vérifier ton shift');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.company_id]);

  useEffect(() => {
    load();
  }, [load]);

  async function getPosition() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Autorisation de localisation refusée');
    }
    const position = await Location.getCurrentPositionAsync({});
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  }

  async function handleClockIn() {
    if (!shift || !profile?.company_id || !profile?.id) return;

    setBusy(true);
    setError(null);
    try {
      const { lat, lng } = await getPosition();

      // Récupère les coordonnées du commerce
      const companyLat = profile.company?.latitude;
      const companyLng = profile.company?.longitude;

      if (companyLat == null || companyLng == null) {
        throw new Error('Le commerce n’a pas encore d’adresse configurée');
      }

      const result = await clockIn({
        companyId: profile.company_id,
        employeeId: profile.id,
        shiftId: shift.id,
        lat,
        lng,
        companyLat,
        companyLng,
      });

      setLastResult({ distance: result.distance, flagged: result.flagged });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du pointage');
    } finally {
      setBusy(false);
    }
  }

  async function handleClockOut() {
    if (!openEntry || !profile?.company_id) return;

    setBusy(true);
    setError(null);
    try {
      const { lat, lng } = await getPosition();

      const companyLat = profile.company?.latitude;
      const companyLng = profile.company?.longitude;

      if (companyLat == null || companyLng == null) {
        throw new Error('Le commerce n’a pas encore d’adresse configurée');
      }

      const result = await clockOut({
        entryId: openEntry.id,
        lat,
        lng,
        companyLat,
        companyLng,
      });

      setLastResult({ distance: result.distance, flagged: result.flagged });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du pointage');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: space.md }} />;
  }

  if (!shift) {
    return null; // Pas de shift proche → aucun bouton affiché
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {lastResult ? (
        <Text style={lastResult.flagged ? styles.warning : styles.success}>
          {lastResult.flagged
            ? `⚠️ Pointage à ${Math.round(lastResult.distance)}m du commerce`
            : `✅ Pointage validé (${Math.round(lastResult.distance)}m)`}
        </Text>
      ) : null}

      <Button
        label={busy ? 'Un instant…' : openEntry ? 'Terminer le shift' : 'Commencer le shift'}
        onPress={openEntry ? handleClockOut : handleClockIn}
        disabled={busy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.sm, marginVertical: space.md },
  error: { color: colors.danger, fontWeight: '600' },
  warning: { color: '#d97706', fontWeight: '600' },
  success: { color: '#16a34a', fontWeight: '600' },
});