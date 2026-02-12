import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors, radii, spacing, shadows } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Block = ({ style }) => <View style={[styles.block, style]} />;

const HomeSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Block style={styles.icon} />
        <Block style={styles.icon} />
      </View>

      {/* Greeting and subtitle */}
      <Block style={styles.greeting} />
      <Block style={styles.subheading} />

      {/* Search */}
      <Block style={styles.search} />

      {/* Quick chips */}
      <View style={styles.chipsRow}>
        {[...Array(3)].map((_, i) => (
          <Block key={i} style={styles.chip} />
        ))}
      </View>

      {/* Section heading */}
      <Block style={styles.sectionHeading} />

      {/* Categories */}
      <View style={styles.categoriesRow}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={styles.categoryItem}>
            <Block style={styles.circle} />
            <Block style={styles.categoryLabel} />
          </View>
        ))}
      </View>

      {/* Restaurant cards */}
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.card}>
          <Block style={styles.cardImage} />
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Block style={styles.title} />
              <Block style={styles.rating} />
            </View>
            <Block style={styles.subtitle} />
            <Block style={styles.pill} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },

  block: {
    backgroundColor: colors.border,
    borderRadius: radii.sm,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  greeting: {
    height: 28,
    width: '52%',
    marginBottom: spacing.sm,
  },

  subheading: {
    height: 16,
    width: '65%',
    marginBottom: spacing.md,
  },

  search: {
    height: 52,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },

  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  chip: {
    height: 32,
    width: width * 0.23,
    borderRadius: 999,
  },

  sectionHeading: {
    height: 20,
    width: '45%',
    marginBottom: spacing.md,
  },

  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  categoryItem: {
    alignItems: 'center',
    width: 62,
  },

  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: spacing.xs,
  },

  categoryLabel: {
    width: 48,
    height: 10,
    borderRadius: 6,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.soft,
  },

  cardImage: {
    width: '100%',
    height: 190,
  },

  cardBody: {
    padding: spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },

  title: {
    height: 18,
    width: '62%',
  },

  rating: {
    width: 54,
    height: 22,
    borderRadius: 999,
  },

  subtitle: {
    height: 14,
    width: '44%',
    marginBottom: spacing.sm,
  },

  pill: {
    height: 20,
    width: '34%',
    borderRadius: 999,
  },
});
