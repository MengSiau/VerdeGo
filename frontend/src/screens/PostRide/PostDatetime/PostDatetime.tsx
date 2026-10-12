import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';
import { defaultDeparture, formatRideDate, isSameDay } from '@/src/utils/datetime';

import { usePostRideDraft } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

const DAYS_SHOWN = 7;
const MINUTE_STEPS = [0, 15, 30, 45];
const MAX_SEATS = 4;
const MIN_SEATS = 1;

type TimeField = 'hour' | 'minute' | 'period';

/** The next seven days starting today, so the strip is never in the past. */
function buildWeek(from: Date): Date[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: DAYS_SHOWN }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function PostDatetime() {
  const router = useRouter();
  const { draft, updateDraft } = usePostRideDraft();

  const [focusedField, setFocusedField] = useState<TimeField | null>('minute');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(() => defaultDeparture());

  // The week is built once per mount rather than per render, so it can't shift
  // underneath the user if they happen to be mid-flow at midnight.
  const week = useMemo(() => buildWeek(new Date()), []);

  // Seed the draft the first time this screen opens. Guarded on the field
  // itself, so it writes once and never loops.
  useEffect(() => {
    if (!draft.departureIso) {
      updateDraft({ departureIso: defaultDeparture().toISOString() });
    }
  }, [draft.departureIso, updateDraft]);

  const departure = useMemo(
    () => (draft.departureIso ? new Date(draft.departureIso) : defaultDeparture()),
    [draft.departureIso],
  );

  const seats = draft.seats ?? 2;

  const setDeparture = (next: Date) => updateDraft({ departureIso: next.toISOString() });

  const selectDay = (day: Date) => {
    const next = new Date(day);
    next.setHours(departure.getHours(), departure.getMinutes(), 0, 0);
    setDeparture(next);
  };

  // Cycles 1-12 while leaving AM/PM alone, matching the old string-cycling
  // behaviour the screen was designed around.
  const cycleHour = () => {
    setFocusedField('hour');
    const isPm = departure.getHours() >= 12;
    const next12 = (departure.getHours() % 12) + 1;
    const next = new Date(departure);
    next.setHours((next12 % 12) + (isPm ? 12 : 0));
    setDeparture(next);
  };

  const cycleMinute = () => {
    setFocusedField('minute');
    const currentIndex = MINUTE_STEPS.indexOf(departure.getMinutes());
    const nextMinute = MINUTE_STEPS[(currentIndex + 1) % MINUTE_STEPS.length];
    const next = new Date(departure);
    next.setMinutes(nextMinute);
    setDeparture(next);
  };

  const cyclePeriod = () => {
    setFocusedField('period');
    const next = new Date(departure);
    next.setHours((departure.getHours() + 12) % 24);
    setDeparture(next);
  };

  const adjustSeats = (delta: number) => {
    updateDraft({ seats: Math.min(MAX_SEATS, Math.max(MIN_SEATS, seats + delta)) });
  };

  const openDatePicker = () => {
    setTempDate(departure);
    setDatePickerVisible(true);
  };
  const openTimePicker = () => {
    setTempDate(departure);
    setTimePickerVisible(true);
  };

  const applyPickedDate = (date: Date) => {
    const next = new Date(date);
    next.setHours(departure.getHours(), departure.getMinutes(), 0, 0);
    setDeparture(next);
  };

  const applyPickedTime = (date: Date) => {
    const next = new Date(departure);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    setDeparture(next);
    setFocusedField(null);
  };

  // iOS: spinner keeps firing as the user scrolls - just track it, commit on "Done".
  const handleSpinnerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) setTempDate(date);
  };
  // Android: the OS dialog handles its own show/hide and fires once with the final value.
  const handleAndroidDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setDatePickerVisible(false);
    if (event.type === 'set' && date) applyPickedDate(date);
  };
  const handleAndroidTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setTimePickerVisible(false);
    if (event.type === 'set' && date) applyPickedTime(date);
  };

  const hourText = String(departure.getHours() % 12 === 0 ? 12 : departure.getHours() % 12).padStart(2, '0');
  const minuteText = String(departure.getMinutes()).padStart(2, '0');
  const periodText = departure.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <View style={styles.fill}>
      <PostRideHeader title="Date & Seats" step={2} />

      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Departure Date</Text>
          <Pressable style={styles.pickerLink} onPress={openDatePicker}>
            <Ionicons name="calendar-outline" size={14} color={colors.brand.verde700} />
            <Text style={styles.pickerLinkText}>Pick exact date</Text>
          </Pressable>
        </View>
        <View style={styles.dateCard}>
          <View style={styles.weekRow}>
            {week.map((day) => {
              const selected = isSameDay(day, departure);
              return (
                <Pressable
                  key={day.toISOString()}
                  onPress={() => selectDay(day)}
                  style={styles.dayColumn}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={formatRideDate(day)}>
                  <Text style={styles.dayLabel}>
                    {day.toLocaleDateString('en-AU', { weekday: 'short' })}
                  </Text>
                  <View style={[styles.dayNumberWrap, selected && styles.dayNumberWrapSelected]}>
                    <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                      {day.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.fullDate}>{formatRideDate(departure)}</Text>
        </View>

        <View style={[styles.labelRow, styles.sectionGap]}>
          <Text style={styles.label}>Departure Time</Text>
          <Pressable style={styles.pickerLink} onPress={openTimePicker}>
            <Ionicons name="time-outline" size={14} color={colors.brand.verde700} />
            <Text style={styles.pickerLinkText}>Pick exact time</Text>
          </Pressable>
        </View>
        <View style={styles.timeRow}>
          <Pressable
            onPress={cycleHour}
            style={[styles.timeBox, focusedField === 'hour' && styles.timeBoxFocused]}>
            <Text style={styles.timeBoxLabel}>Hour</Text>
            <Text style={styles.timeBoxValue}>{hourText}</Text>
          </Pressable>
          <Text style={styles.timeSeparator}>:</Text>
          <Pressable
            onPress={cycleMinute}
            style={[styles.timeBox, focusedField === 'minute' && styles.timeBoxFocused]}>
            <Text style={styles.timeBoxLabel}>Minute</Text>
            <Text style={styles.timeBoxValue}>{minuteText}</Text>
          </Pressable>
          <Pressable
            onPress={cyclePeriod}
            style={[styles.timeBox, focusedField === 'period' && styles.timeBoxFocused]}>
            <Text style={styles.timeBoxLabel}>Period</Text>
            <Text style={styles.timeBoxValue}>{periodText}</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, styles.sectionGap]}>Available Seats</Text>
        <View style={styles.seatsCard}>
          <Pressable
            onPress={() => adjustSeats(-1)}
            disabled={seats <= MIN_SEATS}
            style={[styles.seatsButton, seats <= MIN_SEATS && styles.seatsButtonDisabled]}>
            <Text style={styles.seatsButtonLabel}>-</Text>
          </Pressable>
          <View style={styles.seatIcons}>
            {Array.from({ length: MAX_SEATS }).map((_, index) => (
              <View key={index} style={[styles.seatIcon, index < seats && styles.seatIconFilled]}>
                <Ionicons
                  name="person"
                  size={16}
                  color={index < seats ? colors.neutral.white : colors.neutral.gray400}
                />
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => adjustSeats(1)}
            disabled={seats >= MAX_SEATS}
            style={[styles.seatsButton, seats >= MAX_SEATS && styles.seatsButtonDisabled]}>
            <Text style={styles.seatsButtonLabel}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.seatsCaption}>
          {seats} passenger{seats === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Next: Vehicle Info" onPress={() => router.push('/post-vehicle')} />
      </View>

      {Platform.OS === 'ios' ? (
        <>
          <PickerSheet
            visible={datePickerVisible}
            onCancel={() => setDatePickerVisible(false)}
            onDone={() => {
              applyPickedDate(tempDate);
              setDatePickerVisible(false);
            }}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              themeVariant="light"
              // A ride can't depart in the past.
              minimumDate={new Date()}
              style={styles.spinner}
              onChange={handleSpinnerChange}
            />
          </PickerSheet>
          <PickerSheet
            visible={timePickerVisible}
            onCancel={() => setTimePickerVisible(false)}
            onDone={() => {
              applyPickedTime(tempDate);
              setTimePickerVisible(false);
            }}>
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="spinner"
              themeVariant="light"
              style={styles.spinner}
              onChange={handleSpinnerChange}
            />
          </PickerSheet>
        </>
      ) : (
        <>
          {datePickerVisible && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleAndroidDateChange}
            />
          )}
          {timePickerVisible && (
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="default"
              onChange={handleAndroidTimeChange}
            />
          )}
        </>
      )}
    </View>
  );
}

