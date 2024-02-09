---
title: On job hunting and interviews
date: 2021-05-09
tags: [dev, job hunting, interview, personal]
type: post
---

<style>

    .nuxt-content ul {
        margin: 1em 2em;
        list-style: disclosure-closed;
    }
    .nuxt-content ul li {
        margin: 1em 0;
    }

</style>

So - I've been job hunting for the past three months. Nothing against where I've been working, but I can't imagine spending two hours a day in a car doing the commute thing again.

I interviewed lots of different places. I have a lot of experience, but I also know the holes in my resume - specifically, I have largely worked on teams and in situations where I've been the senior developer, and always small teams. Just due to the places I've worked and the needs those places had, I've been responsible for all the leveling up, both for myself and for the teams. This puts me somewhere between mid and senior level, in my opinion, despite technically having a Senior job title.

Which is fine! And can be fun! But I know that this has left weird holes in my knowledge base. It's just one of those things. That said, I largely applied to places with a focused mission that could be interpeted as making the world a better place, either through large open source projects or because of the nature of the work itself. An incredible privilege to be able to have choices like that, and I say that as someone who spent plenty of time in his twenties cleaning toilets, sweeping floors, and retrieving carriages. Life can take you amazing places if you are lucky enough, and I feel incredibly lucky. I ended up with a new job, and it delivers on everything I wanted, at least on paper (haven't started yet.)

_Curious what the job is? It's on or will be soon on my [resume](htts://resume.mattbev.com)._

## The interview process

As a result of this job search, I had a wide variety of interview experiences and processes. Companies, want a thorough accounting of your skills before they hire you. Ok. I think that's understandable given the salaries under discussion. There will usually be something like this:

- A phone screen with a person in their talent department, generally pretty quick, to explain the role and verify your resume. Every talent person who reached out was great this time around.
- A short interview with either a hiring manager or whomever the next level of gatekeeper is. This may include stock interview questions or be more resume verification.
- A coding test. These varied pretty widely, from a fifteen minute screen share where I did some very basic javascript and CSS, to a fairly involved React/Typescript demo that took close to eight hours to complete, with lots of in between.
- The virtual on-site. 2-4 hours with a rotating cast of managers and peers on a variety of subjects from group dynamics, technical subjects, and behavioral type interview questions.

There are lots of things I find annoying about the interview process.

- Everyone asks the same questions. This is good and bad, as by week 4, I had a reasonable patter down for each question. I question the value of some of these beyond verifying the candidate has indeed had experiences and can talk about them. Maybe that's a sufficiently important thing to verify? There might be a better way.
- You are expected to ask 10 minutes of questions at the end of every interview. Sometimes I have questions; sometimes I don't. But you seem like a dull knife or like you don't care if you can't fill the entire interview.
- You are expected to find a way to be enthusiastic about specific mission of the organization and call that out specifically. I understand that's a good way to stand out, but also, I applied. I want to work there. And if you have 5 interviews in a week, this turns into a surprising amount of homework. This wasn't particularly hard for me, since I kind of picked and chose where I might want to work, but if you have a **lot** of interviews, it can be confusing.
- I don't understand what information I am supposed to glean from having all my interviewer's LinkedIn profiles.

My biggest problem, however, is the technical portion of the onsite. I generally felt like I skated through the first three steps pretty easily (in all cases but one where I got a first interview, I got to the final stage). I am mindful to say again here that I do have lots of gaps in my knowledge (although I suspect everyone does) and I do think it's important to verify someone's skills before hiring them. Ok. A lot of salary, benefits, everyone's time is at stake. Got it. Agreed.

But...

I am definitely an introvert. I work pretty hard to not let that sabotage me, but let's just say I barely noticed we were in quarantine. (Kidding). That said, I do get nervous right before an interview starts, but once it does, I feel calm. No more stomach butterflies, at least, no thumping heart. Talking about web dev. I do it every day. Every day! I know this stuff. Except, in the midst of these interviews, I have discovered some facts about myself.

