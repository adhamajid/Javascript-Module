const run = require("./app.js");
const AlertService = require("./alert.service.js");
const CalculatorService = require("./calculator.service.js");
const JokesService = require("./jokes.service.js");

const alertService = new AlertService();
const calculatorService = new CalculatorService();
const jokesService = new JokesService();

run(alertService, calculatorService, jokesService);
