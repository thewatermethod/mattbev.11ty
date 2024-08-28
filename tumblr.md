---js
{
    pagination: {
        data: "posts", // uses return of /_data/posts.js as data
        size: 1, // Creates a page for each post
        alias: "post", // Makes accessing data easier
        addAllPagesToCollections: true // Adds pages to Collections based on tags
    },
    tags: ["posts", "tumblr"], // The tag for collections,
    layout: "layouts/post.njk",
    eleventyComputed: {
        title: data => data.post.title,
        description: data => data.post.description, // Post description from data
        permalink: data => `${data.post.permalink}/index.html`,
        date: data => data.post.date,
        type: 'tumblr',
        url: data => data.post.url
    }
}
---

{{ post.content }}

<!-- thanks to the very helpful post at https://bryanlrobinson.com/blog/using-11ty-javascript-data-files-to-mix-markdown-and-cms-content-into-one-collection/
for helping me figure out how to grab these tumblr posts
-->
