---
layout: post
title: PL:HoF and Closure Idioms
date: '2021-01-03 13:00'
published: true
---

This is a series of notes taken from the
[Coursera course: "Programming Language"](https://www.coursera.org/learn/programming-languages)
by professor Dan Grossman.

From our [last discussion]({% link _technology/2021-01-02-PLFirstClassObject.md %}) of higher order functions, functions can be evaluated, stored and passed as arguments just as other variables. Storing a function (closure) into a variable means something new to the code paths: it means we get to delay evaluation of some routines of your code until they are needed.

## Callbacks

Everytime the user clicks a mouse, a mouse click event happens and triggers some functions to execute
the corresponding behavior. Note that these functions are stored as **callbacks** and evaluated later.

A common implementation pattern is event listeners. Several callback functions are registered
as a listener of certain event. When some event happens, all registered functions all called.

```python
class EventListener:
    cbs = []
    def onEvent(self, f):
        self.cbs.append(f)
    def event(self, i):
        for f in self.cbs:
            f(i)

def make_counter(typ):
    cnt = 0
    def any_event_counter(_):
        nonlocal cnt
        cnt += 1
        print(f"Event happend {cnt} time(s)")
    def press_event_counter(i):
        nonlocal cnt
        if "Press!" in i:
            cnt += 1
            print(f"Event press happend {cnt} time(s)")
    return any_event_counter if typ == "any" else press_event_counter

def make_event_detect():
    def event_detector(i):
        print(f"Event {i[7:]}")
    return event_detector

el = EventListener()
el.onEvent(make_counter(typ="any"))
el.onEvent(make_counter(typ="press"))
el.onEvent(make_event_detect())

el.event("Click! Left")
el.event("Press! Button C")
el.event("Press! Button B")
```

We see following output:
```
Event happend 1 time(s)
Event Left
Event happend 2 time(s)
Event press happend 1 time(s)
Event Button C
Event happend 3 time(s)
Event press happend 2 time(s)
Event Button B
```

Here, we wrapped the callback functions under two factory functions - this is to create the proper
closure for the functions to be called. Specifically, `event_counter` has internal variable `cnt`
and will increment when event happens. When the factory method is run, a new `cnt` binding is created
for the method to be returned. And each hold to their own copy of `cnt`. As shown in the output,
`AnyEvent` happens 1 time more than `PressEvent`.

## Thunks

Thunks are function wrappers that delays their execution.

Starting from a dumb example, that we want to define our own `if` statement in python. Notice that
the syntax and semantics of `if` require the condition variable to be evaluated as `boolean`, and
the true/false statements to be first *evaluated*, and returned.

```python
# Mimics
# if cond:
#   texpr
# else:
#   fexpr

# Ignore the case where texpr not a callable
def myif (cond, texpr, fexpr):
    return texpr() if cond else fexpr()
```

Now we use `myif` in a Fibonnaci series calculation:

```python
def myfib(n):
    return myif(
        n == 1 or n == 2,
        lambda: 1,
        lambda: myfib(n-1) + myfib(n-2)
    )
```

Some interesting observation here: when `myfib` is invoked, the arguments are two higher order
functions, not just two expressions. This is because when `myif` is called, we don't know which
code path will be excuted yet, so we want to delay their execution until appropriate. The two
code paths are wrapped in a 0-argument, anonymous function, which is often called as 
[`thunk`](https://en.wikipedia.org/wiki/Thunk).

## Function Compositing

In functional programming, chaining several small functions into a big one is a common
pattern. In mathematics, we also do compositions like `h = g(f(x))` to denote for h being a function that first apply `f` then apply `g`. In python, this is rather similar.

```python
def compose(*funcs):
    import functools
    def _helper(g, f):
        return lambda x: g(f(x))
    return functools.reduce(_helper, funcs, lambda x:x)

def sqrt(x):
    return x*x

def minus3(x):
    return x - 3

def times4(x):
    return x*4

f = compose(sqrt, minus3, times4) # f(x) = (x*4-3)^2
```
We made use of thunks here. Inside compose, starting from an idendity function which
represents the function input `x`, and gets folded over the list of fucntions, each
time `x` is being wrapped in one extra layer.

## Currying and Partial Application

I would love to talk about currying here, but it would not really mean anything inside
a dynamically typed language like Python. On a high level, currying functions sees a function of several arguments as a function that accepts the first argument, and returns a function that takes in the second argument, and returns a function recursively until the last argument is consumed, and returns the return type.

Basically, a function that takes in a `int`, `string` and `float` and returns a `bool` is actually a function that takes in an `int`, returns a function that takes in a `string`, returns a function that takes in a `float` and returns a `bool`.
```
int -> string -> float -> bool
```

The reason why the second returned function `string->float->bool` has access to the first argument `int` is because of closure. When the function is defined, the closure rule makes sure its environment will stay with the function, and this includes the first `int` argument.

When multi-argument functions can be decomposed like this, partial application becomes
easily understadable. We choose to bind several arguments in the function, but not all
of them, to create a new function with fewer arguments. In python:

```python
import functools
def f(x, y, z):
    return (x + y) * z

g = functools.partial(2, 3) # g(z) = 5 * z
```

Finally, the naming of currying origins from Haskell Curry.

## Promises, delay/force

When we have some large computation to work on, but do not know if it is required to do so, we
usually wrap such operations inside a thunk. Combining it with memoization, we could create a
`promise` strcuture.

```python
def delay(f): return [False, None, f]

def force(f_promise):
    if not f_promise[0]:
        f_promise[0] = True
        f_promise[1] = f()
        return f_promise[1]
    else:
        return f_promise[1]
```

`delay` creates a promise, which is a mutable list where the first indicates whether the thunk
is used or not, the second saves the result and the third is the thunk that contains the large
computation. `force` check whether the thunk is evaluated. If not, set the execution flag to be
`True`, it would evaluate the thunk, memoize the evaluation result, then return the result.

## Stream

A stream is an infinitely long sequence of values. Computer memories are finite so it cannot
actually store infinite amount of values on the memory. To define a stream strcuture, we make
use of thunks to wrap a stream generator into the stream structure.

The following code constructs a stream object that produces all natural numbers:

```python
def make_nat_stream():
    def make_n_stream(n):
        return (n, lambda: make_n_stream(n+1))
    return make_n_stream(0)
```

Stream is defined as a tuple, where the first element is the value. THe second is a generator
that produces the next natural number. When `make_n_stream` is first invoked, a closure is
created for the second element of the tuple. The clsoure contains the binding for the argument
of the next recursive call to `make_n_stream`, which is `n+1`, the next natural number.

Example usage:

```python
s0 = make_nat_stream()  # (0, thunk)
s1 = s0[1]()            # (1, thunk)
s2 = s1[1]()            # (2, thunk)
...
```