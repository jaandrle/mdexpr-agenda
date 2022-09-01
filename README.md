**WIP – currently under investigation!**

# mdexpr-agenda
Use extended markdown syntax to simulate `org-agenda` from emacs.
For motivation and/or more information about `mdexpr` syntax visits
[jaandrle/mdexpr: Use extended markdown syntax inspired by Org mode from emacs.](https://github.com/jaandrle/mdexpr).

## Example
So from markdown document:
```markdown
…

## Task
{TODO <2022-08-29> *label* agenda}$

Some other text

…
```
…the `mdexpr-agenda` prints into terminal:
```terminal
Today:
- TODO Task *label*
```

## Roadmap v0.5.x
This is only rough estimate and **also syntax test**.

### Sytax
{DONE **<2022-09-01>** *phase1* agenda}$

### CLI
{NEXT **<2022-09-10>** *phase1* agenda}$

- [x] split `mdexpr` and `mdexpr-agenda` {DONE **<2022-09-01>** *phase1* agenda}$
- [x] print agenda items {DONE **<2022-09-01 12:00>** *phase1* agenda}$
- [ ] filter options
	- [x] dates, states
	- [ ] labels
- [x] configuration[^prepinani]
- [ ] recurring dates {NEXT <2022-09-05> **<2022-09-10>** *phase1* agenda}$

### VIM
{TODO <2022-09-24> *phase1* agenda}$

- [ ] simplify changing values[^prepinani]
- [ ] helpers for dates
- [ ] `gh`/`gd`
- [ ] another helpers

### ? Synchronization with calendars (google)
{TODO *phase2* agenda}$


[^prepinani]: For example TODO/NEXT/DONE

<details>
<summary>`{… cmd}$` explanation</summary>

This is [mdexpr](https://github.com/jaandrle/mdexpr) syntax. This document uses:
- {use [agenda](https://github.com/jaandrle/mdexpr-agenda) with states=TODO,NEXT|DONE mdexpr}$

</details>
