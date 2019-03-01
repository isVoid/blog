---
layout: post
title:  "Camera2 API Introduction"
date:   2019-02-24 12:00:00 +0100
categories: Android
published: true
---

> 自Android SDK 21以来，Camera2 API成为了新的相机接口。与以前的接口相比，Camera2API提供了完整的摄影流水线自定义的方案，并且可以对设备进行参数级，图像进行像素级的调整。本文翻译自![官方文档](https://developer.android.com/reference/android/hardware/camera2/package-summary)。

`android.hardware.camera2`包提供了一个对单独相机设备控制的接口，取代了旧的`Camera`类。

这个包将相机设备定义为一个流水线。该流水线取一个拍摄请求作为输入，根据请求拍摄单帧，之后输出一组拍摄元数据和图像缓存。同一时间可以有多个请求，但每个请求将会被按顺序处理。

`CameraManager`类可用于枚举，查询及打开可用的相机设备接口。

`CameraDevices`类提供了用于查询设备的静态属性，包括可用设置和可用的输出参数。通过`getCameraCharacteristics(String)`获得。

拍摄时，需要建立`Camera Capture Session`，每一个Session将相机对应到数个输出中。输出的对象为`Surface`，每个Surface需要定义好跟相机输出格式和尺寸相匹配的参数。`Surface`的来源很多样，可以是
  - SurfaceView
  - SurfaceTexture （这两个用于相机画面预览，可以用OpenGL ES处理）
  - MediaCodec
  - MediaRecorder
  - Allocation  （可以用RenderScript处理）
  - ImageReader （可以将图像存为JPG或者将RAW存为DNG）

应用通过`CaptureRequest`来启动拍摄，该类定义了拍摄所需的全部相机参数，也定义了要输出到哪个预定义好的Surface。

`Request`定义好了后，发送给对应的session，可以定义该`Request`的使用频数是一次`capture`还是多次`repeating`。`repeating`的请求优先级低于`capture`。

请求被处理后，device会返回一个`TotalCaptureResult`。该结果包括device拍摄时的状态参数，由于实际拍摄状态会根据实际情况有波动，这是可以通过对比状态参数和预设参数来判断和解决冲突。同时，device会向每个Surface发送一帧图像。注意这帧图像到达的时间与`TotalCaptureResult`不同步，往往要晚上许多。
