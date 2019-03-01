---
layout: post
title:  "Camera2Basic 例程（I）"
date:   2019-02-25 11:30:00 +0100
categories: Android
published: true
---

> 感觉Android例程不是很友好= =（与AVCam相比缺少一篇完整的文章解释）[github地址](https://github.com/googlesamples/android-Camera2Basic)

# 截图
![Screenshot](/_posts/assets/camera2/cam2basic.png)

# 拍摄管道（概览）
按下"Picture"之后发生了什么？

首先调用`Camera2BasicFragment::onClick(View)`方法，这里调用了`takePicture()`。显然，是要去拍照。

`TakePicture()`只有一行，调用了`lockFocus()`。拍摄前，需要锁定对焦。

`lockFocus()`首先要求对焦锁定：
```Java
//CaptureRequest.set(Key<T> key, T value)方法可以设置多个跟capture request相关的参数
mPreviewRequestBuilder.set(CaptureRequest.CONTROL_AF_TRIGGER,
              CameraMetaData.CONTROL_AF_TRIGGER_START);
```
自动对焦状态：`afMode`有以下几个状态：`INACTIVE`, `ACTIVE_SCAN`, `FOCUSED_LOCKED`, `NOT_FOCUSED_LOCKED`。不管在哪个状态下，只要接受了`AF_TRIGGER_START`命令，都会进入`ACTIVE_SCAN`（寻焦状态）。Scan之后的结果必定是`FOCUSED_LOCKED`或`NOT_FOCUSED_LOCKED`其中之一，这两个状态都是AFLock状态。

之后，置`mState`为`STATE_WAITING_LOCK`。`mState`是本程序控制CaptureCallback执行块的状态参数。在`STATE_WAITING_LOCK`状态下，CaptureCallback会检查当前的AF和AE状态，当AF/AE都结束之后调用`captureStillPicture()`

`lockFocus()`最后调用`CameraCaptureSession.capture()`让自动对焦命令生效。

`captureStillImage()`：
1. 构建拍摄请求`CaptureRequest`，加入图像输出端`ImageReader`。
2. 在相机端设置AE/AF，在输出端设置JPG的旋转。
3. 开启自动闪光
3. 设置了一个`onCaptureCompleted`的回调，并在拍摄结束的最后调用`unlockFocus()`。
4. 最后通过`CaptureSession.capture()`让请求生效。

`unlockFocus()`：
1. 重置`afMode`为`INACTIVE`
2. 开启自动闪光
3. 重置`mState`为`STATE_PREVIEW`，通过`CaptureSession.setRepeatingRequest`启动preview

到这一步拍摄流程结束。



<p hidden="true">
它有这几个状态：
- STATE_PREVIEW 预览状态
- STATE_WAITING_LOCK 等待AF锁定状态
- STATE_WAITING_PRECAPTURE 等待曝光进入precapture状态
- STATE_WAITING_NON_PRECAPTURE 等待曝光进入除precapture以外的其他状态
- STATE_PICTURE_TAKEN 拍摄完成的状态
 </p>
