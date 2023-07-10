#/bin/bash
account_id=049302583731
if [ -f /tmp/__secrets.json ] ; then
rm -f /tmp/__secrets.json 
fi

printf '{
	 "secrets": [' > /tmp/__secrets.json

for line in `cat .env`
do
  key=$line
  if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi
          echo "{
                 "'"name"'": "'"'$key'"'",
                 "'"valueFrom"'": "'"'"arn:aws:ssm:ap-south-1:$account_id:parameter/$key"'"'"
                }," >> /tmp/__secrets.json
done
sed '$ s/,$//'  /tmp/__secrets.json > .github/workflows/secrets.json

echo ']}' >> .github/workflows/secrets.json 

cat .github/workflows/secrets.json
