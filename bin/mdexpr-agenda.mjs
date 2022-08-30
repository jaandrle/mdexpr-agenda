#!/usr/bin/env node
import { log } from "console";
import { cli, cli_mdexpr, mdexpr, useOptions } from "../src/mdexpr.js";
const use_param= "https://github.com/jaandrle/mdexpr-agenda";
const options_default= { states: "TODO,NEXT|DONE" };

cli_mdexpr
	.option("--grep", "output in the ‘grep’ format (`file:line:text`)")
	.action(function(files, options){
		const ast= mdexpr(files);
		options= Object.assign(options_default, useOptions(use_param, "./README.md", ast), options);
		const [ states_todo, states_done ]= options.states.split("|").map(v=> v.split(","));
		const data= ast[use_param].map(mdexprAgenda);
		if(options.grep)
			return data.map(({ line, file, state, deadline, name })=> `${file}:${line}:${state} <${deadline}> ${name}`).forEach(l=> log(l));
		log(data.filter(({ state })=> states_done.indexOf(state)===-1));
	});

cli
	.command("vim")
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

function mdexprAgenda({ args, context, line, file }){
	const record= { state: "", dates: [], deadline: "", labels: [], name: context, line, file };
	let next_break, target;
	const { length }= args;
	for(let i=0; i<length; i++){
		const ch= args[i];
		if(next_break && ch!==next_break){
			if(target==="state"||target==="deadline")
				record[target]+= ch;
			else
				record[target][record[target].length-1]+= ch;
			continue;
		}
		if(next_break){
			if(target==="deadline") i+= 2;
			next_break= "";
			continue;
		}
		if(i===0){
			next_break= " ";
			target= "state";
			record[target]= ch;
		} else if(ch==="*"){
			if(args[i+1]!=="*"){
				next_break= "*";
				target= "labels";
				record[target].push("");
			} else if(args[i+2]==="<") {
				next_break= ">";
				target= "deadline";
				i+= 2;
			}
		} else if(ch==="<"){
			next_break= ">";
			target= "dates";
			record[target].push("");
		}
	}
	record.dates.sort();
	record.labels.sort();
	return record;
}
