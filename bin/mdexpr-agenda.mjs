#!/usr/bin/env node
import { log } from "console";
import { cli, cli_mdexpr, mdexpr, useOptions } from "../src/mdexpr.js";
const use_param= "https://github.com/jaandrle/mdexpr-agenda";
const options_default= { states: "TODO,NEXT|DONE" };

cli_mdexpr
	.option("--grep [format]", "[Hn] Output in the ‘grep’ format: option `H` prepend `file:`, `n` prepend `line:`.")
	.option("--f_states [filter_states]", "[0] To filter specific states. Use name list separated by comma or 0/1 for todo/done agenda idems.")
	.option("--f_dates [filter_dates]", "[ft] To filter dates. Use exact dates list separated by comma or key words [p]ast/[f]uture/[t]oday.")
	.action(function(files, options){
		const ast= mdexpr(files);
		options= Object.assign(options_default, useOptions(use_param, "./README.md", ast), options);
		const [ now_date, now_rest ]= (new Date()).toISOString().split("T");
		const data= dataPrepare(now_date, ast[use_param].map(mdexprAgenda).filter(filterStates(options))).filter(filterDates(now_date, options));
		
		const out= outPrepare(data);
		if(options.grep) return grep(data, out, options.grep);

		log(`Today ${now_date}`);
		out.forEach(l=> log(l));
	});

function outPrepare(data){
	const out_max= [];
	const out_arr= [];
	let i= 0, o;
	for(const { name, labels, state, date_next, deadline } of data){
		o= []; out_arr.push(o); i= 0;
		sideAppend(state);
		sideAppend(date_next);
		sideAppend(deadline ? deadline : "-");
		sideAppend(name);
		sideAppend(labels.join(","));
	}
	const t= "\t";
	const out= [];
	for(const out_line of out_arr){
		out.push(t+out_line.map((v, i)=> v.padEnd(out_max[i], " ")).join(t));
	}
	return out;
	
	function sideAppend(val){
		o[i]= val;
		const { length }= val;
		if(!out_max[i]||length>out_max[i]) out_max[i]= length;
		i+= 1;
	}
}
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

function dataPrepare(now_date, data){
	return data.map(function(row){
		const dates= [ ...row.dates, row.deadline ]
			.sort();
		row.date_next= dates
			.find(date_test=> date_test>=now_date) || dates[dates.length-1] || "tbd";
		return row;
	})
	.sort(function({ date_next: dn_a }, { date_next: dn_b }){
		if(dn_a===dn_b) return 0;
		return dn_a>dn_b ? 1 : -1;
	});
}
function filterDates(now_date, { f_dates }){
	if(typeof f_dates==="undefined") f_dates= "ft";
	if(f_dates==="ft") return ({ date_next })=> now_date<=date_next;
	if(f_dates==="f") return ({ date_next })=> now_date<date_next;
	if(f_dates==="p") return ({ date_next })=> now_date>date_next;
	
	f_dates= f_dates.split(",");
	return function filterDatesNth({ date_next }){
		return f_dates.indexOf(date_next)!==-1;
	};
}
function filterStates({ states, f_states }){
	if(typeof f_states==="undefined") f_states= 0;
	if(!isNaN(Number(f_states))) f_states= states.split("|")[f_states];
	f_states= f_states.split(",");
	return function filterStatesNth({ state }){
		return f_states.indexOf(state)!==-1;
	};
}
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
