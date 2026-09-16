import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAYOf8Ayqjcq-Ew-UNGivcK0PXcj_pyXAw',
    appId: '1:152016503421:web:4ce2e5e5caf7df08f46714',
    messagingSenderId: '152016503421',
    projectId: 'landsurvey-ebb3b',
    authDomain: 'landsurvey-ebb3b.firebaseapp.com',
    storageBucket: 'landsurvey-ebb3b.firebasestorage.app',
    measurementId: 'G-8G6JSCZKZB',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAb2lZ9NbwMe3dfSpdVZuq8unf_mAG4hNM',
    appId: '1:152016503421:android:a68344d3184cc126f46714',
    messagingSenderId: '152016503421',
    projectId: 'landsurvey-ebb3b',
    storageBucket: 'landsurvey-ebb3b.firebasestorage.app',
  );
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDHm8fLmZo4UgZZX_Kee53RbAJhrS648GQ',
    appId: '1:152016503421:ios:37770b8da2e91b16f46714',
    messagingSenderId: '152016503421',
    projectId: 'landsurvey-ebb3b',
    storageBucket: 'landsurvey-ebb3b.firebasestorage.app',
    iosClientId: '152016503421-do9bri81o4vs8dibe9kel8sh09djnaqr.apps.googleusercontent.com',
    iosBundleId: 'com.example.mobile',
  );
  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyDHm8fLmZo4UgZZX_Kee53RbAJhrS648GQ',
    appId: '1:152016503421:ios:37770b8da2e91b16f46714',
    messagingSenderId: '152016503421',
    projectId: 'landsurvey-ebb3b',
    storageBucket: 'landsurvey-ebb3b.firebasestorage.app',
    iosClientId: '152016503421-do9bri81o4vs8dibe9kel8sh09djnaqr.apps.googleusercontent.com',
    iosBundleId: 'com.example.mobile',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyAYOf8Ayqjcq-Ew-UNGivcK0PXcj_pyXAw',
    appId: '1:152016503421:web:2babed6e3703937df46714',
    messagingSenderId: '152016503421',
    projectId: 'landsurvey-ebb3b',
    authDomain: 'landsurvey-ebb3b.firebaseapp.com',
    storageBucket: 'landsurvey-ebb3b.firebasestorage.app',
    measurementId: 'G-V40JPGD617',
  );
}