My brain will just refuse to provide me with **extremely** basic information sometimes in an interview situation. Like... I was asked to reverse a string in JavaScript. Reasonably, this is a very simple task. I have gaps in my knowledge, but they don't include the most basic JavaScript string functions. I have split and joined and reversed plenty of strings and arrays. I typed `str.reverse()`, frowned because I knew that wasn't right, and then my brain refused to continue.

I said "I know there is a function to turn a string into an array, but I can't remember what it is."

"Well, just do your best."

Now I was completely blank on split. Like... I had no idea. I was picturing something like `[str].reverse()`, and I could see that wasn't right. I didn't really know how to proceed, so I ended up with a really nightmarish mix of for loops. I could tell from the nice interviewer's manner what she thought of my solution, and I knew that I was toast. I mumbled my way through the rest of the interview, and that was that.

Other things I forgot, on different occasions, that I definitely know: you can pass an object as a parameter in JavaScript instead of twelve different parameters. The difference between HTTP codes 401 and 403. How to catch an error in async/await. A content security policy. Basic prototypal inheritance. How to improve a page's performance based on Lighthouse scores. Sometimes I know that I should know it - other times, I wonder if I've ever known anything.

Now, this begs the question. Should a candidate be able to recall this stuff in an interview situation? I think in some of these cases, I was very well suited for these jobs. I think I would make a real positive difference at these organizations. I work very hard, I have a lot of knowledge, and I think hiring me is a good thing.

I'm obviously biased - and they probably found candidates who don't forget basic stuff in these cases. Well, ok.

In the real world, I would have time to get this stuff right, I wouldn't have the pressure of recalling it on demand, and I could even Google if need be. Har-de-har-har Stack Overflow, whatever, but even though I use it less than ever, I do have all the world's knowledge at my fingertips and I know how to efficiently find the correct kind. So what are we testing exactly with these technical interviews? Is it the right stuff?

## Solutions?

First of all, don't cry for me, I eventually got a job, and it's one I'm excited for.

I don't necessarily have solutions. I can't even say for sure that it's a problem. Maybe the process is working as desired. I can sort of see that. I also can't say that everyone has this same problem. People are getting jobs and succeeding in them. But I can't be the only one. I don't struggle with communication in general, verbal or written. Just sometimes, perhaps because I'm under pressure, I find myself unable to demonstrate basic technical knowledge. Now, in some but not all of these cases, I also sincerely lacked some of the knowledge they were asking for.

It seems to me the testing process in an interview should reflect the process of working. We've come a long way - as a front end developer, I wasn't asked to talk about algorithms or reverse a binary tree. I wasn't even asked to talk about "this" in JavaScript, really. I never got any trick questions, although quizzes about specific HTTP status codes feel close given, again, front end developer.

Why not take a candidate at their word as to their knowledge, given a successfully take home code-test completion, and give them a trial project? Automattic gives paid trial work. I see the potential for abuse, I'm sure some companies would try to get free or discounted labor there. I'm imagining that the project is not "for production" and also that it is more substantial then a take home test. It could loop in as much of the actual work processes of the job, and it could have a hard deadline, like a real bit of work would. Would this be fairer? Maybe if it was paid. Obviously, people who can't spend a week working on this imagined project (in the case they have a demanding job or substantial offline commitments like children or relatives) would be disadvantaged. This is a problem that would need to be solved, frankly, although in many cases, being available for several rounds of interviews including likely a three plus hour block is probably just as difficult as completing a large take-home project.

Coming to a kind of conclusion here, I would say that job interviews are great opportunities for learning experiences. You'll learn, at the very least, what other teams are doing, and you may, as I have, noticed industry patterns specifically. A lot of companies, for example, are pretty concerned about accessibility, which is great to hear. You'll find out how your skills stack up and you'll see what companies are looking for. You'll talk to a lot of different folks, which is always a learning experience. Most people you talk to are pretty nice! I think that beyond that, the process is flawed and may always by necessity exclude a portion of great candidates, which is a bummer. I think people are constantly trying to improve this, and I hope that we do.
