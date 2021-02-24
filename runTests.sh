#attempted cleanup from previous builds
rm cypress/testing/testing/spiders/results.json cypress/jsonFiles/links.json

npx cypress run --spec "cypress/integration/Tests.js"


# shellcheck disable=SC2164
cd cypress/jsonFiles

./fixCypressOutput.sh

# shellcheck disable=SC2164
cd ../testing/testing/spiders

scrapy crawl tests -o output.json

./temp.sh

cd ../../..

python3 comparison.py

npx cypress run --spec "cypress/integration/Final.js"


