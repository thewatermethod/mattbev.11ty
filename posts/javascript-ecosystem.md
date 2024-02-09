---
title: Opting out of the JavaScript ecosystem (sort of)
image:
date: 2024-02-09
tags: [better web, dev]
type: post
---

Ok. Not opting out of anything.

This site went dark for some time, first because I was busy, and secondly because it became too onerous to update. Conflicting versions of Node, Vue, and Nuxt basically meant it was time to update the site, and with that meant updating the Nuxt plugins that supported the content flow, and once I realized what a _project_ it would be, I started to wonder why I should bother.

I first considered switching this back to a simple WordPress theme. It's not that the tech involved in a WordPress is simpler than a Nuxt site but I do have WordPress sites that have worked for approaching a decade, with the host or the app itself automatically updating the core files, php, plugins, etc. That's really something else, that level of stability.

Meanwhile, on my very fancy JavaScript site, I couldn't update a post without implementing a new API and debugging `npm install`.

WordPress, at the end of the day, is a blunt instrument in this case, and 11ty exists. The title of this post is therefore a bit misleading. I am on 11ty now, which frankly is a much better fit for updating Markdown files to generate HTML than Nuxt, no shade on an otherwise fine tool.

But the best part is the nice clean package.json, and I struggle to imagine a situation where it might grow.
