# Admin Panel - Photo Upload Integration Guide

## ⚠️ IMPORTANT: File is too large for automated editing

The admin/page.tsx file is **284KB** with 4197 lines. Auto-editing may cause issues.

---

## 📋 Manual Integration Steps:

### Step 1: Import the PhotoUpload Component

Add this import at the top of `src/app/admin/page.tsx` (around line 5-10):

```typescript
import { PhotoUploadSection } from '../../components/PhotoUpload';
```

### Step 2: Add State Variables

Inside the `AdminDashboard` function (around line 50-70), add these state hooks:

```typescript
const landingPhotos = useStore((state: any) => state.landingPhotos);
const updateLandingPhotos = useStore((state: any) => state.updateLandingPhotos);
```

### Step 3: Find the Settings Tab Content

Search for: `activeTab === 'settings'` (around line 1073)

Scroll down past the "Valley Updates Management" section.

### Step 4: Add Photo Upload Section

**After** the Valley Updates section (look for the closing `</div>` of valley updates),
add this code:

```tsx
{/* Landing Page Photos */}
<div id="landing-photos" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📸 Landing Page Photos</h2>
        <p className="text-gray-500 text-sm">
            Upload photos for the home page - Gateway Map and Hotel Registration Document
        </p>
    </div>

    {/* Gateway Map Upload */}
    <PhotoUploadSection
        title="Gateway Map (Portrait)"
        description="Upload a portrait-oriented valley map for mobile viewing"
        icon={<MapPin size={20} className="text-amber-500" />}
        aspectRatio="3/4"
        currentImageUrl={landingPhotos?.customMap}
        onUploadSuccess={async (url) => {
            await updateLandingPhotos('customMap', url);
        }}
        placeholder="नक्शा अपलोड करें / Upload Valley Map"
    />

    {/* Hotel Registration Document Upload */}
    <PhotoUploadSection
        title="Hotel Registration Document"
        description="1995 Original Registration Certificate"
        icon={<Clock size={20} className="text-blue-500" />}
        aspectRatio="3/4"
        currentImageUrl={landingPhotos?.hotelRegistration}
        onUploadSuccess={async (url) => {
            await updateLandingPhotos('hotelRegistration', url);
        }}
        placeholder="पंजीकरण दस्तावेज़ / Upload Registration"
    />
</div>
```

### Step 5: Add Quick Access Button (Optional)

In the "Quick Overview Navigation" grid (around line 1080-1142), add:

```tsx
<button
    onClick={() => {
        const el = document.getElementById('landing-photos');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}
    className="bg-amber-100 hover:bg-amber-200 p-4 rounded-2xl border border-amber-200 flex flex-col items-center gap-2 transition-all group"
>
    <div className="p-3 bg-amber-600 text-white rounded-xl shadow-lg ring-4 ring-amber-100 group-hover:scale-110 transition-transform">
        <ImageIcon size={24} />
    </div>
    <span className="text-xs font-bold text-black uppercase tracking-wider">Photos</span>
</button>
```

---

## ✅ Testing Steps:

1. Save all files
2. Refresh browser (`Ctrl + Shift + R`)  
3. Go to Admin Panel → Settings tab
4. Scroll down to "Landing Page Photos"
5. Click upload areas
6. Select images
7. Watch for success message
8. Check home page to verify

---

## 🐛 Troubleshooting:

### Build Errors?
- Check component import path
- Ensure PhotoUpload.tsx is in `/src/components/`

### Upload button not showing?
- Hard refresh (`Ctrl + Shift + R`)
- Check browser console (F12)

### Upload fails silently?
- Check Firebase permissions
- Verify login is active
- Check console for errors

---

## 🎯 Quick Alternative (If Manual Edit is Complex):

Use Firebase Console directly:
1. https://console.firebase.google.com
2. Storage → Upload files
3. Get download URL
4. Firestore → `settings/landingPhotos` → Add fields:
   - `customMap`: [URL]
   - `hotelRegistration`: [URL]

This will work immediately without code changes!
