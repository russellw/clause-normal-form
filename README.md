Logic terms represented as clauses.

Specifically, terms are represented as arrays with extra properties. The array representation makes it easy to write recursive functions over terms. Even atoms are represented as zero-length arrays, minimizing special cases.

### Operators

The `op` property indicates the operator, or kind of term. Operator names follow TPTP syntax where applicable. The following operators are currently defined:

Category|Arity|Operator|Description|Properties
---|---|---|---|---
|Constant|0|`bool`|Boolean constant|`val`|
|||`distinct_obj`|Distinct object|`name`|
|||`integer`|Arbitrary-precision integer constant using the `big-integer` package|`val`|
|||`rational`|Arbitrary-precision rational constant using the `big-rational` package|`val`|
|||`real`|Arbitrary-precision rational constant using the `big-rational` package, typed as a real number|`val`|
|Atom||`fun`|Function or constant|`name` (optional)|
|||`variable`|Variable|`name` (optional)|
|Quantifier|1|`!`|For all: binds an array of variables over a term|`variables`|
|||`?`|There exists: binds an array of variables over a term|`variables`|
|Derived logic operator|2|`=>`|Implies||
|||`<=>`|Eqv||
|||`<~>`|Xor||
|||`~&`|Nand||
|||`~&vert;`|Nor||
|Fundamental logic operator|N|`&`|And||
|||`&vert;`|Or||
||1|`~`|Not||
|Equality|2|`=`|Equal||
|||`!=`|Not equal||
|Comparison||`<`|Less than||
|||`<=`|Less than or equal||
|||`>`|Greater than||
|||`>=`|Greater than or equal||
|General|N|`call`|Call a function|`f`|

### Factory functions

Terms are created with factory functions:

```
bool(val)
```

Boolean constant.

```
distinct_obj(name)
```

Distinct object. Two distinct objects are equal if and only if they have the same name.

```
integer(val)
```

Arbitrary-precision integer constant. `val` may be a `big-integer` object, or a string or number convertible to one.

```
rational(val)
```

Arbitrary-precision rational constant. `val` may be a `big-rational` object, or a string or number convertible to one.

```
real(val)
```

Arbitrary-precision rational constant typed as a real number. `val` may be a `big-rational` object, or a string or number convertible to one.

```
fun([name])
```

Function or constant. Name is optional, mostly used for debugging.

```
variable([name])
```

Variable. Name is optional, mostly used for debugging.

```
call(f, args)
```

Call (application) of a function with an array of arguments.

```
quant(op, variables, arg)
```

Quantifier: bind an array of variables over a term.

```
term(op, ...args)
```

Other term; anything that requires operator and arguments but no other properties.

### Other functions

In general, a function may indicate true or false by returning any truthy or falsy value respectively.

```
convert(a)
```

Convert a term to clause normal form.

```
eq(a, b)
```

Test two terms for equality.

```
evaluate(a, m)
```

Evaluate a term, looking up substitutions in the `Map` m.

```
occurs(a, b, m)
```

Check whether term a occurs in term b, looking up substitutions in the `Map` m.

```
unify(a, b, m=new Map())
```

Unify two terms, returning a map of substitutions, or false if the terms could not be unified.
