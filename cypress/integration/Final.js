let json = require('../../testParameters.json');
let tests = Object.keys(json.tests);
let innerJson, query, good, parameters;

describe('Automated tests for TLV API endpoints', () => {
    tests.forEach((test) => {
        innerJson = json.tests[test];
        query = innerJson["in"] === "query";
        good = innerJson["expected"] === "good";
        parameters = Object.keys(innerJson["parameters"]);
        if(query && good) {
            it(`Should test input/output result for ${test}`, () => {
                cy.readFile('cypress/finalResult.json')
                   .its(`${test}`).should('eq', true)
            })
        }
    })
})
