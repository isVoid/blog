---
layout: post
title:  "Camera2Basic 例程（II）"
date:   2019-02-25 17:00:00 +0100
categories: Android
published: true
---

# 初始化设置流程

首先从CameraActivity开始，`onCreate()`方法设置了`activity_camera`作为view，如果初始化状态为null，新建`Camera2BasicFragment`实例。

`Camera2BasicFragment`继承`Fragment`，用来显示预览。处理相机服务相关的大部分方法也都定义在这里面。UI生命周期行为：

|生命周期|行为|
|--|--|
|`onCreateView()`|用`fragment_camera2_basic`layout去初始化view|
|`onViewCreated()`|为两个Button设置`onClickListener`，记录texture的handle，注意这里的texture是一个自定义的`AutoFitTextureView`|
|`onActivityCreated()`|创建File对象，用来保存图像|
|`onResume()`|启动后台线程，如果`mTextureView`存在，`openCamera()`，否则setListener()，在`onSurfaceTextureAvailable()`中open。
|`onPause()`|关闭相机，停止线程|

`openCamera()`过程：
1. 获取相机权限
2. 设置相机的输出参数`setupCameraOutput()`
3. 设置图像的变换矩阵`configureTransform()`
4. 尝试获取lock，这是一个信号量，在`onPause()`里面会释放，为了保证应用退出前相机能正常关闭。
5. 调用`CameraManager.openCamera()`开启相机

`setupCameraOutput()`过程：
1. 通过`CameraManager.getCameraIdList()`遍历所有可用的相机列表。
2. 取后置摄像头
3. 获取`StreamConfigurationMap`，这里存储跟stream(input->output)相关的信息。比如：最大帧率，输入输出编码格式，尺寸等等。
4. 通过`map.getOutputSizes()`获取最大的可用尺寸
5. 通过`Activity::...::getRotation()`设置JPEG文件的旋转
6. 根据`maxPreviewWidth`/`maxPreviewHeight`和`swappedDimensions`设置预览大小
7. 通过`chooseOptimalSize()`获取**最适合**的预览尺寸。何为最适？
    1. 在所有可用的尺寸列表中，找到一组尺寸至少比`textureView`大，且宽长比`maxWidth`，`maxHeight`小的尺寸。注意这里`maxW/H`的参数出于性能考虑，如果过大会爆camera总线。
    2. 在(1)找到的这组列表中，用其中最小的一个且长宽比与textureView一样的尺寸。
    3. 如果步骤(1)(2)找不到合适的尺寸，将限制放松。寻找比`maxW/H`小的尺寸且符合长宽比的尺寸。
    4. 最后fail safe: 如果(3)都找不到，返回第一个可用的尺寸且记录错误信息。
8. 设置`textureView`
9. 检查自动闪光并开启

`configureTransform()`过程：

这个方法用来设置将相机输出转换成为`textureView`尺寸时所用到的变换矩阵。因此**预览尺寸**要先确定下来，其次`textureView`的大小也要确定下来。
> 预览尺寸在`setupCameraOutput()`中确定，因此`configureTransform()`要在setupCameraOutput()之后调用

根据屏幕旋转方向的不同，变换矩阵也有不同，具体的：
1. 0旋转时，采用单位变换阵。
2. 90/270（左右Landscape）旋转时，将bufferRect坐标移到中心，根据和预览尺寸的大小比例缩放，并旋转到对应位置。
3. 180度（下Portrait）旋转时，直接旋转180度。
