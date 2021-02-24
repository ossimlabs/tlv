let json = require('../../testParameters.json');
let tests = Object.keys(json.tests);
let innerJson, method, endpoint, query, good, parameters, request, keys, baseUrl, request2;

describe('Automated tests for TLV API endpoints', () => {
    tests.forEach((test) => {
        innerJson = json.tests[test];
        method = innerJson["method"];
        endpoint = innerJson["endpoint"];
        query = innerJson["in"] === "query";
        good = innerJson["expected"] === "good";
        parameters = Object.keys(innerJson["parameters"]);
        if(query && good) {
            request = "?"
            var request2 = [];
            parameters.forEach((parameter) => {
                request = request + parameter + "=" + innerJson.parameters[parameter] + "&";
            })
            request = request.substring(0, request.length - 1);
            request2.push(request);
            it(`Should test 200 code for ${test} test values`, () => {
                cy.request(method, endpoint + request)
                    .then((response) => {
                        expect(response.status).to.eq(200)
                    })
            })
            it(`Should test response header for ${test}`, () => {
                cy.request(method, endpoint + request)
                    .then((response) => {
                        expect(response).to.have.property("headers")
                    })
            })
            it(`Should write data to JSON`, () => {
				cy.writeFile( "cypress/jsonFiles/test_" + ".json", {test: `${test}`, request: request2[0]}, {flag: 'a+'})
				})
        }
        else if(query) {
            request = "?"
            parameters.forEach((parameter) => {
                request = request + parameter + "=" + innerJson.parameters[parameter] + "&";
            })
            request = request.substring(0, request.length - 1);
            it(`Should test for a not 200 code for ${test} test values`, () => {
                cy.request(method, endpoint + request).then((response) => {
                    expect(response.status).to.not.eq(200)
                })
            })
            it(`Should write data to JSON`, () => {
				cy.writeFile("URLs.json", {URL: "Cory"})
				})
        }
    })
})
