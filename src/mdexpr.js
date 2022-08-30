// ast ⇒ abstract syntax tree
import { program as cli } from "commander";
import { log } from "console";
import { readFileSync } from "fs";
import glob from "glob";
const { push }= Array.prototype;
const reverseText= text=> text.split("").reverse().join("");

const pkg= JSON.parse(readFileSync("./package.json"));
cli.name(pkg.name)
	.version(pkg.version, "-v, --version")
	.description([
		"mdexpr-*",
		"\tThese commands works with markdown files with additional `mdexpr` syntax (see [1]).",
		pkg.name,
		"\t"+pkg.description
	].join("\n"))
	.addHelpText("after", [
		"",
		"Links:",
		"  [1] https://github.com/jaandrle/mdexpr-agenda"
	].join("\n"));

/** Main command ≡ processing markdown files. */
const cli_mdexpr= cli.command("files [file(s)]", { isDefault: true })
	.summary("[default] process markdown file(s).")
	.description("Process expressions in markdown file(s).");

export { cli, cli_mdexpr };

export function mdexpr(files_path= "./*.md"){
	const ast_arr= [];
	const files= glob.sync(files_path);
	for(const file of files)
		push.call(ast_arr, astPerFile(file));
	let ast= ast_arr.reduce(function(out, curr){
		Object.keys(curr).forEach(function(key){
			if(!Reflect.has(out, key)) out[key]= [];
			push.apply(out[key], curr[key]);
		});
		return out;
	}, {});
	return ast;
}
export function useOptions(use, file, ast){
	const conf= (ast.mdexpr || []).find(({ args, file: file_c })=> args.indexOf("use")===0 && file_c===file && args.indexOf(use)!==-1);
	if(typeof conf === "undefined" || conf.args.indexOf("with")===-1)
		return {};
	return / with (.*)/.exec(conf.args)[1].split(" ")
		.reduce(function(acc, curr){
			Reflect.set(acc, ...curr.split("="));
			return acc;
		}, {});
}

function astPerFile(file){
	const ast_pre= { mdexpr: [] };
	const file_lines= readFileSync(file).toString().split("\n");
	const lines= file_lines.length + 1;
	let last, skip; // last to todo, skip when code block
	for(let line_i= lines; line_i > 0; line_i--){
		const line= file_lines[line_i];
		if(skip){
			if(line.indexOf("```")===0) skip= false;
			continue;
		}
		if(!last && !/\{[^\}]+ \w+\}\$$/.test(line)){
			if(line==="```") skip= true;
			continue;
		}
		if(last){
			last.forEach(l=> l.context= line);
			last= null;
			continue;
		}

		const asts_line= astPerLine(file, line_i, line);
		if(!asts_line[0].context) last= asts_line;
		else asts_line.forEach(l=> l.line+= 1);
		asts_line.forEach(l=> {
			if(!Reflect.has(ast_pre, l.cmd)) ast_pre[l.cmd]= [];
			ast_pre[l.cmd].push(l);
			Reflect.deleteProperty(l, "cmd");
		});
	}
	const map= new Map([ [ "mdexpr", "mdexpr" ] ]);
	ast_pre.mdexpr
	.filter(({ args })=> args.indexOf("use")===0)
	.forEach(function({ args }){
		const [ _, name, use ]= /\[([^\]]+)\]\(([^\)]+)\)/.exec(args);
		map.set(name, use);
	});
	const ast= {};
	map.forEach((use, name)=> ast[use]= ast_pre[name]);
	return ast;
}
function astPerLine(file, line_num, line_text){
	let out= { context: "", line: line_num, file };
	let out_code= [];
	let out_i= 0;
	let is_code, is_cmd; // is code/cmd part
	const line= line_text.split("").reverse();
	const { length }= line;
	for(let i= 0; i<length; i++){
		const ch= line[i];
		if(!is_code && ch==="$" && line[i+1]==="}"){
			is_code= true;
			i+= 1;
			continue;
		}
		if(!is_code){
			out.context+= ch;
			continue;
		}
		if(!out_code[out_i]){
			out_code[out_i]= { cmd: ch, args: "" };
			is_cmd= true;
			continue;
		}
		if(ch==="{"){
			is_code= false;
			is_cmd= false;
			out_i+= 1;
			continue;
		}
		if(is_cmd && ch===" "){
			is_cmd= false;
			continue;
		}
		out_code[out_i][is_cmd ? "cmd" : "args"]+= ch;
	}
	out.context= reverseText(out.context);
	return out_code.map(d=> {
		d.cmd= reverseText(d.cmd);
		d.args= reverseText(d.args);
		return d;
	}).map(d=> Object.assign(d, out));
}
