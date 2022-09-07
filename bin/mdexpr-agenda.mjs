#!/usr/bin/env node
import { log } from "console";
import { cli, cli_mdexpr, mdexpr, useOptions, Option, readJSONFileSync } from "mdexpr";
import { outPrepare, logPeriod } from "../src/output.js";
import { dataPrepare, mdexprAgenda, filterStates, filterDates } from "../src/data.js";
import { pipe } from "../src/utils.js";
import { join } from "path";

const repo_dir= join(decodeURI((new URL(import.meta.url)).pathname), '..', '..');
const use_param= readJSONFileSync(repo_dir, "package.json").homepage;
const options_default= { states: "TODO,NEXT|DONE" };

cli_mdexpr
	.option("--grep [format]", "output in the ‘grep’ format: option `H` prepend `file:`, `n` prepend `line:`. (default: \"Hn\")")
	.option("--f_states [filter_states]", "to filter specific states. Use name list separated by comma or 0/1 for todo/done agenda idems. (default: \"0\")")
	.option("--f_dates [filter_dates]", "to filter dates. Use exact dates list separated by comma or key word [p]ast/[f]uture/[t]oday/[T]ODO. (default: \"T\")")
	.addOption(new Option("--verbose [level]", "modify printing (technical) info.").choices([ "no", "debug" ]).default("no"))
	.action(function(files, options){
		//#region …
		try{
			const ast= mdexpr(files);
			const ast_agenda= ast[use_param] || [];
			const fileOptions= filesOptions(use_param, ast);
			const [ now_date, now_time ]= (new Date()).toISOString().split("T");
			const data= pipe(
				v=> v.map(mdexprAgenda),
				v=> v.filter(filterStates(fileOptions, options)),
				dataPrepare,
				v=> v.filter(filterDates(now_date, fileOptions, options))
			)(ast_agenda);
			
			const out= outPrepare(data, now_date, now_time);
			if(options.grep) return grep(data, out, options.grep);

			let s= " ", line_h= out[0];
			const state_ch= String(data.length).length+2;
			for(const line of out){
				const sl= line[state_ch];
				if(s!==sl){
					if(s===" "&&sl==="-") logPeriod("PAST", line_h, now_date);
					if(s==="-"||s===" "&&sl!=="-") logPeriod("TODAY", line_h, now_date);
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
		//#endregion
	});
cli.command("get <file> [type]")
	.summary("returns a list of options, … based on `type`")
	.description("For now only `options` is allowed as `type` ⇒ returns options (after `use … with` part).")
	.option("--json", "output in JSON format")
	.addOption(new Option("--verbose [level]", "modify printing (technical) info.").choices([ "no", "debug" ]).default("no"))
	.action(function(file, _, { json: is_json= false, verbose= "no" }= {}){
		//#region …
		try{
			const config= filesOptions(use_param, mdexpr(file))(file);
			if(!is_json){
				log(config);
				process.exit(0);
			}
			pipe(
				JSON.stringify,
				log
			)(config);
		} catch(err){
			if(verbose==="debug") log(err.stack);
			else log(String(err));
			process.exit(1);
		}
		//#endregion
	});
cli.command("vim")
	.summary("returns snippets to be used in your VIM config")
	.description("Inside your `~/.vim/after/markdown/mdexpr.vim` use `execute \"source \".system(\"mdexpr-agenda vim 2> /dev/null\")`")
	.action(function(){
		log(join(repo_dir, "vim", "index.vim"));
	});
cli.parse();

function filesOptions(use_param, ast){
	const cache= new Map();
	return function fileOptions(file){
		if(cache.has(file)) return cache.get(file);
		const found= Object.assign(options_default, useOptions(use_param, file, ast));
		cache.set(file, found);
		return found;
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
