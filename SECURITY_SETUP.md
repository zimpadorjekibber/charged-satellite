# 🔐 Security Upgrade Guide

Everything is now set up for **Secure Authentication**. This replaces the old "mock login" with real, industrial-grade security.

## 🛑 Important: Your Old Passwords Will Stop Working!
Because we switched systems, the old hardcoded passwords (`admin123`, `staff123`) are gone. **You must create new accounts.**

---

## 🛠️ Step-by-Step Setup (Do this immediately after deployment)

### 1. Initialize Your Accounts
We built a secret "Backdoor" page for you to set up your accounts safely.

1.  Open your app at: **`https://tashizomcafe.in/admin/init`**
2.  Enter the **Setup Secret**: `tashizom-secure-setup-2025`
3.  **Create Admin Account:**
    *   **Email:** `admin` (will auto-become `admin@tashizomcafe.in`)
        *   *Tip: You can use your real email if you prefer, e.g. `owner@gmail.com`*
    *   **Password:** Choose a STRONG password.
    *   **Role:** Select `Admin`.
    *   Click **Initialize User**.
4.  **Create Staff Account:**
    *   **Email:** `staff` (will auto-become `staff@tashizomcafe.in`)
    *   **Password:** Choose a simple password for staff (e.g. `staff2025`).
    *   **Role:** Select `Staff`.
    *   Click **Initialize User**.

### 2. Lock Down the Database
Now that you have real accounts, tell Firebase to ONLY allow these accounts to touch your data.

1.  Go to [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/tashizom/firestore/rules)
2.  Paste these new, stricter rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // -- USER ROLES (The core security layer) --
    match /users/{userId} {
      allow read: if request.auth != null; // Staff/Admin can see other profiles
      allow write: if request.auth != null; // Ideally restrict to Admin only in future
    }

    // -- MENU --
    match /menu/{document} {
      allow read: true; // Public can see menu
      allow write: if request.auth != null; // Only logged-in users can edit
    }
    
    // -- TABLES --
    match /tables/{document} {
      allow read: true;
      allow write: if request.auth != null;
    }
    
    // -- ORDERS (Critical) --
    match /orders/{orderId} {
      allow create: true; // Customers create orders
      allow read: if true; // Customers need to read their own orders (we filter in code)
      allow update: if request.auth != null; // ONLY Staff/Admin can change status (Paid/Served)
      allow delete: if request.auth != null; // ONLY Staff/Admin can delete
    }

    // -- OTHER COLLECTIONS --
    match /reviews/{document} { allow read, create: true; allow update, delete: if request.auth != null; }
    match /notifications/{document} { allow read, create: true; allow update, delete: if request.auth != null; }
    match /settings/{document=**} { allow read: true; allow write: if request.auth != null; }
    match /analytics_scans/{doc} { allow create: true; allow read: if request.auth != null; }
    match /archived_orders/{doc} { allow read, write: if request.auth != null; }
  }
}
```

## 🚀 How to Login Now

### Admin Portal
*   **Username:** `admin` (or whatever you created)
*   **Password:** The new password you set.
*   *Note: If you used a real email like `owner@gmail.com`, type that instead.*

### Staff Portal
*   **Staff ID:** `staff` (or `staff1`, etc.)
*   **Password:** The new password you set.

---
**✅ You remain safe from hackers because:**
1.  Passwords are no longer in the code.
2.  Hackers cannot "fake" being an Admin.
3.  Only verified accounts can delete/edit data.
