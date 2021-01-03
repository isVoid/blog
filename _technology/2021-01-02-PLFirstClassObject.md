---
layout: post
title: Programming Language:Higher-order functions and closures
date: '2021-01-02 15:19'
published: true
---

This is a series of notes taken from the Coursera course: "Programming Language"
by professor Dan Grossman. I plan to chain these notes up with the catchy terms
that I learnt from the course.

In programming language, higher-order functions and closures are often two
closely related concepts that needs to be discussed together.

## Funcion as first class objects

In Python, functions are `first class objects`, in other words, they are
expressions that can be evaluated, stored and passed as function arguments,
just like other primitive types such as `int`, `float` etc. When we start
passing a function to another function as an argument, we call the argument
as higher-order function.

```python
def apply(x, f):
    return f(x)

def concat_myname(s):
    return s + 'Michael'
apply('Hello', concat_myname)

def double(d):
    return d * d
apply(3, double)
```

In this somewhat naive example, we see that function as first class objects
made function more generic than before - that we can not only define routines
dependent on primitive types, but also dependent on function behaviors.
Frequent use cases are `map`, `reduce` and `filter` . Their behaviors are:

```python
def mymap(l, f):
    if len(l) == 0:
        return []
    else:
        return [f(l[0])] + mymap(l[1:], f)

def myreduce(l, f, acc):
    if len(l) == 0:
        return acc
    else:
        return myreduce(l[1:], f, f(acc, l[0]))

def myfilter(l, f):
    if len(l) == 0:
        return []
    else:
        return ([l[0]] if f(l[0]) else []) + myfilter(l[1:], f)
```

Using these functions can be greately simplified with `lambda` keyword, which
creates an anonymous function upon evaluation.

```python
l = [1, 2, 3, 4]
mymap(l, lambda x: x*2)             # doubles list
myreduce(l, lambda a,b: a + b, 0)   # summing list
myfilter(l, lambda x: x % 2 == 0)   # drop non-even numbers
```

## Lexical scope and closure

With higher order functions, behaviors can be passed around like variables.
However, as they gets passed around, the environment where the function
expresion is evaluated also changes. Take at look at the example below:

```python
class Dog:
    def __init__(self, name):
        self.name = name
    
    def bark(self):
        print(f'Bark! My name is {self.name}')

a_dog = Dog('Charlie')

# Say we want to adopt the Charlie dog
def adopt_charlie():
    a_dog.bark()

# However, the pet center has other dogs.
# Specifically, variable `a_dog` is shadowed
# by another dog named 'Milo'
def in_pet_care_center(my_action):    
    a_dog = Dog('Milo')
    b_dog = Dog('Oscar')
    
    # When we execute our action, which dog will we adopt?
    my_action()

# Bark! My name is Charlie
in_pet_care_center(adopt_charlie)
```

Yay! We still have Charlie! But let us look closer what happened there. Upon
defining `adopt_charlie`, `a_dog` is bound to "Charlie". Inside care center,
`a_dog` is shadowed by another `Dog` instance. When `my_action` is evaluated,
the *current* environment of evaluation has `a_dog` bound to "Milo". However,
the actual evaluation of `my_action` used the environment at which the function
is defined. Evaluating a funtion under the environment where it is *defined*,
is called **Lexical scope** rules. Most modern programming languages follows
this rule.

It has many benefits, one of them is that one can easily understands the 
behavior of a function, only required to read the function body and all the
codes *before* it, without having to worry about where it is called.

As an implementation detail of lexical scope, when one defines a function,
the compiler/interpreter will need to save not only the function body, but
all (free) variable bindings used by the function. Putting the function body
and the bindings together creates a closure. Thus, when we defines a function
inside our code, we are actually adding a new binding of the function name
to its closure into the environment.

In languages that does not support higher order functions such as `C`, we could
simulate the behavior with function pointers, except, we need to also pass the
bindings as an extra argument. For example:

```C
#include "stdio.h"
/* A simplified environment structure */
struct Env
{
    char **names;
    int **values;
};

/* Same apply as above */
void apply(void* x, void (*f)(void*, struct Env*), struct Env* f_env)
{
    f(x, f_env);
}

/* Can retrieve free variables from my_env here */
void power_of_2(void *x, struct Env* my_env)
{
    int *i_x = (int*)x;
    *i_x = (*i_x) * (*i_x);
}

int main()
{
    struct Env some_env; // Empty env upon definition
    int n = 4;
    apply((void*)&n, power_of_2, &some_env);
    printf("%d\n", n); // 16
    return 0;
}

```