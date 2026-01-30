# Photo Upload Troubleshooting Guide

## आपके लिए चेकलिस्ट:

### 1. Browser Console Check करें (सबसे जरूरी)
```
1. F12 दबाएं
2. Console tab पर जाएं  
3. Photo upload की कोशिश करें
4. RED errors को copy करें और मुझे भेजें
```

### 2. Firebase Storage Rules Check करें

**जाएं:** https://console.firebase.google.com
**Project:** charged-satellite
**Build → Storage → Rules**

**ये rules होने चाहिए:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**अगर ऊपर वाले rules नहीं हैं, तो ये copy-paste करके "Publish" करें**

### 3. Admin Login Check करें
```
Admin panel में logged in हैं?
Email और password से login किया?
```

### 4. Hard Refresh करें
```
Ctrl + Shift + R
या
Ctrl + F5
```

### 5. Dev Server Restart करें
```bash
# Terminal में:
Ctrl + C (stop current server)
npm run dev (start again)
```

## Common Errors और Solutions:

### Error: "Permission denied" या "storage/unauthorized"
**Solution:** 
- Firebase Console → Storage → Rules में जाएं
- ऊपर दिए गए rules paste करें
- Admin login check करें

### Error: "Network error" 
**Solution:**
- Internet connection check करें
- Firewall/Antivirus check करें
- VPN off करें

### Error: "Failed to compress image"
**Solution:**
- Photo size 10MB से कम होनी चाहिए
- Valid image file (JPG/PNG/WEBP) होनी चाहिए

### Upload button click नहीं हो रहा
**Solution:**
- Hard refresh करें (Ctrl+Shift+R)
- Browser cache clear करें
- Dev server restart करें

## अभी करें:

1. **F12 दबाएं**
2. **Console tab खोलें**
3. **Photo upload करने की कोशिश करें**
4. **Console में जो भी RED text दिखे, वो मुझे भेजें**

मैं exact solution दूंगा!
