#attempted cleanup from previous builds
rm testing/testing/spiders/results.json jsonFiles/links.json

npx cypress run

# shellcheck disable=SC2164
cd jsonFiles

./linksFixer.sh

# shellcheck disable=SC2164
cd ../testing/testing/spiders

scrapy crawl quotes -o output.json

./temp.sh

cd ../../..

python3 comparison.py
