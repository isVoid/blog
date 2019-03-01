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

# `CaptureCallback()`执行块
上面已经说到mState是`Preview`和`Waiting Lock`状态时的动作，其中在`Waiting Lock`状态时可能会出现AF完成而AE没完成的情况，这时会调用`runPrecaptureSequence()`方法，mState会进入`Waiting Precapture`状态。

`Precapture`方法其实就是进行一次AE。AE算法有这些状态`INACTIVE`,`SEARCHING`,`CONVERGED`,`FLASH_REQUIRED`,`LOCKED`,`PRECAPTURE`。AE序列可以通过相机本身或者用户来启动。用户启动的方法是触发`CONTROL_AE_PRECAPTURE_TRIGGER`。如果当前状态不是`LOCKED`，触发之后会进入`PRECAPTURE`状态，相机会进入`PRECAPTURE`序列，完成之后会进入`CONVERGED`或者`LOCKED`状态。

因此，在`Waiting Precapture`执行块中，当检测到`PRECAPTURE`或者是`FLASH_REQUIRED`状态时，说明此时相机已经启动（过）AE序列，但是还没完成，因此需要继续检测下一个状态，这是将`mState`设置为`Waiting Non PreCapture`。

因为`AEMode`是设置为`control_ae_mode_on_auto_flash`的，在`PreCapture`序列里如果光照不足闪光会自动启动。下一个状态可能是：
- `PRECAPTURE` -> `CONVERGED`
当然也有可能开了闪光之后场景还是太暗，于是进入`FLASH_REQUIRED`状态，但这时其实没有办法，只能force progress。于是这里处理的方法是，只要当前`CONTROL_AE_STATE_PRECAPTURE`状态不是`PRECAPTURE`就启动拍摄序列。

<p hidden>
在`Waiting Non PreCaputure`中，Basic应用用了比较简略的处理方法。理论上，这时AE状态有这些可能性：
- `PRECAPTURE` -> `CONVERGED`
- `PRECAPTURE` -> `LOCKED` （没有AE_Lock的UI，实际不可能进入这个状态）
- `FLASH_REQUIRED` -> `SEARCHING` -> `CONVERGED`
- `FLASH_REQUIRED` -> `SEARCHING` -> `LOCKED` （没有AE_Lock的UI，实际不可能进入这个状态）
- `FLASH_REQUIRED` -> `SEARCHING` -> `FLASH_REQUIRED` -> ...

但这里是一股脑地只要状态不是`PRECAPTURE`就马上宣布进入拍摄序列。问题主要在`FLASH_REQUIRED`状态中，这里的逻辑允许了在`FLASH_REQUIRED`状态下也进入拍摄序列，可能导致最后的图像结果过暗。
</p>
