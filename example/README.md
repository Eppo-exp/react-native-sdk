# Eppo React Native SDK Example

This is an example app demonstrating the [Eppo React Native SDK](https://github.com/Eppo-exp/react-native-sdk).

## Setup

1. **Install dependencies**

   ```bash
   yarn install
   ```

2. **Configure your API key**

   Copy the example environment file and add your Eppo API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set your API key:

   ```
   EXPO_PUBLIC_EPPO_API_KEY=your-api-key-here
   ```

3. **Update flag and subject keys**

   Edit `components/TestComponent.tsx` to use your flag key and subject key:

   ```typescript
   const assignedVariation = eppoClient.getBooleanAssignment(
     'your-flag-key', // Replace with your flag key
     'your-subject-key', // Replace with your subject key
     {},
     false
   );
   ```

## Run the app

```bash
yarn start
```

Then choose your platform:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your device

## Project Structure

- `app/` - Main app screens using Expo Router
- `components/EppoRandomizationProvider.tsx` - Initializes the Eppo SDK
- `components/TestComponent.tsx` - Example component that gets a feature flag assignment

## Testing with Local SDK

If you're developing the SDK and want to test your local changes:

1. **Build the SDK from the repository root**

   ```bash
   cd ..
   yarn prepack
   cd example
   ```

2. **Update package.json to use local SDK**

   Change the SDK dependency in `package.json`:

   ```json
   "@eppo/react-native-sdk": "file:.."
   ```

3. **Reinstall dependencies**

   ```bash
   yarn install
   ```

4. **Start the app**

   ```bash
   yarn start
   ```

To switch back to the published version, change the dependency back to `"*"` and run `yarn install` again.

## Learn More

- [Eppo Documentation](https://docs.geteppo.com/)
- [React Native SDK Documentation](https://docs.geteppo.com/sdks/client-sdks/react-native/)
- [Expo Documentation](https://docs.expo.dev/)
