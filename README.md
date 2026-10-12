Homepage for Matt Bevilacqua

[![Netlify Status](https://api.netlify.com/api/v1/badges/adc3a241-39e6-41ee-a912-8bfa0ae9a953/deploy-status)](https://app.netlify.com/projects/mattbev/deploys)

This is maybe version 4? Now using Eleventy.

For more info, [visit the site](https://www.mattbev.com/about-this-site).

Local builds (`npm run build` or `npm run serve`) fetch currently reading books
from StoryGraph and save them to `data/currently-reading.json`. Commit and push
that file along with any updated book files. Netlify displays the saved data
without fetching StoryGraph. If a local fetch returns no books, the previous
snapshot is kept; to clear the list intentionally, set the JSON file to `[]`.

Tumblr imports run before **local Eleventy builds**, including watch rebuilds.
Netlify sets `SKIP_TUMBLR=true` and builds the committed Markdown files without
running the import or requiring Tumblr/R2 credentials. Fill in the Tumblr and
Cloudflare R2 settings listed in `.env.example` in your existing `.env`. Use a dedicated
R2 bucket with Object Read & Write S3 credentials and a public media domain.
Run `npm run backup-tumblr` for a standalone import, or `npm run test:tumblr` for
offline tests.
If image copying fails after the post-record pass, `npm run backup-tumblr -- --resume`
reuses the saved records and retries image copying without fetching the blog again.
Existing R2 images are listed in batches so interrupted imports can skip them
quickly. Timestamp errors are retried with refreshed request signing.
`archive/tumblr/progress.json` records the current stage and image counts locally.

Every published Tumblr post becomes a real Markdown post at `tumblr/<id>.md`.
These files are **not ignored by Git**: commit them after importing. Existing
files are skipped without changing their content or metadata, so local edits
survive subsequent builds. Tags are evaluated when a file is first created:
`mattbev.com` sets `eleventyExcludeFromCollections: false`; every other post gets
`eleventyExcludeFromCollections: true`. All pages of the blog are imported,
without a 20-post cap or a title/type filter. Existing files can be edited manually
to change their collection membership later.

Every imported post uses the regular post layout, includes Tumblr attribution,
and has a stable `/posts/tumblr/<id>/` URL. Excluded posts still produce pages
accessible at their URLs, but do not appear in Eleventy collections, tag listings,
or feeds. Tumblr is no longer included in the paginated `_data/posts.js` feed,
which prevents duplicate pages. Media is served from R2, including all photoset
images and original GIFs.

Commit `tumblr/*.md` and the small `archive/tumblr/index.json`, which contains only
post IDs and backup metadata. Full legacy and NPF API payloads are saved locally
in `archive/tumblr/posts/` but ignored by Git. The archive directory is excluded
from Eleventy template processing. R2 stores the full post records and media mapping,
raw post revisions, images, snapshots, and `latest.json` beneath
`tumblr/<blog>/`. Deleted Tumblr posts and existing Markdown files are retained.
The bucket's public URL makes raw published-post snapshots accessible too.

Every local build rescans the blog to save edits and backdated posts in the raw archive,
checking R2 before downloading media. The first run can take a while. Missing
configuration, API failures, inconsistent pagination, or R2 storage errors fail
the build and leave the last completed remote manifest intact. Imported Markdown
files are never overwritten. Commit the new posts and ID index after importing
locally, then push them for Netlify to build.
Avoid simultaneous imports against the same R2 archive.

Unavailable source images are skipped and keep their original URLs in Markdown.
`archive/tumblr/missing-images.json` records their URLs and errors locally (ignored
by Git); the full report is also in the R2 snapshot. The committed ID index includes
the missing-image count. A later import retries those images, but existing Markdown
is still left untouched.

Only images are copied to R2. Audio/video files and third-party players remain
references in the imported posts and raw records.

This imports **published content available through the Tumblr API**, not private
posts, drafts, queues, themes, all notes, or third-party embedded players such as
YouTube. Embed references remain in the posts and raw payloads.
