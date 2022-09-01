**WIP – currently under investigation!**

# mdexpr-agenda
Use extended markdown syntax to simulate `org-agenda` from emacs.
For motivation and/or more information about `mdexpr` syntax visits
[jaandrle/mdexpr: Use extended markdown syntax inspired by Org mode from emacs.](https://github.com/jaandrle/mdexpr).

## Example
This README.md dokument uses it! See section [Roadmap](#roadmap).
By calling `mdexpr-agenda README.md` on 2022-09-01 you see in terminal:
```terminal
—————                                           —————— FUTURE ———————————————————————————————   ——————
#1 +    NEXT    2022-09-05      2022-09-10      - [ ] recurring dates                           phase1
#2 +    NEXT    2022-09-10      2022-09-10      - [ ] recurring dates                           phase1
#3 +    NEXT    2022-09-10      2022-09-10      ### CLI                                         phase1
#4 +    TODO    2022-09-24      -               ### VIM                                         phase1
#5 +    TODO    tbd             -               ### ? Synchronization with calendars (google)   phase2
```

## Instalation
**For now experiment!!!**

1. you need nodejs >=v17.0.1 ⇒ folows [nvm-sh/nvm: Node Version Manager](https://github.com/nvm-sh/nvm)[^node]
1. `npm install https://github.com/jaandrle/mdexpr-agenda --global`

## Roadmap v0.5.x
This is only rough estimate and **also syntax test**.

### Sytax
{DONE **<2022-09-01>** *phase1* agenda}$

### CLI
{NEXT **<2022-09-10>** *phase1* agenda}$

- [x] split `mdexpr` and `mdexpr-agenda` {DONE **<2022-09-01>** *phase1* agenda}$
- [x] print agenda items {DONE **<2022-09-01 12:00>** *phase1* agenda}$
- [ ] remove limitation for first founded file {NEXT <2022-09-05> **<2022-09-10>** *phase1* agenda}$
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
[^node]: Alternatively `curl -sL install-node.vercel.app/17.0.1 | bash`

<details>
<summary>`{… cmd}$` explanation</summary>

This is [mdexpr](https://github.com/jaandrle/mdexpr) syntax. This document uses:
- {use [agenda](https://github.com/jaandrle/mdexpr-agenda) with states=TODO,NEXT|DONE mdexpr}$

</details>
