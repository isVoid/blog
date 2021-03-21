---
layout: post
title: PL:Higher-order functions and closures
date: '2021-01-02 15:19'
published: true
---

This is a series of notes taken from the
[Coursera course: "Programming Language"](https://www.coursera.org/learn/programming-languages)
by professor Dan Grossman.

In this note and next one, I will discuss higher-order functions and their applications.

One key feature that distincts functional programming is higher order functions. Higher
order function and closures are often two closely related topics that discusses together.
We start by looking at their uses in Python, then we'll take a quick look at
how they can be implemented in C.

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

def square(d):
    return d * d
apply(3, square)
```

In this somewhat naive example, we see that function as first class objects
made function more generic than before - that we can not only define routines
dependent on primitive types, but also dependent on function behaviors.
Frequent use cases are `map`, `reduce` and `filter` . Their behaviors are:

```python
"""
Note that recursion is highly discouraged in python. The code here is purely
for demonstration purposes. Use python's native `map`, `sum` and list comprehension
for real world applications.
"""
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
is called **Lexical scope** rules. Most modern programming languages follow
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

In languages that does not support higher order functions such as `C`, a closure
can be emulated with a struct of the reference to the function and the environment
where the function is created. For example:

```C++
#include "stdio.h"
/* A simplified environment structure, name value pairs */
struct Env
{
    char **names;
    void **values;

    Env* deep_copy(); /* Create a deep copy of the environment */
};

/* A closure consists of the function and the environment in which it was created */
struct Closure
{
    void* (*func)(void*, Env*);
    Env* env;
};

/* Function to create a var named `name` initialized with `values` inside `env` 
 * Return a new env
*/
Env* createVar(const char* name, void *values, Env *env) {
}

/* Retrieve the value of variable `name` from `env`
*/
void* getVar(char* name, Env *env) {
}

/* Demo function that requires to use some variable in the environment */
void* some_function(void* x, Env* my_env){
    void* some_val = getVar("X", my_env);
    /* Do something with some_val */
}

/* demo usage
 * A function is created under env1, and will be evaluated with env1.
 */
int main()
{
    Env *env1;
    env1 = createVar("X", some_val, env1);
    Closure closure{some_function, env1->deep_copy()} // Closure created with a copy of the environment and function

    /* Environment has changed, possibly variable X was shadowed*/

    /* Use some_function under env1 */
    void* res = closure.func(arg, closure.env);
}
```