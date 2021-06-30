echo '{ "Links": [' > links2.json
cat test_.json >> links2.json
echo "]}" >> links2.json
sed "s+}{+},{+g" links2.json > links.json
