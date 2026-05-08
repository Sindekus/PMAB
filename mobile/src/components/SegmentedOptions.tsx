import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Option<T> = {
  value: T;
  label: string;
};

type Props<T> = {
  options: Option<T>[];
  selectedValue: T | null;
  onSelect: (value: T) => void;
};

export function SegmentedOptions<T extends string | number>({
  options,
  selectedValue,
  onSelect,
}: Props<T>) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const selected = option.value === selectedValue;

        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  labelSelected: {
    color: colors.surface,
  },
});
