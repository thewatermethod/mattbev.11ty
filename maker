#! /bin/bash

# we need a title
if [ -z $1 ]; then
  echo "Usage: maker <post title>"
  exit 1
fi

# slugify the title
script_name=$(echo $1 | sed -e 's/[^[:alnum:]]/-/g' | tr -s '-' | tr A-Z a-z)

#today's date as YYYY-MM-DD
today=$(date +%Y-%m-%d)

echo "Creating new post: $1"
echo "Slug: $script_name"
echo "Date: $today"

touch ./posts/$script_name.md

cat > ./posts/$script_name.md <<EOF
---
title: $1
author:
image:
url: 
date: $today
tags: []
type: 
excerpt:
eleventyExcludeFromCollections: true
---

