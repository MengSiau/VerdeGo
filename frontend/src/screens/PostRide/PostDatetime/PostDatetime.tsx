import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { fontFamily, radius, screenPaddingX } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

import { usePostRideDraft } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

const MONTH_LABEL = 'Aug';
const WEEK_DAYS = [
  { dow: 'Mon', day: 11 },
  { dow: 'Tue', day: 12 },
  { dow: 'Wed', day: 13 },
  { dow: 'Thu', day: 14 },
  { dow: 'Fri', day: 15 },
  { dow: 'Sat', day: 16 },
  { dow: 'Sun', day: 17 },
];
const DEFAULT_DAY_INDEX = 2; // Wed 13, matching the rest of the app's demo date

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const MAX_SEATS = 4;
const MIN_SEATS = 1;

function formatDate(dow: string, day: number) {
  return `${dow}, ${MONTH_LABEL} ${day}`;
}

function cycle(options: string[], current: string) {
  const index = options.indexOf(current);
  return options[(index + 1) % options.length];
}

// Demo data is fixed to Aug 2025 throughout the app - build a real Date for the native picker
// from our string fields, all anchored to that same fixed month/year.
function buildDate(day: number, hour: string, minute: string, period: 'AM' | 'PM') {
  const date = new Date(2025, 7, day);
  let hours = parseInt(hour, 10) % 12;
  if (period === 'PM') hours += 12;
  date.setHours(hours, parseInt(minute, 10), 0, 0);
  return date;
}

function to12Hour(date: Date) {
  const period: 'AM' | 'PM' = date.getHours() >= 12 ? 'PM' : 'AM';
  let hours = date.getHours() % 12;
  if (hours === 0) hours = 12;
  return {
    hour: String(hours).padStart(2, '0'),
    minute: String(date.getMinutes()).padStart(2, '0'),
    period,
  };
}

type TimeField = 'hour' | 'minute' | 'period';

