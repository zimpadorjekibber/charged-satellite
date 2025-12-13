# Remote Order Timer Fix

## Issue
Previously, when a remote order was accepted and preparation started, the 30-minute countdown would start immediately. This was problematic because:
- The customer might take 20-30 minutes to reach the restaurant
- The countdown would be running while they were still traveling
- This could create unfair pressure or confusion

## Solution
Modified the order timing logic so that the 30-minute countdown **only starts when the customer arrives** and is assigned a table by staff.

## Flow for Remote Orders

### 1. Customer Places Remote Order
- Order is created with `tableId = 'REQUEST'`
- Status: `Pending`
- No timer visible yet

### 2. Staff Accepts Order
- Status changes to `Preparing`
- ✅ **NEW**: `acceptedAt` is NOT set (because tableId is still 'REQUEST')
- Customer sees: **"Order Accepted - Your food will be freshly served after reaching"**
- **No countdown timer shown**

### 3. Customer Arrives at Restaurant
- Staff assigns a real table (e.g., "Table 1")
- `tableId` changes from 'REQUEST' to actual table ID
- ✅ **NEW**: `acceptedAt` is set to current time
- **30-minute countdown starts NOW**

### 4. Order Completion
- Order proceeds through normal flow: Preparing → Ready → Served
- Countdown runs from when table was assigned

## Code Changes

### Modified: `src/lib/store.ts`
**Function: `updateOrderStatus`** (lines 408-420)
```typescript
if (status === 'Preparing') {
    const orderStr = get().orders.find(o => o.id === orderId);
    // For remote orders (tableId = 'REQUEST'), do NOT set acceptedAt yet
    // It will be set when customer arrives and table is assigned
    if (orderStr && !orderStr.acceptedAt && orderStr.tableId !== 'REQUEST') {
        updates.acceptedAt = new Date().toISOString();
    }
}
```

**Function: `updateOrderTable`** (lines 420-435)
- Already had logic to set `acceptedAt` when table is assigned
- This now works correctly with the new flow

## Customer Experience

### For In-Restaurant Orders (Normal Orders)
- No change in behavior
- Timer starts when order is accepted and preparation begins

### For Remote Orders
1. **While Traveling**: "Order Accepted" message, no timer
2. **After Arriving**: Staff assigns table, 30-minute countdown begins
3. **Clear Communication**: Customer knows their timer starts when they arrive

## Staff Experience
1. Accept remote order → sets status to "Preparing"
2. When customer arrives → assign them a table
3. System automatically starts the 30-minute countdown

## Benefits
- ✅ Fair to customers traveling from remote locations
- ✅ 30-minute guarantee starts only when customer is at restaurant
- ✅ Clear communication of order status
- ✅ No changes needed to staff workflow
- ✅ Automatic handling by the system
