---
layout: post
title: 4 Implementation Details of Tiger Type Checker
date: '2020-03-01 15:10 -0500'
published: true
version: 1.1
---

So I wrapped my Tiger type checker assignment. It's 973 lines of code as of first
submission. And it's not even styled in the most readable way. But anyway, I hope
only minor modification is needed to the code in the future.

Prof. Appel is certainly quite succinct when he discusses about the type checker,
albeit he does in general a good job of pointing a starting point of writing the code. I'd
like to add a few comments below after actually writing the code.

Oh, appendix A is awesome. Short but not missing detail. Make sure you have read
it many times before writing the code. When in doubt, refer to appendix A.

Here are the 4 details of writing the type checker. I believe the use of T.NAME
is not explained sufficiently in the textbook, so I added my comments below:

## Strucutre of Sement.sml
```
  - transty: translate a type declaration sentence into T.ty
  - tranexp: deal with expressions and var
    - g: deal with expressions
    - h: deal with var
  - transdec: add a block of declarations (var, func, type) into env/tenv
  - transdecs: deal with a list of block of declarations.
  - transprog: program entrance.
```

## T.NAME
T.NAME is created during type decalration in `transdec`. In a sequence of mutual recursive
declarations, types declared in an earlier line may not see types declared
later. So we do a preprocess and insert a placeholder for all the types
before hand. This placeholder is T.NAME.

T.NAME is made up of two parts: a symbol and a T.ty option ref. The symbol
is simply the name of the type. The latter refers to the actual type of this
binding.

During declaration, all type headers are added to the type environment with
T.NAME("type_name", ref NONE). In a second pass, the actual type of the bindings
are determined with `transty` and the bindings are set. In the thrid pass,
T.NAME are striped away with `actual_ty` and the binding is added to tenv.
Notice after `transdec`, there should be **NO** T.NAME entries in the tenv.

But T.NAME may still show up in RECORD/ARRAY entries in tenv. Example:
```Tiger
type a={x:b}
type b=array of a
```

The final tenv entries:
```text
a --> T.RECORD([T.NAME("b", ref b)], u1)
b --> T.ARRAY(T.NAME("a", ref a), u2)
```

T.NAME still exists! But that's fine, because:
1. the entries in tenv is not T.NAME.
2. we have the correct type name where that field/element type is bound to.

So, where we might run into accessing a field/element type?
1. `g(RecordExp)`/`g(ArrayExp)` <--- for actual record/array construction.
2. `h(FieldVar)` and `h(SubscriptVar)` <--- for retriving the type of field/array element.

When we run into NAME in these functions, simply look up the true type from tenv
with its name!

To conclude, these methods need to deal with NAME:
- `transdecs(tydecs)`: where T.NAME is born, set, and striped. :D
- `transty(RecordTy, ArrayTy)`: it is used in the middle of transdecs,
    so totally valid for T.NAME to show up. However it is OPTIONAL to deal
    with T.NAME here. Because the tenv symbol table is incomplete.
- `actual_ty`: recursively dive into the ref part when it sees a T.NAME until
    it cannot do so.
- `RecordExp/ArrayExp`: T.NAME will show up when looking at the field of a
    RECORD/ element type of an ARRAY. Simply look it up from tenv.
- `h(FieldVar/SubscriptVar)`: similar to above.

In the latter two types of methods, make sure the final return type is anything
but T.NAME so that it will never show up anywhere else and plague the code.

## Cycle declarations
Another use of T.NAME is to detect cycles. Assuming we have a cycle:
```Tiger
type a = b;
type b = a;
```

Before striping the T.NAME in the thrid pass of `transdec`, in tenv:
```text
a --> T.NAME(a, ref b)
b --> T.NAME(b, ref a)
```

`actual_ty` will recursively dive into the ref part and strips away the T.NAME
wrap. Notice it looks just like a graph traversal, each T.NAME is an edge. To
detect cycle, simply record all nodes in a visited array, and check if current node
is in that array.

## Assignment to loop control variables | Check whether break is in loop
So this is where we run into the limit of a hash table based symbol table and
functional way to maintain these tables. In every handling of the environment,
we only have access to the current symbol table. But to perform these checks, we
need to traverse upstream in the scopes.

We maintain a stack to do so, each stack entry has a scope name where this
scope belongs to, and a var list of what varaible is declared in this scope.
Those scope that may introduce variable masking, and is relavent to loops are
`FOR`,`WHILE`,`FUNCTION`,`LET`.

We maintain the integrity of the stack in a functional manner. So we need to
change the header of several methods to allow the stack as an argument.

Specifically:
- In `transexp`
  - `A.ForExp`, `A.WhileExp`, `A.LetExp` will push a new entry to the
    stack
  - `A.BreakExp` and `A.AssignExp` need to check the stack.
- In `transdec`
  - `Vardec` should add all declared var ids to the stack top var list.
  - `Funcdec` should also add func ids to stack top var list. For each fundec,
  need to push a new entry to the stack and all the function arguments to it.
  The function body is then evaluated with the new stack. The Funcdec itself
  should only return the stack containing the func ids.
  - These methods should return the augmented envstack.
  - Typedec is not affected since no venv ids are involved.
- In transdecs
  - When previous dec block returns the augmented stack, it should be
    passed to the next dec block.
- In transprog
  - Use `nil` as initial stack.

## Duplicate func/type dec
  For every block of declists, we preprocess them and only keep the FIRST
  appearence of the ID and ignore all other duplicate declarations.
