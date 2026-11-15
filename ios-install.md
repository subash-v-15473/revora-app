# Installing the Revora iOS app on your iPhones

The app is a native shell that shows the live Revora site, so every update pushed to the website appears in the app automatically. You only install it once per phone.

## One-time: Apple Developer account
Sign in at https://developer.apple.com/account with your Apple ID and enrol in the Apple Developer Program ($99/year). Without it, Xcode can still install the app with a free Apple ID, but the install expires after 7 days and has to be redone.

## Install on a phone (about 5 minutes each)
1. Open the project: in Terminal run `open ~/revora-app/ios/App/App.xcworkspace` (or `npx cap open ios` inside the repo).
2. In Xcode's left panel click the blue **App** project, then the **App** target, then the **Signing & Capabilities** tab.
   - Tick **Automatically manage signing**.
   - **Team**: choose your Apple Developer team (or your personal team for the 7-day option).
   - Bundle identifier stays `com.revora.app`.
3. Plug the iPhone in with a cable, unlock it, and tap **Trust** on the phone if asked.
4. At the top of Xcode pick your iPhone as the run destination (next to the App scheme), then press the **Run** (▶) button.
5. First time only, on the iPhone: **Settings → General → VPN & Device Management → Developer App → Trust**. Then open Revora from the home screen.
6. Repeat steps 3–5 with your partner's phone.

## Updating the app
Normally never needed: the app loads the live website. Rebuild only if the shell itself changes (icon, permissions, native plugins).
