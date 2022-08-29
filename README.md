# mdexpr-agenda
Use extended markdown syntax to simulate `org-agenda` from emacs.

## Motivation
There is [Org mode for Emacs](https://orgmode.org/) and specially [Org-Agenda](http://www.cachestocaches.com/2016/9/my-workflow-org-agenda/).
But it can be useful to bring some features (e.g. agenda) into markdown documents.
This is because, for example, `README.md` documents are already used on GitHub.

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

## Syntax rules
The idea is that the markdown document should be readable primarily by people, therefore:

1. Syntax should be as minimal as possible and use already existing markdown syntax
1. Technical texts should by on the end of line/document

## Roadmap
This is only rough estimate and **also syntax test**.

### Syntax
{NEXT **<2022-08-31>** *phase1* agenda}$

- [ ] mdexpr syntax
	- [ ] import another file
	- [ ] `{… somethig}$` recognition
- [ ] agenda syntax
	- [ ] line + following line wrapped by `{… agenda}$` (agenda line, **AL** for short)
	- [ ] dates (times) are wrapped inside **AL** by `<>` and it is possible to define more than one (use as reminders)
		- [ ] there can by only one bold, representing *deadline*
		- [ ] format `%Y-%m-%d[ %H:%M]` (basic), or `%Y-%m-%d[ %H:%M] rNj` (`N` integer, `j` y/m/d repeating)
	- [x] italic texts are labels
	- [x] line before **AL** is the name of agenda item

## CLI
{TODO <2022-09-10> *phase1* agenda}$

- [ ] print agenda items
- [ ] filter options
- [ ] configuration[^prepinani]

## VIM
{TODO <2022-09-24> *phase1* agenda}$

- [ ] changing[^prepinani]
- [ ] helpers for dates
- [ ] `gh`/`gd`
- [ ] another helpers

## Synchronization with calendars (google)
{TODO *faze2* agenda}$


[^prepinani]: For example TODO/NEXT/DONE

<details><summary>mdexpr</summary>
Syntax: include another document, include “plugin” and settings.

- {require [test](./test.md) mdexpr}$
- {use [agenda](plugin url) with states=TODO,NEXT|DONE mdexpr}$
</details>
