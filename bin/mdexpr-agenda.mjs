#!/usr/bin/env node
import { log } from "console";
import { cli, cli_mdexpr, mdexpr, useOptions, Option } from "mdexpr";
import { outPrepare, logPeriod } from "../src/output.js";
import { dataPrepare, mdexprAgenda, filterStates, filterDates } from "../src/data.js";
const use_param= "https://github.com/jaandrle/mdexpr-agenda";
const options_default= { states: "TODO,NEXT|DONE" };

cli_mdexpr
	.option("--grep [format]", "output in the ‘grep’ format: option `H` prepend `file:`, `n` prepend `line:`. (default: \"Hn\")")
	.option("--f_states [filter_states]", "to filter specific states. Use name list separated by comma or 0/1 for todo/done agenda idems. (default: \"0\")")
	.option("--f_dates [filter_dates]", "to filter dates. Use exact dates list separated by comma or key word [p]ast/[f]uture/[t]oday/[T]ODO. (default: \"T\")")
	.addOption(new Option("--verbose [level]", "modify printing (technical) info.").choices([ "no", "debug" ]).default("no"))
	.action(function(files, options){
		try{
			const ast= mdexpr(files);
			const ast_agenda= ast[use_param] || [];
			options= Object.assign(options_default, useOptions(use_param, ast_agenda[0].file, ast), options);
			const [ now_date, now_time ]= (new Date()).toISOString().split("T");
			const data= dataPrepare(ast_agenda.map(mdexprAgenda).filter(filterStates(options))).filter(filterDates(now_date, options));
			
			const out= outPrepare(data, now_date, now_time);
			if(options.grep) return grep(data, out, options.grep);

			let s= " ", line_h= out[0];
			const state_ch= String(data.length).length+2;
			for(const line of out){
				const sl= line[state_ch];
				if(s!==sl){
					if(s===" "&&sl==="-") logPeriod("PAST", line_h, now_date);
					if(s==="-"||s===" "&&sl==="*") logPeriod("TODAY", line_h, now_date);
					if(sl==="+") logPeriod("FUTURE", line_h, now_date);
					s= sl;
				}
				log(line);
			}
			if(s==="-") logPeriod("TODAY", line_h, now_date);

		} catch(err){
			if(options.verbose==="debug") log(err.stack);
			else log(String(err));
			process.exit(1);
		}
	});

cli.command("vim")
	.summary("(temporal|todo) just help text for using in vim")
	.description("Just help text for using in VIM")
	.action(function(){
		log([
			"setlocal makeprg=mdexpr-agenda\\ --grep",
			"setlocal errorformat=%f:%l:%m",
			"… `.vim/compiler/markdown.vim` + CompilerSet"
		].join("\n"));
	});

cli.parse();

function grep(data, out, options){
	if(options===true) options= "Hn";
	data.map(function({ line, file }, i){
		let out_line= "";
		if(options.indexOf("H")!==-1) out_line+= file+":";
		if(options.indexOf("n")!==-1) out_line+= line+":";
		out_line+= out[i];
		return out_line;
	}).forEach(l=> log(l));
}
