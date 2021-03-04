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
	# we use this to grab the specific parameters from the Scrapy results, which contain
	# way more information than we are using.
	for param in inputParams:
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

