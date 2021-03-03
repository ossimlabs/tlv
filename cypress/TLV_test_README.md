# TLV Frontend Integration Tests

The original goal for this ticket was to add a Jenkins stage that would run Cypress tests for the TLV service. While this was not complicated in and of itself, it would only check whether the service was running or not, regardless of the input parameters. In order to determine whether the service's UI was properly running, we would need to determine if the input parameters matched the associated url. In order to do this, we use a web scraping library written in Python called Scrapy. Below is the implementation of these tests using Scrapy and Cypress. 


# Design


### Cypress Tests

The cypress tests are used for two reasons. First and foremost, a passing test means that the service is running. If the first two sets of test fail, then the service is down for some reason. The second reason for the initial Cypress test is to obtain a set of links for the Scrapy service to be able to visit. The Cypress tests write the URLs created to a JSON file, that can be read into Scrapy. 


### Scrapy Tool

Scrapy is a free and open-source web-crawling framework written in Python. Originally designed for web scraping, it can also be used to extract data using APIs or as a general-purpose web crawler. Here we use it to visit the tlv frontend after the parameters have been input, and we use it to grab them and output them to a JSON file that can later be used to compare to the original input of the cypress test. 

### Execution Scripts

Throughout the process of running Cypress tests to check if the service is running, and create a list of links to later visit and scrape, the output needs to be processed in order to be parsable. Both the links output by the Cypress tests and then the output of the Scrapy tests need to be edited. Then, a python file reads these JSONs, and compares the original input parameters to the parameters received from the web scraper. The python file creates a results file, that is finally read back into Cypress to be displayed in Jenkins. There is a final script that executes each of these steps in order, which can be called upon or translated into the Jenkins file. 


# Implementation
### Jenkins Stage Added:
tba
### Cypress:
##### Initial Cypress Test
```
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
```