export function PostDatetime() {
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { draft, updateDraft } = usePostRideDraft();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(DEFAULT_DAY_INDEX);
  const [focusedField, setFocusedField] = useState<TimeField | null>('minute');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(() => new Date(2025, 7, 13, 8, 15));

  const hour = draft.hour ?? '08';
  const minute = draft.minute ?? '15';
  const period = draft.period ?? 'AM';
  const seats = draft.seats ?? 2;
  const currentDay = selectedDayIndex !== null ? WEEK_DAYS[selectedDayIndex].day : 13;

  const selectDay = (index: number) => {
    setSelectedDayIndex(index);
    const day = WEEK_DAYS[index];
    updateDraft({ date: formatDate(day.dow, day.day) });
  };

  const cycleHour = () => {
    setFocusedField('hour');
    updateDraft({ hour: cycle(HOURS, hour) });
  };
  const cycleMinute = () => {
    setFocusedField('minute');
    updateDraft({ minute: cycle(MINUTES, minute) });
  };
  const cyclePeriod = () => {
    setFocusedField('period');
    updateDraft({ period: period === 'AM' ? 'PM' : 'AM' });
  };

  const adjustSeats = (delta: number) => {
    const next = Math.min(MAX_SEATS, Math.max(MIN_SEATS, seats + delta));
    updateDraft({ seats: next });
  };

  const openDatePicker = () => {
    setTempDate(buildDate(currentDay, hour, minute, period));
    setDatePickerVisible(true);
  };
  const openTimePicker = () => {
    setTempDate(buildDate(currentDay, hour, minute, period));
    setTimePickerVisible(true);
  };

  const applyPickedDate = (date: Date) => {
    const formatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    updateDraft({ date: formatted });
    const matchIndex = WEEK_DAYS.findIndex((d) => d.day === date.getDate());
    setSelectedDayIndex(matchIndex >= 0 ? matchIndex : null);
  };
  const applyPickedTime = (date: Date) => {
    updateDraft(to12Hour(date));
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

  const selectedDay = WEEK_DAYS[selectedDayIndex ?? DEFAULT_DAY_INDEX];
  const fullDateText =
    selectedDayIndex !== null ? formatDate(selectedDay.dow, selectedDay.day) : (draft.date ?? '');

  return (
    <View style={styles.fill}>
      <PostRideHeader title="Date & Seats" step={2} />

      {/* ScrollView so the content can't be pushed under the button at Large text */}
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Departure Date</Text>
          <Pressable
            style={styles.pickerLink}
            onPress={openDatePicker}
            accessibilityRole="button"
            accessibilityLabel="Pick exact date">
            <Ionicons name="calendar-outline" size={14} color={theme.colors.brand} />
            <Text style={styles.pickerLinkText}>Pick exact date</Text>
          </Pressable>
        </View>
        <View style={styles.dateCard}>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, index) => {
              const selected = index === selectedDayIndex;
              return (
                <Pressable
                  key={day.day}
                  onPress={() => selectDay(index)}
                  style={styles.dayColumn}
                  accessibilityRole="button"
                  accessibilityLabel={`${day.dow} ${day.day}`}
                  accessibilityState={{ selected }}>
                  <Text style={styles.dayLabel}>{day.dow}</Text>
                  <View style={[styles.dayNumberWrap, selected && styles.dayNumberWrapSelected]}>
                    <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>{day.day}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.fullDate}>{fullDateText}</Text>
        </View>

        <View style={[styles.labelRow, styles.sectionGap]}>
          <Text style={styles.label}>Departure Time</Text>
          <Pressable
            style={styles.pickerLink}
            onPress={openTimePicker}
            accessibilityRole="button"
            accessibilityLabel="Pick exact time">
            <Ionicons name="time-outline" size={14} color={theme.colors.brand} />
            <Text style={styles.pickerLinkText}>Pick exact time</Text>
          </Pressable>
        </View>
        <View style={styles.timeRow}>
          <Pressable
            onPress={cycleHour}
            accessibilityRole="button"
            accessibilityLabel={`Hour ${hour}. Tap to change`}
            style={[styles.timeBox, focusedField === 'hour' && styles.timeBoxFocused]}>
            <Text style={styles.timeBoxLabel}>Hour</Text>
            <Text style={styles.timeBoxValue}>{hour}</Text>
          </Pressable>
          <Text style={styles.timeSeparator}>:</Text>
          <Pressable
            onPress={cycleMinute}
            accessibilityRole="button"
            accessibilityLabel={`Minute ${minute}. Tap to change`}
            style={[styles.timeBox, focusedField === 'minute' && styles.timeBoxFocused]}>
            <Text style={styles.timeBoxLabel}>Minute</Text>
            <Text style={styles.timeBoxValue}>{minute}</Text>
          </Pressable>
          <Pressable
            onPress={cyclePeriod}
            accessibilityRole="button"
            accessibilityLabel={`${period}. Tap to change`}
            style={[styles.timeBox, focusedField === 'period' && styles.timeBoxFocused]}>
            <Text style={styles.timeBoxLabel}>Period</Text>
            <Text style={styles.timeBoxValue}>{period}</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, styles.sectionGap]}>Available Seats</Text>
        <View style={styles.seatsCard}>
          <Pressable
            onPress={() => adjustSeats(-1)}
            disabled={seats <= MIN_SEATS}
            accessibilityRole="button"
            accessibilityLabel="Fewer seats"
            style={[styles.seatsButton, seats <= MIN_SEATS && styles.seatsButtonDisabled]}>
            <Text style={styles.seatsButtonLabel}>−</Text>
          </Pressable>
          <View style={styles.seatIcons}>
            {Array.from({ length: MAX_SEATS }).map((_, index) => (
              <View key={index} style={[styles.seatIcon, index < seats && styles.seatIconFilled]}>
                <Ionicons
                  name={index < seats ? 'person' : 'person-outline'}
                  size={16}
                  color={index < seats ? theme.colors.onBrand : theme.colors.muted}
                />
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => adjustSeats(1)}
            disabled={seats >= MAX_SEATS}
            accessibilityRole="button"
            accessibilityLabel="More seats"
            style={[styles.seatsButton, seats >= MAX_SEATS && styles.seatsButtonDisabled]}>
            <Text style={styles.seatsButtonLabel}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.seatsCaption}>{seats} passenger{seats === 1 ? '' : 's'}</Text>
      </ScrollView>

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
              themeVariant={theme.isDark ? 'dark' : 'light'}
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
              themeVariant={theme.isDark ? 'dark' : 'light'}
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
              themeVariant={theme.isDark ? 'dark' : 'light'}
              onChange={handleAndroidDateChange}
            />
          )}
          {timePickerVisible && (
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="default"
              themeVariant={theme.isDark ? 'dark' : 'light'}
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
  const { styles } = useThemedStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
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

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    content: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 20,
      paddingBottom: 16,
    },
    labelRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    label: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    pickerLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minHeight: 44,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.brand,
    },
    pickerLinkText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize['2xs'],
      lineHeight: t.lineHeight(t.fontSize['2xs']),
      color: t.colors.brand,
    },
    sectionGap: {
      marginTop: 24,
    },
    dateCard: {
      marginTop: 12,
      borderWidth: 2,
      borderColor: t.colors.brand,
      backgroundColor: t.colors.surface,
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
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    dayNumberWrap: {
      minWidth: 34,
      minHeight: 34,
      paddingHorizontal: 4,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayNumberWrapSelected: {
      backgroundColor: t.colors.brand,
    },
    dayNumber: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    dayNumberSelected: {
      color: t.colors.onBrand,
    },
    fullDate: {
      marginTop: 12,
      textAlign: 'center',
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.brand,
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
      borderColor: t.colors.border,
      backgroundColor: t.colors.surface,
      borderRadius: radius.xl,
    },
    timeBoxFocused: {
      borderColor: t.colors.brand,
    },
    timeBoxLabel: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    timeBoxValue: {
      marginTop: 4,
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.xl,
      lineHeight: t.lineHeight(t.fontSize.xl),
      color: t.colors.text,
    },
    timeSeparator: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.xl,
      lineHeight: t.lineHeight(t.fontSize.xl),
      color: t.colors.muted,
    },
    seatsCard: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: radius.xl,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.divider,
    },
    seatsButton: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: t.colors.border,
      backgroundColor: t.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seatsButtonDisabled: {
      opacity: 0.4,
    },
    seatsButtonLabel: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.text,
    },
    seatIcons: {
      flexDirection: 'row',
      gap: 8,
    },
    seatIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.lg,
      backgroundColor: t.colors.bg,
      borderWidth: 1.5,
      borderColor: t.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seatIconFilled: {
      backgroundColor: t.colors.brand,
      borderColor: t.colors.brand,
    },
    seatsCaption: {
      marginTop: 12,
      textAlign: 'center',
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.brand,
    },
    actions: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 16,
      paddingBottom: 24,
      backgroundColor: t.colors.bg,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
      borderTopLeftRadius: radius['3xl'],
      borderTopRightRadius: radius['3xl'],
      backgroundColor: t.colors.surface,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: t.colors.divider,
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 12,
      paddingBottom: 24,
    },
    dragHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: t.colors.border,
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