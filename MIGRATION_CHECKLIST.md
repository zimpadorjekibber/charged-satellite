# 🚀 Quick Migration Checklist

Use this as a quick reference during migration. See MIGRATION_GUIDE.md for detailed instructions.

## ☐ Phase 1: Create New Project (15 min)
- [ ] Go to https://console.firebase.google.com
- [ ] Create new project
- [ ] ⭐ **Set Firestore region to: asia-south1 (Mumbai)**
- [ ] Enable Firestore Database (Production mode)
- [ ] Enable Storage (same region: asia-south1)
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Hosting
- [ ] Copy new firebaseConfig (save in notepad!)
- [ ] Set Firestore security rules (allow all for now)
- [ ] Set Storage security rules (allow all for now)

## ☐ Phase 2: Export Old Data (10 min)
```bash
cd d:\Reference_Projects\charged-satellite
node export-data.mjs
```
- [ ] Verify `migration-backup` folder created
- [ ] Check all JSON files are present

## ☐ Phase 3: Configure New Project (5 min)
- [ ] Open `import-data.mjs`
- [ ] Replace NEW_FIREBASE_CONFIG with your new config
- [ ] Save file

## ☐ Phase 4: Import Data (10 min)
```bash
node import-data.mjs
```
- [ ] Wait for import to complete
- [ ] Check new Firebase Console - data should be visible

## ☐ Phase 5: Update App Config (5 min)
- [ ] Update `src/lib/firebase.ts` with new config
- [ ] Update `.firebaserc` with new project ID
- [ ] `firebase login` if needed

## ☐ Phase 6: Recreate Users (10 min)
```bash
npm run dev
```
- [ ] Visit: http://localhost:3000/admin/init
- [ ] Create admin account
- [ ] Create all staff accounts (staff1, staff2, staff3)

## ☐ Phase 7: Test Everything (10 min)
- [ ] Test admin login
- [ ] Test staff login
- [ ] Browse customer menu
- [ ] Place test order
- [ ] Check order appears in dashboard

## ☐ Phase 8: Deploy (5 min)
```bash
npm run build
firebase deploy
```
- [ ] Wait for deployment
- [ ] Visit new URL
- [ ] Test region: /admin/check-region
- [ ] Should show ~60ms! 🎉

## ☐ Post-Migration
- [ ] Update QR codes if domain changed
- [ ] Notify staff of any changes
- [ ] Monitor for issues

---

## 🆘 Quick Troubleshooting

**"Permission denied"**
→ Check Firestore/Storage rules in Console

**"Config not found"**
→ Verify you updated firebase.ts and .firebaserc

**Users can't login**
→ Did you recreate them in Phase 6?

**Data not showing**
→ Check Firebase Console, re-run import if needed

---

## 📊 Expected Results

**Before Migration:**
- Latency: ~376ms 🐌
- Region: US (nam5)

**After Migration:**
- Latency: ~50-80ms ⚡
- Region: India (asia-south1)
- **6x faster!** 🚀

---

## 🎯 Commands Quick Reference

```bash
# Export data from old project
node export-data.mjs

# Import data to new project
node import-data.mjs

# Test locally
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# Login to Firebase
firebase login
```

---

Good luck! You got this! 💪
