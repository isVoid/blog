---
layout: post
title:  "IOS Camera Note (II)"
date:   2019-01-19 13:06:00 +0400
categories: Leetcode
published: true
---

## Camera Authorization
1. Add `NSCameraDescription` (Privacy-Camera Usage Description) key in info.plist to describe the need for using camera.
2. Test authorization before each camera setup.
  1. Test ```AVCaptureDevice.authorizationStatus（for:)```, four results are possible:
    1. ```.authorized```, `.denied`, `.restricted`
    2. Upon `.notDetermined `, use `requestAccess(for:completionHandler:)` to prompt user. Note `completionHandler` is async execution.
3. Test authorization before saving media.
    1. `PHPhotoLibrary` and `PHAssetCreationRequest` provide read/write function for Photos library. Add `NSPhotoLibraryUsageDescription` to info.plist.
    2. `UISavePhotoAtPathtoSavedPhotosAlbum` provide an easier access to save movie files. Add `NSPhotoLibraryAddUsageDescription` to info.plist.
