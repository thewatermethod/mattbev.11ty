---
title: Overriding wp-scripts webpack
date: 2020-09-09
tags: [wordpress, dev, hack, webpack]
type: post
---

I recently used [wp-create-block](https://developer.wordpress.org/block-editor/tutorials/create-block/) for the first time instead of my traditonal go-to [create-guten-block](https://github.com/ahmadawais/create-guten-block).

Love CGB, but I have to say the new script from WordPress core _felt_ a little smoother. I went through my normal flow and built a very simple block for a friend's website. Tested it locally, everything worked fine. I went ahead and installed it on his website (a very close to vanilla install) and immediately nerfed the editor.

I scowled, and set about finding the error, and then scowled again when I identified the culprit. It was Jetpack!

I scowled first because I obviously should have been testing with all his plugins installed and second of all because it appeared to be something to do with my new block declaring a variable (in this case "j") and Jetpack trying to use it.

Not sure what else to do, I poked around for a moment and found that you can override the default wp-scripts webpack config. ([Documentation here](https://developer.wordpress.org/block-editor/packages/packages-scripts/))

My thought was to simply not minify the variable names in my code. Now - if you are anything like me, you use Webpack all the time, but very rarely do you write your own config file, especially recently

After a few minutes, I figured out the exact setting to override. (It was in the TerserPlugin options). I've reproduced my solution below.

Note that the WP team advises that this is going to be a perpetually changing bit of solution - as the webpack config changes, so you will have to update your override file. In this case, I won't often be re-building this solution so I'm not too worried about it.

```js
const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const TerserPlugin = require("terser-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  ...defaultConfig,
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: !isProduction,
        terserOptions: {
          module: true,
          output: {
            comments: /translators:/i,
          },
        },
        extractComments: false,
      }),
    ],
  },
};
```
