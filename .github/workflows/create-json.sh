#/bin/bash
account_id=815722535543
if [ -f /tmp/__secrets.json ] ; then
rm -f /tmp/__secrets.json 
fi

branch_name=${GITHUB_REF#refs/heads/}
echo $branch_name

if [ "$branch_name" == "main" ] ; then
prefix=stage
#region="ap-south-1"
elif [ "$branch_name" == release-* ] ; then
prefix=prod
#region=us-east-1
fi
printf '{
	 "secrets": [' > /tmp/__secrets.json


for line in `cat .${prefix}env`
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