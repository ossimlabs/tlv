echo '{ "Links": [' > links.json
cat test_.json >> links.json
echo "]}" >> links.json
sed -i ".txt" "s+}{+},{+g" links.json

# rm test_.json
# rm links.json.txt
