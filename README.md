# MyFlightApp - Google Flights Mobile Clone

A React Native mobile application that replicates Google Flights functionality with user authentication and flight search capabilities.

## Features

- **User Authentication**: Secure sign-up/sign-in using Clerk
- **Flight Search**: Search for flights between airports
- **Airport Search**: Auto-complete airport search with IATA codes
- **Real-time Data**: Integration with RapidAPI Sky Scrapper for flight data
- **Responsive UI**: Google Flights-inspired design with modern UI components
- **Cross-platform**: Works on both iOS and Android

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Authentication**: Clerk
- **API**: RapidAPI Sky Scrapper
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- Clerk account for authentication
- RapidAPI account for flight data

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MyFlightApp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
X_RapidAPI_Key=your_rapidapi_key
```

4. Start the development server:
```bash
npx expo start
```

## Configuration

### Clerk Authentication
1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Get your publishable key from the Clerk dashboard
3. Add the key to your `.env` file

### RapidAPI Sky Scrapper
1. Subscribe to Sky Scrapper API on RapidAPI
2. Get your API key from the RapidAPI dashboard  
3. Add the key to your `.env` file

## Project Structure

```
MyFlightApp/
├── app/
│   ├── (tabs)/           # Tab navigation screens
│   │   ├── index.tsx     # Home/Flight search screen
│   │   └── explore.tsx   # Explore screen
│   ├── _layout.tsx       # Root layout with Clerk provider
│   └── SignInSignUp.tsx  # Authentication screen
├── components/
│   ├── FlightSearchHome.tsx  # Main flight search component
│   └── ui/               # UI components
├── constants/
│   └── Colors.ts         # App color scheme
└── hooks/                # Custom React hooks
```

## Key Components

### Authentication Flow
- Users must sign up/sign in before accessing the app
- Protected routes redirect unauthenticated users to sign-in
- Clean sign-out functionality with proper session management

### Flight Search
- Airport search with auto-complete
- Date selection for departure/return
- Real-time flight data from Sky Scrapper API
- Error handling for API failures

### UI/UX
- Google Flights-inspired color scheme (blue and orange)
- Responsive design for various screen sizes
- Loading states and error messages
- Smooth navigation between screens

## API Integration

The app integrates with RapidAPI Sky Scrapper to provide:
- Airport search and IATA code lookup
- Flight search between airports
- Real-time pricing and availability

## Development

To run the app in development:

```bash
npx expo start
```

Use the Expo Go app on your phone or run on iOS/Android simulators.

## Building for Production

1. Build for iOS:
```bash
npx expo build:ios
```

2. Build for Android:
```bash
npx expo build:android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes as part of a coding assessment.

## Demo Video

[Loom presentation video will be added here]

---

Created as part of a mobile app development assessment - turning Google Flights into a mobile app with user authentication.

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
