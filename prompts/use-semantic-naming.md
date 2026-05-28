# Убирай однобуквенный нейминг
В функциях, конструкциях `.map`, `.filter`, `.find`, `.reduce` и т.п. исправь однобуквенные наименования на семантические.

```
// плохо
const p = selectedPerson.value;

// хорошо
const person = selectedPerson.value;
```

# Убирай items
При работе с массивами (`.map`, `.filter`, `.find`, `.reduce`) используй осмысленные обозначения вместо конвенционального `items`.

```
// плохо
persons.find((item) => item.id === row.id)

// хорошо
persons.find((person) => person.id === row.id)
```

# Оставляй acc
При работе с методом `.reduce` всегда используй конвенциональный `acc` для обозначения аккумулятора.