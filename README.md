Logic terms represented as clauses.

Specifically, terms are represented as arrays with extra properties. The array representation makes it easy to write recursive functions over terms. Even atoms are represented as zero-length arrays, minimizing special cases.

The `op` property indicates the operator, or kind of term. The following operators are currently defined:

|Category|Operator|Arity|Description|Special properties|
|---|---|---|---|---|
|Constant|0|`bool`|Boolean constant|`val`|
