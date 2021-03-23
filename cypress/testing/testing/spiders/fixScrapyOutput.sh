sed 's+\\\\\\"+~+g' output.json > temp.json

sed 's+\\"+"+g' temp.json > temp2.json

sed 's+~+\\"+g' temp2.json > temp3.json

sed 's+{"Output": "\\n\\t\\t\\tvar tlv = ++g' temp3.json > temp4.json
#
sed 's+;\\n\\t\\t\\ttlv.contextPath = "/tlv";\\n\\t\\t"}++g' temp4.json > results.json

rm temp.json temp2.json temp3.json temp4.json output.json
