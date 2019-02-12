---
layout: post
title:  "KVO With Swift"
date:   2019-02-05 16:10:44 +0400
categories: IOS
published: true
---

>观察者模式是重要的代码设计模式，极大地推进了逻辑分离。早在objc时代苹果公司已经通过Key-Value Observing加以实现，swift中Apple进一步将代码简化，变得非常易用。本文借用[官方文档](https://developer.apple.com/documentation/swift/cocoa_design_patterns/using_key-value_observing_in_swift)中的代码进行分析。

本文使用到的来自Apple的代码，文本以及图片，版权属于Apple.

# Key-Value Observing with Swift

KVO方法中一定有（一个或多个）观察者和主体。当被观察的属性被改变时，主体会遍历所有正在观察的观察者并让观察者作出反应。
假设有个电热水壶Boiler，内置一个温度监控装置。它会随时监控Boiler中的温度，当温度超过100度时报警并切断电源。

```swift
class Boiler: NSObject {

    @objc dynamic var temperature = NSInteger(0)
    var power = true

    func boil() {
        if (power) {
            temperature += 1
        }
    }    
}
```
Boiler中初始水温是0，通电。通电情况下，每调用一次boil()温度上升1。

```swift
class TempMonitor: NSObject {
    @objc var boilerMonitored: Boiler

    var tempObservation: NSKeyValueObservation?

    init(_ boiler: Boiler) {
        boilerMonitored = boiler
        super.init()

        tempObservation = observe(\.boilerMonitored.temperature,
                              options: [.old, .new]
        ) {
            alrm, tChange in
            if (tChange.newValue! % 10 == 0) {
                print ("Current temperature is \(tChange.newValue!)")
            }
            if (tChange.newValue! == 100) {
                print ("Warning! Boiler temperature reached 100 degree. Power is cut.")
                self.boilerMonitored.power = false;
            }
        }
    }
}
```
使用KVO的关键方法是`observe<Value>(_ keyPath: KeyPath<TempMonitor, Value>, options: NSKeyValueObservingOptions = default, changeHandler: @escaping (TempMonitor, NSKeyValueObservedChange<Value>) -> Void) -> NSKeyValueObservation`
- 第一个参数是需要被观察的值，用Keypath格式传入
- 第二个参数是回调时传入的值，default是[.oldValue, .newValue]，这里留空的话前面两个值都变成nil
- 最后一个是回调函数体，这里定期打印温度，并在满100度时切断电源。

测试函数
```swift
let blr = Boiler()
let tmtr = TempMonitor(blr)

// Enough time to boil
for _ in 1...300 {
    usleep(10000) //100ms
    blr.boil()
}
```
这里给予充分的时间去煮水，最后的结果是：
[KVODemo](/_posts/assets/avcam/KVO1.png)
尽管加热时间远超煮开时间，到达100度后观察者已经切断电源，温度不再升高。

另外像这种观察者数量很少的情况下，自我观察也是可以的。
```swift
class Boiler: NSObject {

    @objc dynamic var temperature = NSInteger(0)
    var power = true

    var tempObservation: NSKeyValueObservation?

    override init() {
        super.init()

        tempObservation = observe(\.temperature,
                                  options: [.old, .new]) {
                                    blr, tChange in

                                    if (tChange.newValue! % 10 == 0) {
                                        print ("Current temperature is \(tChange.newValue!)")
                                    }
                                    if (tChange.newValue! == 100) {
                                        print ("Warning! Boiler temperature reached 100 degree. Power is cut.")
                                        blr.power = false;
                                    }
        }
    }

    func boil() {
        if (power) {
            temperature += 1
        }
    }

}
```
这样不需要另外定义观察者，KeyPath里面传入的是一个省略写法，`\.temperature`等同于`\Boiler.temperature`。

More on KeyPath in Swift 4: [Lundberg](https://www.klundberg.com/blog/swift-4-keypaths-and-you/)
