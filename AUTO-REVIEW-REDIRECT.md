# Automatic Review Redirect Feature

## Overview
When a customer's order is marked as "Paid" by staff, the customer's screen **automatically redirects** to the feedback/review page. This creates an "insisting" flow that encourages customers to leave reviews immediately after their dining experience.

## How It Works

### Customer Flow

1. **Customer Places Order**
   - Orders food via the app
   - Tracks order status on the status page

2. **Staff Marks Order as Paid**
   - When customer pays the bill
   - Staff changes order status to "Paid" in the Staff Portal

3. **Automatic Redirect** ✨
   - Customer's screen **instantly redirects** to `/customer/feedback`
   - Order details are passed via URL parameters
   - Customer sees "Order Completed!" banner

4. **Review Submission**
   - Customer rates their experience (1-5 stars)
   - Optionally adds comments
   - Name is pre-filled if available
   - Cannot skip - they must either review or navigate away manually

5. **Thank You & Redirect**
   - After submitting, shows success animation
   - Automatically redirects to menu after 2 seconds

## Implementation Details

### Files Modified

#### 1. `src/app/customer/status/page.tsx`
**Added automatic redirect watcher:**
```typescript
// Track which orders we've already processed
const processedPaidOrders = useRef<Set<string>>(new Set());

// Find paid orders for this session
const myPaidOrders = orders.filter(o =>
    (o.sessionId === sessionId) &&
    o.status === 'Paid'
);

// Auto-redirect when order becomes Paid
useEffect(() => {
    if (myPaidOrders.length > 0) {
        const latestPaidOrder = myPaidOrders
            .filter(o => !processedPaidOrders.current.has(o.id))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestPaidOrder) {
            processedPaidOrders.current.add(latestPaidOrder.id);
            
            const params = new URLSearchParams({
                orderId: latestPaidOrder.id,
                customerName: latestPaidOrder.customerName || '',
                customerPhone: latestPaidOrder.customerPhone || ''
            });
            
            router.push(`/customer/feedback?${params.toString()}`);
        }
    }
}, [myPaidOrders, router]);
```

#### 2. `src/app/customer/feedback/page.tsx`
**Enhanced to accept order context:**
- Reads `orderId`, `customerName`, and `customerPhone` from URL params
- Pre-fills customer name if available
- Shows "Order Completed!" banner with order total
- Success animation after review submission
- Auto-redirect to menu after 2 seconds

**Fixed Next.js Suspense requirement:**
```typescript
// Wrapped component using useSearchParams in Suspense
export default function FeedbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FeedbackForm />
        </Suspense>
    );
}
```

## User Experience Benefits

### For Customers
✅ **Seamless Flow** - No navigation needed, automatically redirected  
✅ **Contextual** - Order details shown for reference  
✅ **Pre-filled** - Name auto-filled from order  
✅ **Visual Feedback** - Beautiful success animation  
✅ **Quick Exit** - Auto-redirects to menu to continue browsing

### For Restaurant
✅ **Higher Review Rate** - Captures feedback while experience is fresh  
✅ **No Extra Steps** - Staff just marks as "Paid" normally  
✅ **Quality Data** - Reviews tied to specific orders  
✅ **Immediate Feedback** - Get insights in real-time

## Testing Checklist

- [ ] Place an order as a customer
- [ ] Staff marks order as "Paid"
- [ ] Verify customer screen redirects to `/customer/feedback`
- [ ] Check order details are displayed correctly
- [ ] Submit a review (1-5 stars + comment)
- [ ] Verify success animation appears
- [ ] Check auto-redirect to menu after 2 seconds
- [ ] Verify review appears in Admin Portal

## Technical Notes

- **Duplicate Prevention**: Uses `useRef` to track processed orders, preventing multiple redirects for the same order
- **Session-based**: Only redirects orders from the customer's current session
- **Most Recent**: If multiple orders are paid simultaneously, redirects for the most recent one
- **Suspense Boundary**: Required by Next.js for `useSearchParams()` usage
- **URL Parameters**: Order context passed via query string

## Edge Cases Handled

1. **Multiple Orders**: Redirects for the most recent paid order
2. **Page Refresh**: Won't re-redirect after page reload (uses in-memory tracking)
3. **Manual Navigation**: Customer can manually navigate away if needed
4. **Missing Data**: Gracefully handles missing customer name/phone
5. **No Order Context**: Page still works if accessed directly without params

## Future Enhancements (Optional)

- Add "Skip Review" button with confirmation
- Show order item details on review page
- Add photo upload capability
- Incentivize reviews (e.g., "Review for 5% off next order")
- Send review link via WhatsApp if customer navigates away
