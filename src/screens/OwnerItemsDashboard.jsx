import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import ImagePickerComponent from '../utils/ImagePicker';
import { colors, radii, spacing, typography, shadows } from '../theme';

const OwnerItemsEmptyState = () => (
  <View style={styles.emptyWrap}>
    <Icon name="package" size={56} color={colors.muted} />
    <Text style={styles.emptyTitle}>No items yet</Text>
    <Text style={styles.emptyText}>Add items from the owner menu to get started.</Text>
  </View>
);

const OwnerItemsDashboard = ({ navigation }) => {
  const { user, foodItems, fetchCategories } = useContext(UserContext);
  const restaurantId = user?.restaurant;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation?.navigate?.('Home');
  };

  const fetchItems = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await api.get(`/items/restaurant/${restaurantId}`);
      setItems(res.data.items || []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load items',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openEdit = item => {
    setEditingItem({
      ...item,
      price: String(item.price ?? ''),
      discountPercent: String(item.discountPercent ?? ''),
    });
  };

  const closeEdit = () => setEditingItem(null);

  const updateField = (key, value) => {
    setEditingItem(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = async () => {
    if (!editingItem) return;

    const priceNum = parseFloat(
      String(editingItem.price).replace(/[^0-9.]/g, ''),
    );
    const discountNum = parseFloat(
      String(editingItem.discountPercent).replace(/[^0-9.]/g, ''),
    );

    if (!editingItem.name?.trim()) {
      Toast.show({ type: 'error', text1: 'Name is required' });
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      Toast.show({ type: 'error', text1: 'Price must be valid' });
      return;
    }
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      Toast.show({ type: 'error', text1: 'Discount must be 0-100' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: editingItem.name.trim(),
        category: editingItem.category,
        price: priceNum,
        discountPercent: discountNum,
        image: editingItem.image,
        isVeg: editingItem.isVeg,
      };

      const res = await api.patch(
        `/items/${restaurantId}/${editingItem._id}`,
        payload,
      );

      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Item updated' });
        closeEdit();
        fetchItems();
      } else {
        Toast.show({
          type: 'error',
          text1: res.data?.message || 'Update failed',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = item => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(item),
        },
      ],
    );
  };

  const deleteItem = async item => {
    try {
      const res = await api.delete(`/items/${restaurantId}/${item._id}`);
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Item deleted' });
        fetchItems();
      } else {
        Toast.show({
          type: 'error',
          text1: res.data?.message || 'Delete failed',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Delete failed',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    }
  };



  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image.url }} style={styles.cardImage} />

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.vegBadge}>
            <Text style={styles.vegText}>
              {item.isVeg ? '\uD83D\uDFE2 Veg' : '\uD83D\uDD34 Non-Veg'}
            </Text>
          </View>
        </View>

        <Text style={styles.categoryText} numberOfLines={1}>
          {item.category}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.oldPrice}>{'\u20B9'}{item.price}</Text>
          <Text style={styles.price}>{'\u20B9'}{item.offerPrice}</Text>
          <Text style={styles.discount}>{item.discountPercent}% OFF</Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.editBtn} onPress={() => openEdit(item)}>
            <Icon name="edit-2" size={16} color={colors.surface} />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>

          <Pressable
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item)}
          >
            <Icon name="trash-2" size={16} color={colors.error} />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => {
      const name = item.name?.toLowerCase() || '';
      const category = item.category?.toLowerCase() || '';
      return name.includes(q) || category.includes(q);
    });
  }, [items, query]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
        >
          <Icon name="arrow-left" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Items</Text>
        <Text style={styles.headerSubtitle}>
          Update or delete items from your menu
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search items or category"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
            <Icon name="x" size={16} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? <OwnerItemsEmptyState /> : null}
        renderItem={renderItem}
      />

      <Modal
        visible={!!editingItem}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <Pressable onPress={closeEdit}>
                <Icon name="x" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={editingItem?.name}
                  onChangeText={value => updateField('name', value)}
                  style={styles.input}
                  placeholder="Item name"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerWrap}>
                  <Picker
                    selectedValue={editingItem?.category}
                    onValueChange={value => updateField('category', value)}
                  >
                    <Picker.Item label="Select category" value="" />
                    {foodItems.map(item => (
                      <Picker.Item
                        key={item._id}
                        label={item.category}
                        value={item.category}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    value={editingItem?.price}
                    onChangeText={value => updateField('price', value)}
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Discount %</Text>
                  <TextInput
                    value={editingItem?.discountPercent}
                    onChangeText={value => updateField('discountPercent', value)}
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Veg / Non‑Veg</Text>
                <View style={styles.toggleRow}>
                  <Pressable
                    style={[
                      styles.toggleBtn,
                      editingItem?.isVeg && styles.toggleActive,
                    ]}
                    onPress={() => updateField('isVeg', true)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        editingItem?.isVeg && styles.toggleTextActive,
                      ]}
                    >
                      Veg
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.toggleBtn,
                      editingItem?.isVeg === false && styles.toggleActive,
                    ]}
                    onPress={() => updateField('isVeg', false)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        editingItem?.isVeg === false && styles.toggleTextActive,
                      ]}
                    >
                      Non‑Veg
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Image</Text>
                <ImagePickerComponent
                  onImageUploaded={image => updateField('image', image)}
                  onImageRemoved={() => updateField('image', null)}
                  initialImageUrl={editingItem?.image?.url}
                />
              </View>
            </ScrollView>

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && { opacity: 0.85 },
                saving && { opacity: 0.6 },
              ]}
              onPress={saveChanges}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OwnerItemsDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  headerTitle: {
    ...typography.h1,
    color: colors.text,
  },

  headerSubtitle: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.surface,
  },

  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
  },

  clearBtn: {
    padding: 4,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },

  cardImage: {
    width: '100%',
    height: 160,
  },

  cardBody: {
    padding: spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  cardTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },

  vegBadge: {
    backgroundColor: colors.tintAlt,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 999,
  },

  vegText: {
    ...typography.caption,
    color: colors.text,
  },

  categoryText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  oldPrice: {
    ...typography.caption,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },

  price: {
    ...typography.body,
    color: colors.accent,
  },

  discount: {
    ...typography.caption,
    color: colors.primaryDark,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.info,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  actionText: {
    color: colors.surface,
    fontWeight: '700',
  },

  deleteText: {
    color: colors.error,
    fontWeight: '700',
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },

  emptyText: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },

  field: {
    marginBottom: spacing.md,
  },

  label: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
  },

  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  fieldHalf: {
    flex: 1,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  toggleBtn: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },

  toggleActive: {
    backgroundColor: colors.tintAlt,
    borderColor: colors.primary,
  },

  toggleText: {
    ...typography.sub,
    color: colors.muted,
  },

  toggleTextActive: {
    color: colors.primaryDark,
  },

  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  saveText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
