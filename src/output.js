import { log } from "console";

export function logPeriod(title, line, now_date){
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

export function outPrepare(data, now_date, now_time){
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
