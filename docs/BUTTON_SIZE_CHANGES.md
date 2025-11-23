# Button Size Changes - Reverting to dashboard-01 Pattern

This document outlines which buttons will change when we revert from universal `size="sm"` to the proper dashboard-01 sizing pattern.

## Summary

**Currently:** All buttons use `size="sm"` (h-8, text-xs)
**After change:** Use contextual sizing based on dashboard-01 pattern

## Dashboard-01 Pattern Rules

| Context | Size | Reasoning |
|---------|------|-----------|
| **DataTable toolbar** | `sm` | Compact space, secondary actions |
| **Icon-only buttons** | `icon` | Square buttons with only icons |
| **Dialog/Modal footers** | **default** | Primary actions need prominence |
| **Form submit/cancel** | **default** | Primary actions need prominence |
| **Navigation/Back buttons** | `sm` | Secondary navigation actions |
| **Card action buttons** | **default** | Primary call-to-actions |

---

## Files and Buttons That Will Change

### 1. ✅ KEEP `size="sm"` (Already Correct)

These buttons should stay as `size="sm"` per dashboard-01 pattern:

#### **src/components/add-booking-modal.tsx**
- **Line 124**: Toolbar trigger button
  ```tsx
  <Button size="sm">  // ✅ KEEP - Toolbar action
    <Plus className="h-4 w-4" />
    Add Booking
  </Button>
  ```

#### **src/components/add-van-modal.tsx**
- **Line 74**: Toolbar trigger button
  ```tsx
  <Button size="sm">  // ✅ KEEP - Toolbar action
    <Plus className="h-4 w-4" />
    Add Van
  </Button>
  ```

#### **DataTable Components**
- All buttons in `src/components/ui/data-table-*.tsx` - ✅ KEEP `size="sm"`
  - Column filters
  - View options
  - Pagination controls

#### **Navigation/Back Buttons**
All "Back to..." buttons should KEEP `size="sm"`:
- `src/app/(authenticated)/bookings/[id]/page.tsx` - Lines 133, 147
- `src/app/(authenticated)/bookings/[id]/edit/page.tsx` - Line 147
- `src/app/(authenticated)/campervans/[id]/page.tsx` - Lines 130, 144
- `src/app/(authenticated)/campervans/[id]/edit/page.tsx` - Line 109

---

### 2. ⚠️ CHANGE to DEFAULT (Currently Wrong)

These buttons should be changed from `size="sm"` to default (no size prop):

#### **A. Homepage Dashboard Cards**
**File:** `src/app/(authenticated)/page.tsx`

**Lines 31-33**: View Bookings button
```tsx
// BEFORE:
<Button variant="outline" size="sm" className="mt-4 w-full">
  View Bookings
</Button>

// AFTER:
<Button variant="outline" className="mt-4 w-full">
  View Bookings
</Button>
```

**Lines 53-55**: View Campervans button
```tsx
// BEFORE:
<Button variant="outline" size="sm" className="mt-4 w-full">
  View Campervans
</Button>

// AFTER:
<Button variant="outline" className="mt-4 w-full">
  View Campervans
</Button>
```

**Lines 75-77**: Coming Soon button
```tsx
// BEFORE:
<Button variant="ghost" size="sm" className="mt-4 w-full" disabled>
  Coming Soon
</Button>

// AFTER:
<Button variant="ghost" className="mt-4 w-full" disabled>
  Coming Soon
</Button>
```

**Impact:** 3 buttons become more prominent (h-9 instead of h-8)
**Reasoning:** These are primary navigation CTAs on the dashboard, not toolbar actions

---

#### **B. Calendar Page - Add/Update Actions**
**File:** `src/app/(authenticated)/calendar/page.tsx`

**Lines 199-202**: Add Blocked Date button
```tsx
// BEFORE:
<Button onClick={addBlockedDate} disabled={saving} size="sm" className="flex-1">
  <Plus className="h-4 w-4" />
  {saving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add Blocked Date')}
</Button>

// AFTER:
<Button onClick={addBlockedDate} disabled={saving} className="flex-1">
  <Plus className="h-4 w-4" />
  {saving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add Blocked Date')}
</Button>
```

**Lines 204-206**: Cancel button
```tsx
// BEFORE:
<Button onClick={cancelEditing} variant="outline" size="sm" disabled={saving}>
  Cancel
</Button>

// AFTER:
<Button onClick={cancelEditing} variant="outline" disabled={saving}>
  Cancel
</Button>
```

**Impact:** 2 buttons become more prominent
**Reasoning:** Primary form action buttons, not toolbar actions

---

#### **C. Booking Detail Page - Action Buttons**
**File:** `src/app/(authenticated)/bookings/[id]/page.tsx`

**Lines 157-163**: Edit Booking button
```tsx
// BEFORE:
<Button
  size="sm"
  onClick={() => router.push(`/bookings/${bookingId}/edit`)}
>
  <Edit className="h-4 w-4" />
  Edit Booking
</Button>

// AFTER:
<Button
  onClick={() => router.push(`/bookings/${bookingId}/edit`)}
>
  <Edit className="h-4 w-4" />
  Edit Booking
</Button>
```

**Lines 168-175**: Delete Booking button
```tsx
// BEFORE:
<Button
  size="sm"
  variant="destructive"
  disabled={isDeleting}
>
  <Trash2 className="h-4 w-4" />
  Delete Booking
</Button>

// AFTER:
<Button
  variant="destructive"
  disabled={isDeleting}
>
  <Trash2 className="h-4 w-4" />
  Delete Booking
</Button>
```

