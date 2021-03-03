import json

testPoint = 1
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

	# create a list of parameters to later be compared
	params = []
	for key in input["tests"]:
		params.insert(0, input["tests"][key]["parameters"])

	# use prev data to have easily usable list of test Names
	testNames = []
	for i in range(0, len(names["Links"])):
		testNames.insert(0, names["Links"][i]["test"])

	# reverse to get original order of the testParameters
	params.reverse()
	testNames.reverse()

	# set up partA which is the input parameters
	partA = {}
	for i in range(0, len(testNames)):
		partA[testNames[i]] = params[i]

	iter = 0
	partB = {}

	keyList = []
	subKeyList = []
	for param in params:
		for key, value in param.items():
			subKeyList.append(key)
		keyList.append(subKeyList)
		subKeyList = []


	for i in range(0, len(result)):
		# print("..........")
		tempDict = {}
		for j in range(0, len(keyList[i])):

			# partB[testNames[i]] =
			tempDict[keyList[i][j]] = result[i][keyList[i][j]]
		partB[testNames[i]] = tempDict
	# print("PartA\n...........")
	# print(partA)
	# print("PartB\n...........")
	# print(partB)


	# use this to cycle through each param in each keyList
	# for test in keyList:
	# 	print(".........\n")
	# 	for param in test:
	# 		print(param)




	# iter = 0
	# partB = {}
	# for item in result:
	# 	keyList = list(item.items())
	# 	resultParams = {}
	# 	for item in keyList:
	# 		if (item[0] == 'format'):
	# 			continue
	# 		resultParams[str(item[0])] = str(item[1])
	# 	resultParamsList = []
	# 	resultParamsList.insert(len(resultParamsList), resultParams)
	# 	partB[testNames[iter]] = resultParamsList
	# 	iter = iter + 1
	#

	q = open("finalResult.json", "w")
	q.write("{")

	#
	# print("\n\n.......................")
	# print(partA)
	# print("......................\n\n")
	#
	for name in testNames:
		q.write('\n\t"' + str(name) + '" : ')

		if partA[name] == partB[name]:
			q.write("true")
			print(name + " test PASSED")
			print(partA[name])
			print(partB[name])
		else:
			q.write("false")
			print(name + " test FAILED")
		if (name != testNames[len(testNames) - 1]):
			q.write(",")

	q.write("\n}")
