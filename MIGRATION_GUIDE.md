# 🚀 Firebase Migration Guide: US → India (Mumbai)

## Migration Overview
**From:** US Region (nam5) - 376ms latency  
**To:** India Mumbai (asia-south1) - ~60ms latency  
**Expected Improvement:** 5-6x faster performance  
**Estimated Time:** 45-60 minutes  
**Downtime:** 15-30 minutes

---

## 📋 Pre-Migration Checklist

- [ ] Current app is working properly
- [ ] You have admin access to Firebase Console
- [ ] You have Google account ready for new project
- [ ] All staff are notified about brief maintenance window
- [ ] You've read this guide completely

---

## 🎯 Migration Steps

### **PHASE 1: Create New Firebase Project (15 minutes)**

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Click "Add Project"

2. **Project Setup**
   - Project Name: `tashizom-india` (or your preferred name)
   - Click "Continue"
   - Disable Google Analytics (or enable if you want)
   - Click "Create Project"

3. **Set Region to INDIA (CRITICAL!)**
   - Wait for project to be created
   - Go to "Firestore Database" in left sidebar
   - Click "Create database"
   - **IMPORTANT:** Select **"asia-south1 (Mumbai)"** as location
   - Start in **Production mode** (we'll add rules later)
   - Click "Create"

4. **Enable Firebase Storage**
   - Go to "Storage" in left sidebar
   - Click "Get Started"
   - Start in **Production mode**
   - **Select same region: asia-south1 (Mumbai)**
   - Click "Done"

5. **Enable Firebase Authentication**
   - Go to "Authentication" in left sidebar
   - Click "Get Started"
   - Click "Sign-in method" tab
   - Enable "Email/Password"
   - Click "Save"

6. **Enable Firebase Hosting**
   - Go to "Hosting" in left sidebar
   - Click "Get Started"
   - Follow prompts (we'll deploy later via CLI)

7. **Get New Firebase Config**
   - Click ⚙️ Settings icon → "Project settings"
   - Scroll down to "Your apps"
   - Click "</> Web" icon
   - App nickname: `TashiZom India`
   - ✅ Check "Also set up Firebase Hosting"
   - Click "Register app"
   - **COPY the firebaseConfig object** - save it in a notepad!
   - It will look like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "tashizom-india.firebaseapp.com",
     projectId: "tashizom-india",
     storageBucket: "tashizom-india.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

8. **Set up Firestore Security Rules**
   - Go to "Firestore Database"
   - Click "Rules" tab
   - Replace with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click "Publish"

9. **Set up Storage Security Rules**
   - Go to "Storage"
   - Click "Rules" tab
   - Replace with:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click "Publish"

---

### **PHASE 2: Export Data from Old Project (10 minutes)**

1. **Run Export Script**
   ```bash
   cd d:\Reference_Projects\charged-satellite
   node export-data.mjs
   ```
   
2. **Verify Export**
   - Check that `migration-backup` folder was created
   - Should contain JSON files for:
     - menu.json
     - tables.json
     - users.json
     - orders.json
     - reviews.json
     - settings.json
     - notifications.json
     - media.json

---

### **PHASE 3: Configure New Project (5 minutes)**

1. **Update Firebase Config**
   - Open: `src/lib/firebase.ts`
   - Replace the OLD firebaseConfig with the NEW one you copied
   - Save the file

2. **Update .firebaserc**
   - Open: `.firebaserc`
   - Change project ID:
   ```json
   {
     "projects": {
       "default": "tashizom-india"
     }
   }
   ```
   - Save the file

3. **Login to Firebase CLI**
   ```bash
   firebase login
   ```
   - Follow browser authentication

---

### **PHASE 4: Import Data to New Project (10 minutes)**

1. **Run Import Script**
   ```bash
   node import-data.mjs
   ```
   
2. **Verify Import**
   - Go to new Firebase Console
   - Check Firestore Database - should see all collections
   - Check Storage - should see uploaded images

---

### **PHASE 5: Recreate User Accounts (5-10 minutes)**

Users cannot be automatically migrated. You must recreate them:

1. **Visit Init Page (Local Dev First)**
   ```bash
   npm run dev
   ```
   - Visit: http://localhost:3000/admin/init

2. **Recreate Admin Account**
   - Email: `admin@tashizomcafe.in`
   - Password: (your admin password)
   - Role: Admin
   - Secret: `tashizom-secure-setup-2025`
   - Click "Initialize User"

3. **Recreate Staff Accounts**
   - Repeat for each staff:
     - `staff1@tashizomcafe.in`
     - `staff2@tashizomcafe.in`
     - `staff3@tashizomcafe.in`
   - Role: Staff
   - Set their passwords

---

### **PHASE 6: Test Everything (10 minutes)**

1. **Test Admin Login**
   - Go to: http://localhost:3000/admin
   - Login with admin credentials
   - Verify you can see menu, orders, settings

2. **Test Staff Login**
   - Login as a staff user
   - Verify dashboard works

3. **Test Customer Flow**
   - Go to: http://localhost:3000/customer/menu
   - Add items to cart
   - Try placing a test order
   - Verify order appears in admin/staff dashboard

4. **Check All Features**
   - Menu management
   - Table management
   - Order management
   - Settings

---

### **PHASE 7: Deploy to Production (5 minutes)**

1. **Build the App**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Verify Deployment**
   - Visit your new URL (should be in deployment output)
   - Test the region:
     - Go to: https://your-new-url.web.app/admin/check-region
     - Should show ~60-100ms latency with India flag! 🇮🇳

---

### **PHASE 8: Update QR Codes (Optional)**

If your domain changed, you'll need to:
1. Generate new QR codes with new domain
2. Print and replace at tables
3. Or, set up custom domain (advanced)

---

## ✅ Post-Migration Verification

- [ ] Region check shows < 150ms latency
- [ ] Admin login works
- [ ] Staff login works
- [ ] Customer can browse menu
- [ ] Orders can be placed
- [ ] All menu items are present
- [ ] All tables are present
- [ ] Settings are correct

---

## 🆘 Troubleshooting

### "Permission Denied" errors
- Go to Firestore Rules and Storage Rules
- Make sure they're set to allow all (as shown in Phase 1)

### "Auth domain not authorized"
- Go to Firebase Console → Authentication → Settings
- Add your domain to "Authorized domains"

### Data didn't import
- Check console for errors
- Re-run import script
- Verify you're connected to new project

### Users can't login
- Make sure you recreated all user accounts in Phase 5
- Firebase Auth users cannot be migrated automatically

---

## 📞 Need Help?

If anything goes wrong:
1. Don't panic - old project is still intact
2. Check error messages carefully
3. You can always revert to old config
4. Ask for help!

---

## 🎉 Success!

Once complete, your app will be:
- ✅ 5-6x faster for Indian customers
- ✅ Better experience in Spiti Valley
- ✅ Based in Mumbai, India region
- ✅ Future-proof for growth

**Estimated performance:**
- Before: 376ms latency 🐌
- After: ~60ms latency ⚡

That's **6x faster!** 🚀