##### Final Cypress test
```
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
```
### Scrapy:
```
import scrapy  
import json  
import time  
  
class urlObject:  
   def __init__(self, url, testName):  
      self.url = url  
      self.testName = testName  
  
  
class QuotesSpider(scrapy.Spider):  
   name = "tests"  
  iter = 0  
  names = []  
   urlObjects = []  
  
   def start_requests(self):  
      baseUrl = 'https://omar-dev.ossim.io/tlv/home/index'  
  urls = []  
      requests = []  
      combined = []  
  
      with open('../../../jsonFiles/links.json') as f:  
         data = json.load(f)  
  
      for item in data['Links']:  
         tempUrl = baseUrl + item['request']  
         urls.append(tempUrl)  
  
      for i in range(0, len(urls)):  
         temp = [urls[i], i + 1]  
         combined.append(temp)  
  
      for item in combined:  
         yield scrapy.Request(url=item[0], callback=self.parse, priority=item[1])  
  
  
  
  
   def parse(self, response):  
      for thing in response.xpath('/html/body/script[7]'):  
         yield {  
            'Output' : thing.xpath('/html/body/script[7]/text()').extract_first()  
         }  
         self.iter = self.iter + 1
```
### JSON editing scripts:
##### ./fixCypressOutput.sh
```
echo '{ "Links": [' > links2.json  
cat test_.json >> links2.json  
echo "]}" >> links2.json  
sed "s+}{+},{+g" links2.json > links.json
```
##### ./fixScrapyOutput.sh
```
sed 's+\\\\\\"+~+g' output.json > temp.json  
sed 's+\\"+"+g' temp.json > temp2.json  
sed 's+~+\\"+g' temp2.json > temp3.json  
sed 's+{"Output": "\\n\\t\\t\\tvar tlv = ++g' temp3.json > temp4.json  
sed 's+;\\n\\t\\t\\ttlv.contextPath = "/tlv";\\n\\t\\t"}++g' temp4.json > results.json  
rm temp.json temp2.json temp3.json temp4.json output.json
```
### Compare:
##### _comparison.py
```
import json  
  
result = []  
go = 0  
  
# read the testParameters, and load into input  
while True:  
   try:  
      with open('../testParameters.json') as f:  
         input = json.load(f)  
      break  
 except ValueError:  
      go = 1  
  print("Error, there were no original parameters")  
      break  
  
# read the results.json, load into result  
while True:  
   try:  
      with open('testing/testing/spiders/results.json') as f:  
         result = json.load(f)  
      break  
 except ValueError:  
      go = 1  
  print("Error, there were no Scrapy results")  
      break  
  
# reads original links file to get list of test names  
while True:  
   try:  
      with open('jsonFiles/links.json') as f:  
         names = json.load(f)  
      break  
 except ValueError:  
      go = 1  
  print("Error, there were no Links from Cypress")  
      break  
  
if (go == 0):  
  
   # create a list of input parameters to later be compared to output params  
  inputParams = []  
   for key in input["tests"]:  
      inputParams.insert(0, input["tests"][key]["parameters"])  
  
   # creates a list that only contains the testNames  
  testNames = []  
   for i in range(0, len(names["Links"])):  
      testNames.insert(0, names["Links"][i]["test"])  
  
   # reverse to get correct order  
  inputParams.reverse()  
   testNames.reverse()  
  
   # set up partA: dict with format {"testName" : [params]}, contains input  
  partA = {}  
   for i in range(0, len(testNames)):  
      partA[testNames[i]] = inputParams[i]  
  
   # set up partB, dict with format {"testName" : [params]}  
  partB = {}  
   keyList = []  
   subKeyList = []  
   # sets up a list of lists that contain the parameters used for each test  
 # we use this to grab the specific parameters from the Scrapy results, which contain # way more information than we are using.  for param in inputParams:  
      for key, value in param.items():  
         subKeyList.append(key)  
      keyList.append(subKeyList)  
      subKeyList = []  
  
   # final set up for partB  
  for i in range(0, len(result)):  
      tempDict = {}  
      for j in range(0, len(keyList[i])):  
         tempDict[keyList[i][j]] = result[i][keyList[i][j]]  
      partB[testNames[i]] = tempDict  
  
   # create a results file to later be compared for passing/failing  
  q = open("finalResult.json", "w")  
   q.write("{")  
  
   # compare the tests, partA for input, partB for output.  
  for name in testNames:  
      q.write('\n\t"' + str(name) + '" : ')  
  
      if partA[name] == partB[name]:  
         q.write("true")  
         print(name + " test PASSED")  
      else:  
         q.write("false")  
         print(name + " test FAILED")  
      if (name != testNames[len(testNames) - 1]):  
         q.write(",")  
  
   q.write("\n}")
```

### Optional:
##### ./cleanup.sh
If run locally, any written files will save locally. To be sure testing system is running properly, and not reusing any previously existing JSON files, and prevent any files from having data appended to them incorrectly, run the following script. If you get a permission denied, run chmod +x cleanup.sh (at least on a mac.). 
```
rm cypress/jsonFiles/links.json cypress/jsonFiles/links2.json cypress/jsonFiles/test_.json  
rm cypress/finalResult.json  
rm cypress/testing/testing/spiders/results.json  
rm results/test-result.xml
```

### The Process
Initial cypress tests to check if service is running and provide links
↓↓↓
script runs to fix the cypress output
↓↓↓
scrapy gathers data for each of the original cypress tests from the tlv UI
↓↓↓
script runs to fix the scrapy output
↓↓↓
Comparison python file checks to see if initial input = TLV UI output
↓↓↓
Final Cypress test is run to check the results, and display them using junit, in Jenkins.


# Relevant File Paths:
### Folders and their content:
	- cypress
		- cypress/intgration
			- contains Test.js and Final.js, the initial and final cypress tests.
		- cypress/jsonFiles
			- holds links.json file, and fixCypressOutput.sh
		- cypress/testing
			- contains comparison.py
			- cypress/testing/testing/spiders
				- contains scrapy crawler file: quotes_spider.py
				- contains fixScrapyOutput
				- holds scrapy output file output.json, then results.json after fixing.
	 
	- results/
		- contains test-results.xml

	- (home) ./
		- contains:
				- Jenkinsfile
				- testParameters.json
				- cypress.json
				- cleanup.sh (for easy cleanup locally)
				- runTests.sh (for easy building locally)






	
