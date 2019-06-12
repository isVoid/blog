---
layout: post
title:  "Bash Environments"
date:   2019-03-08 12:25 +0100
categories: Ubuntu Bash
published: false
---

以前碰过很多次这个问题，这次一口气将这个问题记录下来。默认Ubuntu/bash组合下各种预设脚本的作用域。

|文件/命令|作用|域|
|---|---|---|
|export|把当前某个东西加到某个变量中|当前命令行会话|
|~/.pam_environment/|Bash预设变量|当前用户|
|~/.profile/|Bash预运行脚本|当前用户|
|/etc/environment|预设变量|所有用户|
|/etc/profile|预运行脚本|所有用户|



References:
[1] https://help.ubuntu.com/community/EnvironmentVariables
