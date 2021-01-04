---
layout: post
title: PL:Delayed evaluation and thunks
date: '2021-01-03 13:00'
published: true
---

This is a series of notes taken from the
[Coursera course: "Programming Language"](https://www.coursera.org/learn/programming-languages)
by professor Dan Grossman. I plan to chain these notes up with the catchy terms
that I learnt from the course.

From our [last discussion]({% link _technology/2021-01-02-PLFirstClassObject.md %}) of higher order functions, functions can be evaluated, stored and passed as arguments just as other variables. Storing
a function (closure) into a variable means something new to the code paths: it means we get to delay evaluation of some routines of your code until they are needed.

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

Next, a few common programming idioms related to `thunk` and delayed execution is introduced.

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