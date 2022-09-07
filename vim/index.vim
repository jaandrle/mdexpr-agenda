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
command -nargs=* MDEXPRagenda
	\  if <q-args>!=''
	\|	call <sid>mdexpr_agenda(<f-args>)
	\| elseif &filetype=='markdown'
	\|	call <sid>mdexpr_agenda('%')
	\| else
	\|	call <sid>mdexpr_agenda('*.md')
	\| endif

command -nargs=0 MDEXPRtodoToggle
	\  let b:mdexpr_todo= matchlist(getline('.'), '\v^( *- \[)([ x])(\] .*)')
	\| if b:mdexpr_todo->len()
	\|	call setline('.', b:mdexpr_todo[1].(b:mdexpr_todo[2]=='x'?' ':'x').b:mdexpr_todo[3])
	\| endif
	\| unlet b:mdexpr_todo
cabbrev MDEXPRtt MDEXPRtodoToggle

function! s:mdexpr_agenda_states() abort
	try
		let states= json_decode(system('mdexpr-agenda get '.expand('%').' options --json'))['states']->split('|')
		let i= 1
		let o= ""
		let s= []
		for state in states[0]->split(',')
			let o.= (i>1?', ':'').i->string().':'.state
			let i+= 1
			let s+= [ state ]
		endfor
		let o.=" | "
		for state in states[1]->split(',')
			let o.= (o=~' | $'?'':', ').i->string().':'.state
			let i+= 1
			let s+= [ state ]
		endfor
		echo o."\n"
		let choosed= str2nr(nr2char(getchar()))
		if !choosed
			echo 'Status changing skipped'
			return 0
		endif
			execute 'normal ciw'.s[choosed-1].''
	catch
		echo 'No states'
	endtry
endfunction
command -nargs=0 MDEXPRagendaStates call <sid>mdexpr_agenda_states()
cabbrev MDEXPRas MDEXPRagendaStates

command -nargs=0 MDEXPRagendaNow
	\  silent execute "normal a<c-r>=strftime('%Y-%d-%m %H:%M')<cr>"
command -nargs=0 MDEXPRagendaNew
	\  silent execute "normal a{TODO <<c-r>=strftime('%Y-%d-%m %H:%M')<cr>> **<<c-r>=strftime('%Y-%d-%m %H:%M')<cr>>** *label* agenda}$<esc>F{l"
	\| call <sid>mdexpr_agenda_states()
	\| execute 'normal /\(<\| \*\w\)\zs<cr>'
cabbrev MDEXPRan MDEXPRagendaNew
