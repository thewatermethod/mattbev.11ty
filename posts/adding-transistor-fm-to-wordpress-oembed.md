---
title: Get Transistor.fm oEmbed HTML programatically in WordPress
date: 2021-04-22
tags: [dev, wordpress]
type: post
---

I recently had a request to programatically embed Transistor.fm podcast links in a WordPress template.
The block editor seems to handle these links just fine. However, this wasn't going to be embedded in the content area but generated dynamically based on a third party API response.

WordPress has a built in set of [oEmbed providers](https://developer.wordpress.org/reference/hooks/oembed_providers/) - for one of those, you can can get the HTML with `wp_oembed_get`

```php
$html = wp_oembed_get($link);
```

Transistor wasn't one of them so that was returning false, but there's a function for that-

```php
//add transistor as an oEmbed provider
wp_oembed_add_provider('https://share.transistor.fm/*', 'https://share.transistor.fm/oembed');
```

Transistor's docs didn't seem to have any oembed provider info but an endpoint exists!

## RTFM if you want

- [wp_oembed_get](https://developer.wordpress.org/reference/hooks/oembed_providers/)
- [oembed_providers](https://developer.wordpress.org/reference/hooks/oembed_providers/)
- [wp_oembed_add_provider](https://developer.wordpress.org/reference/functions/wp_oembed_add_provider/)
