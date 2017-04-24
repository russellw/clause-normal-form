Logic terms represented as clauses.

Specifically, terms are represented as arrays with extra properties. The array representation makes it easy to write recursive functions over terms. Even atoms are represented as zero-length arrays, minimizing special cases.

The `op` property indicates the operator, or kind of term. The following operators are currently defined:

|Category|Operator|Arity|Description|Special properties|
|---|---|---|---|---|
|Constant|0|`bool`|Boolean constant|`val`: `true` or `false`|
|||`distinct_obj`|Distinct object|`name`: a string|
|||`integer`|Arbitrary-precision integer constant|`val`: a `big-integer`|
|||`rational`|Arbitrary-precision rational constant|`val`: a `big-rational`|
|||`real`|Arbitrary-precision rational constant typed as a real number|`val`: a `big-rational`|
