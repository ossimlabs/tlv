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

