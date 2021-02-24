import json

#read the testParameters, and load into input
with open('testParameters.json') as f:
	input = json.load(f)

#read the results.json, load into result
with open('testing/testing/spiders/results.json') as f:
	result = json.load(f)

#reads original links file to get list of test names
with open('jsonFiles/links.json') as f:
	names = json.load(f)

#create a list of parameters to later be compared
params = []
for key in input["tests"]:
	params.insert(0, input["tests"][key]["parameters"])

#use prev data to have easily usable list of test Names
testNames = []
for i in range (0, len(names["Links"])):
	testNames.insert(0, names["Links"][i]["test"])

#reverse to get original order of the testParameters
params.reverse()
testNames.reverse()

#set up partA which is the input parameters
partA = {}
for i in range(0, len(testNames)):
	partA[testNames[i]] = [params[i]]


# the following creates a dict with format {"testName" : [resultParameter list]}
iter = 0
partB = {}
for item in result:
	keyList = list(item.items())
	resultParams = {}
	for item in keyList:
		if(item[0] == 'format'):
			break
		resultParams[str(item[0])] = str(item[1])
	resultParamsList = []
	resultParamsList.insert(len(resultParamsList), resultParams)
	partB[testNames[iter]] = resultParamsList
	iter = iter + 1


#pass or fail indication
for name in testNames:
	if partA[name] == partB[name]:
		print(name + " test PASSED")
	else:
		print(name + " test FAILED")



# make a list of the params, in a dict: key=testName, value=list