// iOS-only bottom sheet wrapping the native spinner, since iOS's picker doesn't auto-dismiss.
function PickerSheet({
  visible,
  onCancel,
  onDone,
  children,
}: {
  visible: boolean;
  onCancel: () => void;
  onDone: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          {children}
          <View style={styles.sheetActions}>
            <PrimaryButton label="Done" onPress={onDone} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  pickerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde50,
  },
  pickerLinkText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize['2xs'],
    color: colors.brand.verde700,
  },
  sectionGap: {
    marginTop: 24,
  },
  dateCard: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.brand.verde500,
    borderRadius: radius['2xl'],
    padding: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray400,
  },
  dayNumberWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrapSelected: {
    backgroundColor: colors.brand.verde600,
  },
  dayNumber: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray800,
  },
  dayNumberSelected: {
    color: colors.neutral.white,
  },
  fullDate: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.base,
    color: colors.brand.verde700,
  },
  timeRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    borderRadius: radius.xl,
  },
  timeBoxFocused: {
    borderColor: colors.brand.verde500,
  },
  timeBoxLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray400,
  },
  timeBoxValue: {
    marginTop: 4,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray900,
  },
  timeSeparator: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray300,
  },
  seatsCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral.gray50,
  },
  seatsButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatsButtonDisabled: {
    opacity: 0.4,
  },
  seatsButtonLabel: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.neutral.gray700,
  },
  seatIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  seatIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatIconFilled: {
    backgroundColor: colors.brand.verde500,
  },
  seatsCaption: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.brand.verde700,
  },
  actions: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    paddingBottom: 24,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    backgroundColor: colors.neutral.white,
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray300,
    marginBottom: 12,
  },
  spinner: {
    height: 200,
    width: '100%',
  },
  sheetActions: {
    marginTop: 12,
  },
});