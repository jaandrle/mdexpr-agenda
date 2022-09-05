
export function dataPrepare(data){
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
export function filterDates(now_date, { f_dates, states }){
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
export function filterStates({ states, f_states }){
	if(typeof f_states==="undefined") f_states= 0;
	if(!isNaN(Number(f_states))) f_states= states.split("|")[f_states];
	f_states= f_states.split(",");
	return function filterStatesNth({ state }){
		return f_states.indexOf(state)!==-1;
	};
}
export function mdexprAgenda({ args, context, line, file }){
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
