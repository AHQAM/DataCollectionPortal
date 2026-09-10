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
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
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
    apiKey: 'AIzaSyAR34u133uus3aE4QQCk9njGx5MY3vxjyk',
    appId: '1:235369138965:web:7e717059f2fdcd0cf3371c',
    messagingSenderId: '235369138965',
    projectId: 'datacollectionportal-d8d63',
    authDomain: 'datacollectionportal-d8d63.firebaseapp.com',
    storageBucket: 'datacollectionportal-d8d63.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAR34u133uus3aE4QQCk9njGx5MY3vxjyk',
    appId: '1:235369138965:android:7e717059f2fdcd0cf3371c',
    messagingSenderId: '235369138965',
    projectId: 'datacollectionportal-d8d63',
    storageBucket: 'datacollectionportal-d8d63.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAR34u133uus3aE4QQCk9njGx5MY3vxjyk',
    appId: '1:235369138965:ios:7e717059f2fdcd0cf3371c',
    messagingSenderId: '235369138965',
    projectId: 'datacollectionportal-d8d63',
    storageBucket: 'datacollectionportal-d8d63.firebasestorage.app',
    iosBundleId: 'com.example.mobile',
  );
}
