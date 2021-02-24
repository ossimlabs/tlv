import json


list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

list2 = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

combined = []
for i in range(0, len(list)):
	temp = [list2[i], list[i]]
	combined.append(temp)

print(combined[6][1])
# print(temp1.testName)
