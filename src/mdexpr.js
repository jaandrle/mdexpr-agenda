
export function fromCLI(){
	return {
		args: process.argv,
		file: import.meta.url
	};
}
