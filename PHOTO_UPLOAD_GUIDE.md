# 📸 Photo Upload Troubleshooting Guide

## ❌ Common Upload Issues & Solutions

### Issue: "Photo upload nahi ho raha"

#### ✅ **Recommended Image Sizes:**

1. **Gateway Map (Portrait)**
   - Aspect Ratio: **3:4** (portrait mode)
   - Recommended Size: **900px × 1200px**
   - Max File Size: **5 MB** (auto-compressed to under 200KB)
   - Format: **JPG, JPEG, PNG, WEBP**

2. **Hotel Registration Document**
   - Aspect Ratio: **Any** (document photo)
   - Recommended Size: **1200px × 1600px** or original phone camera
   - Max File Size: **10 MB** (auto-compressed to under 500KB)
   - Format: **JPG, JPEG, PNG**

---

## 🔧 **Current System Limits:**

### Auto-Compression Rules (in `store.ts`):
```javascript
- Files < 200KB: ✅ No compression needed
- Files > 200KB: 🔄 Auto-compressed to 1200px max dimension
- Quality: 80% JPEG
- Final size: Usually under 200KB
```

### Upload Process:
1. Select photo from device
2. Automatic client-side compression (if needed)
3. Upload to Firebase Storage
4. Get secure URL
5. Save to Firestore database

---

## 🐛 **Troubleshooting Steps:**

### 1. **Check Internet Connection**
   - Modal shows "Uploading..." but stuck?
   - → Check your WiFi/mobile data

### 2. **File Too Large (>10MB)**
   - Take photo at lower resolution
   - Or use image compression tool first

### 3. **Browser Console Errors**
   - Press **F12** → Console tab
   - Look for Firebase errors:
     ```
     ❌ "storage/unauthorized" → Login again
     ❌ "storage/quota-exceeded" → Contact admin
     ❌ "storage/retry-limit-exceeded" → Network issue
     ```

### 4. **Unsupported File Format**
   - Only images allowed: .jpg, .jpeg, .png, .webp
   - PDFs/Documents not supported for map upload

### 5. **Mobile-Specific Issues**
   - **iOS Safari**: Allow camera/storage permission
   - **Android Chrome**: Enable storage access
   - Try taking photo directly vs selecting from gallery

---

## 📱 **Best Practices:**

### For **Map Upload**:
1. Open camera app
2. **Portrait mode** (vertical)
3. Good lighting
4. Clear, high contrast
5. Save & upload from gallery

### For **Registration Document**:
1. Lay document flat
2. Good overhead lighting
3. All text clearly readable
4. No shadows or glare
5. Capture entire document

---

## 🚨 **If Still Not Working:**

### Quick Debug:
1. **Hard refresh Admin Panel**: `Ctrl + Shift + R`
2. **Clear browser cache**: Settings → Clear browsing data
3. **Try different browser**: Chrome recommended
4. **Check Firebase quota**: Contact developer if uploads consistently fail

### Error Messages to Note:
- ✅ "Upload successful!" → Working fine
- ⏳ "Uploading..." (stuck for >30 sec) → Network/size issue
- ❌ "Upload failed" → Check console (F12)

---

## 💡 **Developer Notes:**

Current upload function location: `src/lib/store.ts` (line 809)

Key config:
- Max dimension: **1200px**
- Compression quality: **0.8** (80%)
- Storage path: `uploads/{timestamp}_{filename}.jpg`
- Auto-saves to gallery: Yes (if `saveToGallery = true`)

To increase limits, modify:
```typescript
const MAX_DIM = 1200; // ← Change this
canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.8); // ← Quality
```
