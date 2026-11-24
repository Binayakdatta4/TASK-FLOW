# TaskFlow Security Specification

## 1. Data Invariants
1. Every document in `/tasks/{taskId}` must belong to an authenticated, email-verified user (`userId == request.auth.uid`).
2. `taskId` must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
3. `title` must be a non-empty string (`1 <= size <= 140`).
4. `description` must be a string (`size <= 1000`).
5. `priority` must strictly be one of `'Low'`, `'Medium'`, `'High'`.
6. `dueDate` must be a string (`size <= 10`) matching `^(\d{4}-\d{2}-\d{2})?$`.
7. `completed` must be a boolean (`false` on creation).
8. `createdAt` and `updatedAt` must equal `request.time` on creation; `createdAt` and `userId` are immutable on update, and `updatedAt` must equal `request.time` on update.
9. No shadow/extra fields are allowed (`hasAll` + `hasOnly` on create; `affectedKeys().hasOnly(...)` on update).
10. Unauthenticated users or users without `email_verified == true` have zero read/write access.
11. Users can only read (`get` and `list`), update, and delete tasks where `resource.data.userId == request.auth.uid`.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Read/List**: `getDocs(collection(db, 'tasks'))` with `auth == null`.
2. **Unverified Email Write**: `addDoc` with `email_verified: false`.
3. **Cross-Tenant Identity Spoofing**: User A attempts `addDoc` with `userId: "user-B"`.
4. **Cross-Tenant Read**: User A attempts `getDoc(doc(db, 'tasks', userBTaskId))`.
5. **Cross-Tenant List Scraping**: User A runs `getDocs(collection(db, 'tasks'))` without `where('userId', '==', userA.uid)`.
6. **Shadow / Ghost Field Injection (Create)**: `addDoc` with valid fields plus `isAdmin: true`.
7. **Shadow / Ghost Field Injection (Update)**: `updateDoc` attempting to add `extraTag: "hack"`.
8. **Empty Title / Missing Required Field**: `addDoc` with `title: ""`.
9. **Denial-of-Wallet Oversized String**: `addDoc` with `description` of 5,000 characters (`> 1000`) or `title` of 500 characters (`> 140`).
10. **Invalid Enum / Value Poisoning**: `updateDoc` setting `priority: "Critical"` or `completed: "yes"`.
11. **Immutable Field Tampering**: `updateDoc` attempting to mutate `userId` or `createdAt`.
12. **Client Timestamp Forgery / ID Poisoning**: `addDoc` with backdated `createdAt` (`!= request.time`) or `setDoc` with invalid `taskId` containing spaces/slashes/oversized string.
