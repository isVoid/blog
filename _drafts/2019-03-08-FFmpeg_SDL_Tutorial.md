---
layout: post
title:  "FFMpeg SDL Tutorial (I)"
date:   2019-03-08 10:06:00 +0100
categories: FFMpeg
published: true
---

> 这部分来讲跟着dranger.com来做一个简单的FFMPEG应用的学习过程

FFMPEG是一个功能强大且被学界，业界广泛采用的音视频框架。其强大程度几乎涵盖当前所有主流编码（mpeg, h264, hevc, prores, dnxhd; jpg, png, ppm, exr...）及顶尖算法（x264, x265...）。当然，框架本身非常复杂，以至于几乎没有任何初学者可以轻松上手其CAPI。此外，FFMPEG的API在网上几乎没有好用的教程，而且官方只提供了一个doxygen的参考文档。

Martin Bohme和Fabrice Bellard提供了一个在1000行内完成的FFMPEG播放器，并配上了详尽的文字解说，感谢两位的贡献。

# 预备
首先需要编译FFMPEG并将其动态链接库放到你的开发目录下面，ffmpeg
