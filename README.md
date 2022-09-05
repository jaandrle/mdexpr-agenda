**WIP – currently under investigation!**

# mdexpr-agenda
Use extended markdown syntax to simulate `org-agenda` from emacs.
For motivation and/or more information about `mdexpr` syntax visits
[jaandrle/mdexpr: Use extended markdown syntax inspired by Org mode from emacs.](https://github.com/jaandrle/mdexpr).

## Example
This README.md dokument uses it! See section [Roadmap](#roadmap).
By calling `mdexpr-agenda README.md` on 2022-09-01 you see in terminal:
```terminal
—————                                           —————— FUTURE ————————————————————————————————— ——————
#1 +    NEXT    2022-09-05      2022-09-10      - [ ] recurring dates                           phase1
#2 +    NEXT    2022-09-05      2022-09-10      - [ ] remove limitation for first founded file  phase1
#3 +    NEXT    2022-09-10      2022-09-10      - [ ] recurring dates                           phase1
#4 +    NEXT    2022-09-10      2022-09-10      - [ ] remove limitation for first founded file  phase1
#5 +    NEXT    2022-09-10      2022-09-10      ### CLI                                         phase1
#6 +    TODO    2022-09-24      -               ### VIM                                         phase1
#7 +    TODO    tbd             -               ### ? Synchronization with calendars (google)   phase2
```

### Syntax explanation
To allow `{… agenda}$` you must use elsewhere in document (e. g. end of the file):
```markdown
<details>
<summary>`{… cmd}$` explanation</summary>

This is [mdexpr](https://github.com/jaandrle/mdexpr) syntax. This document uses:
- {use [agenda](https://github.com/jaandrle/mdexpr-agenda) with states=TODO,NEXT|DONE mdexpr}$

</details>
```
…for explanation visits [jaandrle/mdexpr](https://github.com/jaandrle/mdexpr#syntax-v05x-currently).
The `states` provide way to define open (todo) and “done” statuses with `todo|done`. It is possible
to define multiple open states for both types separated by commas.

`mdexpr-agenda` supports both inline and block syntax:
```markdown
## Agenda title (block)
{STATUS <datetime-reminder> **<datetime-deadline>** *label* agenda}$


- Agenda title (inline) {STATUS <datetime-reminder> **<datetime-deadline>** *label* agenda}$
```

- `STATUS`: this defines open/close status (see `states` above) and it can be used for filtering.
- `<datetime-reminder>`: this supports `%Y-%m-%d[ %H:%M][ r…]` syntax (`[…]` marks optional part)
	- `%Y-%m-%d` stands for date in the form *full\_year-month-day*  (month/day should be two digits: `01, 02, …, 10, …, 31`)
	- `%M:%M` stands for time *hour:minute* (again two digits)
	- `r…` stands for recurring date, in the form `rNM` (`N` positive number/intiger, `M` measurement such as `d`=day/`m`=month/`y`=day)
		- dates are limited by `%Y-%m-%d[ %H:%M]` to `**<datetime-deadline>**`
	- <datetime-reminder> can be used multiple times
- `**<datetime-deadline>**`: deadline in the form `%Y-%m-%d[ %H:%M]`, it is possible to use only one deadline
- `*label*`: this can be used to filtering (TBD), can be used multiple times
- for title in block syntax only one line is supported (filtered)

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
- [ ] remove limitation for first founded file {NEXT <2022-09-07> **<2022-09-10>** *phase1* agenda}$
- [ ] filter options
	- [x] dates, states
	- [ ] labels
- [x] configuration[^prepinani]
- [ ] recurring dates {NEXT <2022-09-07> **<2022-09-10>** *phase1* agenda}$

### VIM
{TODO <2022-09-24> *phase1* agenda}$

- [ ] simplify changing values[^prepinani]
- [ ] helpers for dates
- [ ] `gh`/`gd`
- [ ] another helpers

<details>
<summary>workaround</summary>

```vim
function! s:mdexpr_agenda(file) abort
	let c_file= a:file!='%' ? a:file : expand('%')
	let s_makeprg= &l:makeprg
	let s_errorformat= &l:errorformat
	let &l:makeprg= 'mdexpr-agenda '.c_file.' --grep'
	let &l:errorformat= '%f:%l:%m'
	silent lmake
	silent redraw!
	let &l:makeprg= s_makeprg
	let &l:errorformat= s_errorformat
	lopen
endfunction
command -nargs=* MDEXPRagenda if <q-args>!='' | call <sid>mdexpr_agenda(<f-args>) | elseif &filetype=='markdown' | call <sid>mdexpr_agenda('%') | else | call <sid>mdexpr_agenda('*.md') | endif
command MDEXPRclose lclose | lexpr []
" call scommands#map('m', 'MDEXPR', "n") "see https://github.com/jaandrle/vim-scommands
```

</details>


### ? Synchronization with calendars (google)
{TODO *phase2* agenda}$


[^prepinani]: For example TODO/NEXT/DONE
[^node]: Alternatively `curl -sL install-node.vercel.app/17.0.1 | bash`

<details>
<summary>`{… cmd}$` explanation</summary>

This is [mdexpr](https://github.com/jaandrle/mdexpr) syntax. This document uses:
- {use [agenda](https://github.com/jaandrle/mdexpr-agenda) with states=TODO,NEXT|DONE mdexpr}$

</details>
