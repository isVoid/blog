---
layout: post
title:  "IOS Camera Note (III)"
date:   2019-02-03 08:45 +0400
categories: IOS
published: true
---

## Camera Session Setup
Target:
- Setup a camera session that has *1 input* from camera device, *1 output* to photo file.
- Configure session profile as *photo*.
- Connect session data flow to a preview layer

Code:
```swift
func setupCaptureSession() {

    captureSession.beginConfiguration()

    //Add Input
    let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera,
                                              for:.video, position: .unspecified)
    guard
        let deviceInput = try? AVCaptureDeviceInput(device: videoDevice!),
                            captureSession.canAddInput(deviceInput)
        else {
            return
        }

    captureSession.addInput(deviceInput)

    //Add Output
    let photoOutput = AVCapturePhotoOutput()
    guard captureSession.canAddOutput(photoOutput) else {return}

    captureSession.sessionPreset = .photo
    captureSession.addOutput(photoOutput)

    captureSession.commitConfiguration()

    //Set Preview
    self.pView.videoPreviewLayer.session = captureSession

    //Start data flow I->O
    captureSession.startRunning()
}

```
