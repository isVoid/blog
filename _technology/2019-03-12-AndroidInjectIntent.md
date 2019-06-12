---
layout: post
title:  "Android Inject Events"
date:   2019-03-12 08:30:00 +0100
categories: Android
published: true
---

出于安全考虑，安卓禁止开发者进行事件注入。仅有系统级权限的应用才可以进行事件注入。

获得系统级权限的方法有两个：
1. root手机
2. 对应用进行签名

## root手机
>Disclaimer: root会给手机带来极大风险，请责任自负。

Root之后可以给应用执行SU命令，可以实现一些按钮，屏幕滑动等事件的注入。但是想要完全绕开
INJECT_EVENT权限的限制还是需要进行签名。

由于安卓生态的复杂性，root手机的方法多样。最常用的方法是twrp+Magisk方法。

工具准备：
- Android SDK Platform Tools (https://developer.android.com/studio/releases/platform-tools)
- TWRP (https://twrp.me/)
- Magisk (https://forum.xda-developers.com/apps/magisk/official-magisk-v7-universal-systemless-t3473445)

首先确定自己的手机是否支持root，这一点包括确定：
- TWRP/devices列表是否包括这款手机
- Magisk是否支持该操作系统（仔细阅读Magisk的论坛帖）
- 手机是否有OEM锁，且是否可以解锁
- 设备厂商是否对root有其他限制，例如保修条款等

如果有不确定的地方，仍可以进行root操作，不过设备有可能被损坏。请确定厂商是否有提供factory image
以供恢复之需。例如我用的平台是Pixel 3 XL (crosshatch)，谷歌提供了factory image:https://developers.google.com/android/images

root教程：https://www.xda-developers.com/google-pixel-3-unlock-bootloader-root-magisk/

root之后，将应用移到/system/app文件夹下。然后通过adb shell进行权限修改：
(https://android.stackexchange.com/questions/180347/installing-apk-as-system-app-directly-with-root)
```shell
adb shell
su
mount -o rw,remount /system
chmod 755 /system/app/my-app
chmod -R 644 /system/app/my-app
ls -l /system/app/my-app
ls -l /system/app | grep "my-app"
reboot
```
重启之后应用会自动安装为系统应用，之后仿照[这位老哥](https://github.com/jpunz/AndroidEventInjector/blob/master/Injector.java)
的做法给系统注入用户输入。安卓KeyEvent看[官方文档](https://developer.android.com/reference/android/view/KeyEvent)。

另外在Android Studio开发时怎么自动部署到/system/app目录，看这里：
https://stackoverflow.com/questions/28302833/how-to-install-an-app-in-system-app-while-developing-from-android-studio
迟点我会上传一个自己修改过的版本到gist

## 对应用进行签名
>这部分没有做过，仅说下我的理解

用系统秘钥进行签名后的应用拥有系统级权限，可以绕过所有INJECT_EVENT限制。一般来说，可公开下载
的系统镜像的秘钥不会公开。例如安卓官方镜像的秘钥是找不到的，否则其系统将暴露在极大的安全风险之
中。可能通过内部渠道获得。

另一个方法是从源代码编译自己的安卓系统，因为是自己的操作系统所以不会有安全方面的顾虑。Build的方法
在这里：https://source.android.com/setup/build/requirements

https://android.googlesource.com/platform/build/ 这里有目前最近的安卓源代码，平台秘钥在
`target/product/security/platform.x509.pem`（证书）和`target/product/security/platform.pk8`（私钥）
里面。

签名方法：https://stackoverflow.com/questions/3635101/how-to-sign-android-app-with-system-signature
