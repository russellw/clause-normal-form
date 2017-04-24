Logic terms represented as clauses.

Specifically, terms are represented as arrays with extra properties. The array representation makes it easy to write recursive functions over terms. Even atoms are represented as zero-length arrays, minimizing special cases.

The `op` property indicates the operator, or kind of term. Operator names follow TPTP syntax where applicable. The following operators are currently defined:

|Category|Arity|Operator|Description|Special properties|
|---|---|---|---|---|
|Constant|0|`bool`|Boolean constant|`val`|
|||`distinct_obj`|Distinct object|`name`|
|||`integer`|Arbitrary-precision integer constant using the `big-integer` package|`val`|
|||`rational`|Arbitrary-precision rational constant using the `big-rational` package|`val`|
|||`real`|Arbitrary-precision rational constant using the `big-rational` package, typed as a real number|`val`|
|Atom||`fun`|Function or constant|[`name`]|
|||`variable`|Variable|[`name`]|
