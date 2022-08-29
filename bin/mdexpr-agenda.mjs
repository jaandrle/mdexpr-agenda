#!/usr/bin/env node
import { mdexpr } from "../src/mdexpr.js";
import { readFileSync } from "fs";

mdexpr(JSON.parse(readFileSync("./package.json")), {
});
