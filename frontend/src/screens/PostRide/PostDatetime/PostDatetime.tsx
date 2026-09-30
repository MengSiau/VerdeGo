import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

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
            {WEEK_DAYS.map((day, index) => {
              const selected = index === selectedDayIndex;
              return (
                <Pressable key={day.day} onPress={() => selectDay(index)} style={styles.dayColumn}>
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
            <Text style={styles.timeBoxValue}>{hour}</Text>
          </Pressable>
          <Text style={styles.timeSeparator}>:</Text>
          <Pressable
            onPress={cycleMinute}
            style={[styles.timeBox, focusedField === 'minute' && styles.timeBoxFocused]}>
            <Text style={styles.timeBoxLabel}>Minute</Text>
            <Text style={styles.timeBoxValue}>{minute}</Text>
          </Pressable>
          <Pressable
            onPress={cyclePeriod}
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
            style={[styles.seatsButton, seats <= MIN_SEATS && styles.seatsButtonDisabled]}>
            <Text style={styles.seatsButtonLabel}>−</Text>
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
        <Text style={styles.seatsCaption}>{seats} passenger{seats === 1 ? '' : 's'}</Text>
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
            <DateTimePicker value={tempDate} mode="date" display="default" onChange={handleAndroidDateChange} />
          )}
          {timePickerVisible && (
            <DateTimePicker value={tempDate} mode="time" display="default" onChange={handleAndroidTimeChange} />
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
