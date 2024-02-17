---
title: BRWZRD
date: 2020-09-08
thumbnail: /images/28797-1024__76904.1448648719.500.659.jpg
tags:
  [
    dev,
    side projects,
    graphql,
    fauna,
    jamstack,
    cloudinary,
    typescript,
    sendgrid,
  ]
type: post
---

I recently surveyed the Javascript landscape and realized that there were several technologies that I needed to go deeper on. I like to stay current (which I know feels impossible, at least to me) and I also have had this particular idea for an app for awhile.

## The Idea

I go through stretches where I am an avid homebrewer (of beer). It is an incredible extravagance to get a whole weekend day to sit and basically watch water boil. When I can, I do.

There are some homebrewers who like the deeply mathematical nature of brewing, who love measuring and optimizing. I, on the other hand, do not. I want basically a recipe scratchpad. And I definitely don't want a bunch of social/sharing features, and I don't want to have another username and password out in the wild.

## The Project

I created a working demo pretty quickly. I have written oodles of React but have only briefly touched on hooks. I also have written a fair amount of Typescript, but only under the auspices of the Sharepoint Framework. I wanted to use those, because I like the way the hooks syntax looks, and because Typescript, I have found, makes development fairly bugproof. I was somewhat agnostic about the data layer of my application. Knowing I would be making a static site in the end, I decided to try FaunaDB since it advertises itself as "for" the JAMstack.

This led me to write some additional GraphQL. Between this and Typescript, I really liked how tightly everything was typed.

At that point, the rest of the technology came together pretty quickly. Netlify was an obvious choice for hosting. Moreover, I was able to port over my node backend into serverless functions, which made for one nice neat repo.

Cloudinary has a great free image plan. TinyMCE works just fine. Sendgrid for emails, ditto. Great API.

Finally, my friend [Gino](https://twitter.com/kiwimonsta) was able to whip me up a sweet logo/header image.

![the brew wizard logo](/assets/brwzrd1.jpg)

## The Links

- [BRWZRD](https://www.brwzrd.com/)
- [The code on Github](https://github.com/thewatermethod/brwzrd)

## What's Next

Obviously there is lots of cleanup and smoothing out of functionality. I want to style the transactional emails. I need to tighten up the form submission process. I need some content on the home page.
