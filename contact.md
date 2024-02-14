---
layout: layouts/page.njk
title: Contact
---

Drop me a line if you want

<form netlify name="contact">
    <label for="email">
        Email
    </label>
    <input type="email" name="email" id="email" />
    <label for="message">
        Message <span class="req">*</span>
    </label>
    <textarea name="message" id="message" rows="5" required></textarea>
    <button type="submit">Send</button>
</form>
