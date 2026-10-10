Homepage for Matt Bevilacqua

[![Netlify Status](https://api.netlify.com/api/v1/badges/adc3a241-39e6-41ee-a912-8bfa0ae9a953/deploy-status)](https://app.netlify.com/projects/mattbev/deploys)

This is maybe version 4? Now using Eleventy.

For more info, [visit the site](https://www.mattbev.com/about-this-site).

Local builds (`npm run build` or `npm run serve`) fetch currently reading books
from StoryGraph and save them to `data/currently-reading.json`. Commit and push
that file along with any updated book files. Netlify displays the saved data
without fetching StoryGraph. If a local fetch returns no books, the previous
snapshot is kept; to clear the list intentionally, set the JSON file to `[]`.
