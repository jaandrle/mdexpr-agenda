#!/usr/bin/env node
import { log } from "console";
import { cli, cli_mdexpr, mdexpr, useOptions, Option } from "mdexpr";
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
		function logPeriod(title, line, now_date){
			const { round, max }= Math;
			const cols= line.split("\t");
			for(let c of Object.keys(cols)){
				let col= " ";
				if(c==4){
					const bars= "—".repeat(max(round(cols[c].length / 8), 1));
					const c_title= bars+" "+title+" ";
					col= c_title+"—".repeat(cols[c].length-c_title.length);
				} else if(c==2&&title==="TODAY"){
					col= now_date;
				}
				cols[c]= col.padEnd(cols[c].length, " ");
			}
			[ 0, cols.length-1].forEach(c=> cols[c]= cols[c].replace(/ /g, "—"));
			log(cols.join("\t"));
		}
	});

function outPrepare(data, now_date, now_time){
	const out_max= [];
	const out_arr= [];
	let i= 0, o;
	let id= 1, id_length= String(data.length).length+1;
	for(const { name, labels, state, date_next, deadline } of data){
		o= []; out_arr.push(o); i= 0;
		let exlamation= ` + `.split("");
		if(date_next.split("T")[0]===now_date) exlamation[1]= "*";
		else if(date_next<now_date) exlamation[1]= "-";
		if(deadline && deadline<now_date+"T"+now_time) exlamation[2]= "!";
		sideAppend(`#${id++}`.padEnd(id_length)+exlamation.join(""));
		sideAppend(state);
		sideAppend(date_next.split("T").join(" "));
		sideAppend(deadline ? deadline : "-");
		sideAppend(name[0].replace(/\t/g, "» "));
		sideAppend(labels.join(","));
	}
	const t= "\t";
	const out= [];
	for(const out_line of out_arr){
		out.push(out_line.map((v, i)=> v.padEnd(out_max[i], " ")).join(t));
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

function dataPrepare(data){
	return data.flatMap(function(row){
		row.deadline= row.deadline.split(" r")[0];
		const dates= [ ...row.dates, row.deadline ]
			.flatMap(function(date_r){
				let [ date, repeat ]= date_r.split(" r");
				date= date.replace(" ", "T");
				if(!repeat) return [ date ];
				let { deadline }= row;
				if(!deadline){
					const d= new Date();
					d.setMonth(d.getMonth()+1);
				} else {
					deadline= new Date(deadline);
				}
				const [ _, repeat_n, repeat_m ]= /([0-9]+)([dmy])/.exec(repeat);
				const repeat_number= Number(repeat_n);
				const repeat_measurement= repeat_m==="d" ? "Date" : (repeat_m==="m" ? "Month" : "Year");
				let out= [  ];
				let date_nth= new Date(date);
				while(date_nth<deadline){
					out.push(date_nth.toISOString().replace("T00:00:00.000Z", ""));
					date_nth["set"+repeat_measurement](date_nth["get"+repeat_measurement]()+repeat_number);
				}
				return out;
			})
			.filter(Boolean)
			.sort();
		if(!dates.length){
			row.date_next= "tbd";
			return [ row ];
		}
		return dates.map(date_next=> Object.assign({ date_next }, row));
	})
	.sort(function({ date_next: dn_a }, { date_next: dn_b }){
		if(dn_a===dn_b) return 0;
		return dn_a>dn_b ? 1 : -1;
	});
}
function filterDates(now_date, { f_dates, states }){
	if(typeof f_dates==="undefined") f_dates= "T";
	if(f_dates==="T"){
		states= states.split("|")[1];
		return function todo({ date_next, state }){
			return now_date<=date_next || states.indexOf(state)===-1;
		};
	}
	if(f_dates==="f") return ({ date_next })=> now_date<date_next;
	if(f_dates==="p") return ({ date_next })=> now_date>date_next;
	if(f_dates==="t") return ({ date_next })=> now_date===date_next;
	
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