**Impact:** 2 buttons (Edit, Delete) become more prominent
**Reasoning:** Primary actions on a detail page, not toolbar actions
**Note:** Back buttons (lines 133, 147) should KEEP `size="sm"` as secondary navigation

---

#### **D. Booking Edit Page - Save Actions**
**File:** `src/app/(authenticated)/bookings/[id]/edit/page.tsx`

**Lines 335-343**: Cancel button
```tsx
// BEFORE:
<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => router.push('/bookings')}
  disabled={saving}
>
  Cancel
</Button>

// AFTER:
<Button
  type="button"
  variant="outline"
  onClick={() => router.push('/bookings')}
  disabled={saving}
>
  Cancel
</Button>
```

**Lines 344-347**: Save Changes button
```tsx
// BEFORE:
<Button type="submit" size="sm" disabled={saving}>
  <Save className="h-4 w-4" />
  {saving ? 'Saving...' : 'Save Changes'}
</Button>

// AFTER:
<Button type="submit" disabled={saving}>
  <Save className="h-4 w-4" />
  {saving ? 'Saving...' : 'Save Changes'}
</Button>
```

**Impact:** 2 form action buttons become more prominent
**Reasoning:** Primary form submit/cancel actions
**Note:** Back button (line 147) should KEEP `size="sm"`

---

#### **E. Campervan Detail Page - Action Buttons**
**File:** `src/app/(authenticated)/campervans/[id]/page.tsx`

Similar to Booking Detail:
- **Edit Van button** - Change to default
- **Delete Van button** - Change to default
- **Back buttons** - KEEP `size="sm"`

---

#### **F. Campervan Edit Page - Save Actions**
**File:** `src/app/(authenticated)/campervans/[id]/edit/page.tsx`

**Lines 191-199**: Cancel button
- Change from `size="sm"` to default

**Lines 200-203**: Save Changes button
- Change from `size="sm"` to default

**Note:** Back button should KEEP `size="sm"`

---

#### **G. Modal Footer Buttons**

**File:** `src/components/add-booking-modal.tsx`
**Lines 281-286**: Dialog footer buttons

```tsx
// BEFORE:
<DialogFooter>
  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
    Cancel
  </Button>
  <Button type="submit" size="sm" disabled={loading}>
    {loading ? 'Adding...' : 'Add Booking'}
  </Button>
</DialogFooter>

// AFTER:
<DialogFooter>
  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
    Cancel
  </Button>
  <Button type="submit" disabled={loading}>
    {loading ? 'Adding...' : 'Add Booking'}
  </Button>
</DialogFooter>
```

**File:** `src/components/add-van-modal.tsx`
**Lines 130-135**: Dialog footer buttons (same pattern)

**Impact:** Modal action buttons become more prominent
**Reasoning:** Per dashboard-01, dialog/drawer footers use default size

---

## Summary of Changes

### Will Change (Remove `size="sm"`)

| File | Buttons Affected | Context |
|------|------------------|---------|
| `page.tsx` (dashboard) | 3 buttons | Card CTAs |
| `calendar/page.tsx` | 2 buttons | Form actions |
| `bookings/[id]/page.tsx` | 2 buttons | Edit/Delete actions |
| `bookings/[id]/edit/page.tsx` | 2 buttons | Save/Cancel |
| `campervans/[id]/page.tsx` | 2 buttons | Edit/Delete actions |
| `campervans/[id]/edit/page.tsx` | 2 buttons | Save/Cancel |
| `add-booking-modal.tsx` | 2 buttons | Dialog footer |
| `add-van-modal.tsx` | 2 buttons | Dialog footer |
| **TOTAL** | **17 buttons** | Primary actions |

### Will NOT Change (Keep `size="sm"`)

| Component | Context |
|-----------|---------|
| DataTable toolbar buttons | ✅ Correct |
| "Add Booking" trigger | ✅ Correct |
| "Add Van" trigger | ✅ Correct |
| All "Back to..." buttons | ✅ Correct |
| Data table pagination | ✅ Correct |
| Data table filters | ✅ Correct |

---

## Visual Impact

### Before (Current - All `sm`)
- Height: 32px (h-8)
- Font: 12px (text-xs)
- Consistent but too small for primary actions

### After (dashboard-01 Pattern)

**Primary Actions (default):**
- Height: 36px (h-9)
- Font: 14px (text-sm)
- More prominent, better touch targets

**Secondary Actions (sm):**
- Height: 32px (h-8)
- Font: 12px (text-xs)
- Compact for toolbars and navigation

**Visual Hierarchy:**
- ✅ Primary actions stand out
- ✅ Better UX (larger touch targets)
- ✅ Follows dashboard-01 template
- ✅ Matches official shadcn patterns

---

## Accessibility Benefits

### WCAG Touch Target Guidelines
- Minimum: 44×44px (with padding)
- Default buttons: 36px + padding ≈ 44px ✅
- Small buttons: 32px + padding ≈ 40px (acceptable for secondary)

### Result
- Better touch targets for primary actions
- Improved visual hierarchy
- Maintains compact toolbars where needed

---

## Next Steps

If you approve these changes, I will:
1. Remove `size="sm"` from 17 primary action buttons
2. Keep `size="sm"` on toolbar/navigation buttons
3. Test that visual hierarchy is correct
4. Ensure all buttons match dashboard-01 pattern

**Estimated time:** 5-10 minutes
**Risk level:** Low (visual change only, no functionality impact)

---

**Last Updated:** November 23, 2025
**Based on:** dashboard-01 template from shadcn/ui v4 playground
