# Firebase portal authentication setup

The portal now uses Firebase Authentication and role-based Realtime Database rules. Complete these steps before using or deploying the protected portals.

## 1. Enable email/password sign-in

In Firebase Console, open **Authentication → Sign-in method → Email/Password**, enable it, and save.

## 2. Create portal accounts

In **Authentication → Users**, create one account for the admin and one account for each team, judge, representative, or liaison group that needs access. The login screen uses usernames, while Firebase uses synthetic email addresses internally:

- `admin` → `admin@portal.dtxdandiya.com`
- `texas` → `texas@portal.dtxdandiya.com`
- `texas-liaison` → `texas-liaison@portal.dtxdandiya.com`
- `judge` → `judge@portal.dtxdandiya.com`

These inboxes do not need to exist. Password recovery must be handled manually in Firebase Console, so use strong passwords and store them securely. Do not reuse the former access codes.

## 3. Add user profiles

Copy each Firebase Authentication user's UID. In **Realtime Database**, create a `users` record using the UID as the key.

Example:

```json
{
  "users": {
    "ADMIN_USER_UID": {
      "role": "admin"
    },
    "TEXAS_USER_UID": {
      "role": "team",
      "teamId": "texas"
    },
    "JUDGE_USER_UID": {
      "role": "judge"
    },
    "TEXAS_LIAISON_UID": {
      "role": "liaison",
      "teamId": "texas"
    },
    "REPS_USER_UID": {
      "role": "reps"
    }
  }
}
```

Valid team IDs are `tamu`, `texas`, `michigan`, `uf`, `uiuc`, `uw`, `washu`, and `ucsd`.

## 4. Deploy database rules

From this project folder, sign in to the Firebase CLI, select project `dtx-dandiya-70009`, and deploy the Realtime Database rules in `database.rules.json`.

```sh
firebase login
firebase use dtx-dandiya-70009
firebase deploy --only database
```

Deploying these rules disables public database access. Admin accounts can manage all teams. Team accounts can read only their assigned team and submit reports. Judges and representatives can read portal data but cannot edit it.

## 5. Authorize the Netlify domain

After Netlify provides the production hostname, add it under **Authentication → Settings → Authorized domains** in Firebase Console. `localhost` can remain for local development.

## 6. Netlify routing

The existing `netlify.toml` already redirects portal URLs to the React application, so refreshing protected routes will continue to work on Netlify.
