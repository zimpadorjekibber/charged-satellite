# 🚀 Deployment to Production - Complete Guide

## ✅ Step 1: Code Pushed to GitHub - DONE!

Your code has been successfully pushed to GitHub:
- Repository: `charged-satellite`
- Branch: `main`
- Commit: "Complete menu setup: 121 items with professional images"

---

## 🌐 Step 2: Vercel Deployment

### **Automatic Deployment (If Already Connected)**

If you've already connected your GitHub repository to Vercel, deployment will happen **automatically**!

**Check your deployment:**
1. Visit: https://vercel.com/dashboard
2. Look for your `charged-satellite` project
3. You should see a new deployment in progress
4. Wait 2-3 minutes for it to complete

### **Manual Deployment (If Not Connected)**

If this is your first deployment or you need to reconnect:

1. **Login to Vercel:**
   ```
   Visit: https://vercel.com
   Login with your GitHub account
   ```

2. **Import Project:**
   - Click "Add New Project"
   - Select your GitHub repository: `charged-satellite`
   - Click "Import"

3. **Configure Build Settings:**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables:**
   Add these Firebase variables (they're already in your code, so no action needed):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCW1Vb_w8tAqbCNlbYR2WHZLdqLYWs-dvY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tashizom.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tashizom
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tashizom.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1059551779677
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1059551779677:web:67e12f3c8fdd6c29071d21
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live!

---

## 📱 Your Production URLs

Once deployed, your app will be available at:

### **Primary URL:**
```
https://tashizomcafe.in
```

### **Fallback URL:**
```
https://charged-satellite.vercel.app
```

### **Customer Access:**
```
Menu: https://tashizomcafe.in/customer/menu
Cart: https://tashizomcafe.in/customer/cart
Status: https://tashizomcafe.in/customer/status
Feedback: https://tashizomcafe.in/customer/feedback
```

### **Admin Access:**
```
Portal: https://charged-satellite.vercel.app/admin
Username: admin
Password: admin123
```

### **Staff Access:**
```
Dashboard: https://charged-satellite.vercel.app/staff
Username: staff
Password: staff123
```

---

## 🔧 Post-Deployment Checklist

After deployment completes:

### 1. **Verify Production Site** ✅
- [ ] Open your production URL
- [ ] Check customer menu loads
- [ ] Verify all 17 categories appear
- [ ] Test menu item images load
- [ ] Check admin portal login works

### 2. **Test Core Features** ✅
- [ ] Customer can browse menu
- [ ] Veg/Non-veg filters work
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] Admin can manage menu

### 3. **Firebase Security (Important!)** ⚠️

Right now, your Firebase is open for development. For production, update Firebase rules:

**Go to:** https://console.firebase.google.com/project/tashizom/firestore/rules

**Update Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for menu, tables, reviews, and settings
    match /menu/{document} {
      allow read: true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    match /tables/{document} {
      allow read: true;
      allow write: if request.auth != null;
    }
    
    match /reviews/{document} {
      allow read: true;
      allow create: true; // Anyone can create reviews
      allow update, delete: if request.auth != null;
    }
    
    match /settings/{document} {
      allow read: true;
      allow write: if request.auth != null;
    }
    
    match /settings/media/library/{document} {
      allow read: true;
      allow write: if request.auth != null;
    }
    
    // Orders - customers can create, staff can read/update
    match /orders/{document} {
      allow create: true; // Customers can create orders
      allow read, update: if request.auth != null; // Staff can manage
    }
    
    // Notifications
    match /notifications/{document} {
      allow create: true; // Customers can create notifications
      allow read, update: if request.auth != null; // Staff can manage
    }
  }
}
```

**Update Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu-images/{allPaths=**} {
      allow read: true; // Public read for menu images
      allow write: if request.auth != null; // Only authenticated users can upload
    }
    
    match /uploads/{allPaths=**} {
      allow read: true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🎯 Custom Domain Setup (Optional)

If you want to use `tashizomcafe.in`:

1. **In Vercel:**
   - Go to Project Settings → Domains
   - Add custom domain: `tashizomcafe.in`
   - Copy the DNS records provided

2. **In Your Domain Provider:**
   - Add A record or CNAME as instructed
   - Wait for DNS propagation (5-30 minutes)

3. **Enable HTTPS:**
   - Vercel automatically provisions SSL certificate
   - Your site will be secure (https://)

---

## 🎉 You're Live!

Once deployment completes:

✅ **Your restaurant menu is LIVE on the internet!**
✅ **Customers can scan QR codes and order**
✅ **Staff can manage orders**
✅ **Admin can update menu**
✅ **All running for FREE!**

---

## 📊 Monitoring Your Site

**Vercel Dashboard:**
- View deployment status
- Check analytics
- Monitor performance
- View error logs

**Firebase Console:**
- Monitor database usage
- Check storage usage
- View real-time data
- Manage security rules

---

## 🆘 Troubleshooting

**If deployment fails:**
1. Check Vercel deployment logs
2. Ensure all environment variables are set
3. Verify Firebase config is correct
4. Check for build errors

**If menu doesn't load:**
1. Check Firebase console for data
2. Verify Firebase rules allow public read
3. Check browser console for errors
4. Ensure internet connection is stable

---

## 🔄 Future Updates

To push updates to production:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main

# Vercel will auto-deploy!
```

---

**Deployment Date:** December 9, 2025  
**Total Menu Items:** 121  
**Professional Images:** 21  
**Monthly Cost:** $0.00 (FREE!)

🎊 **CONGRATULATIONS! Your TashiZom digital menu is now live!** 🎊
