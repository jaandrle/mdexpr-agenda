export const pipe= (...fs)=> Array.prototype.reduce.bind(fs, (out, f)=> f(out));
