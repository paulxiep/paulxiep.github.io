---
title: 'Emergent System Design'
description: 'Should we be teaching architectural patterns in education?'
pubDate: '2026-04-12'
tags: ['system-architecture', 'software-architecture', 'design-pattern', 'first-principles']
---

#### Definitions

System: a group of related parts that work together as a whole for a particular purpose. [Longman Dictionary](https://www.ldoceonline.com/dictionary/system)

Anchored to literal meaning of System, **System Design** is thus, as I'll coin, *designing multiple interacting components and how they work together*.

Under that definition, the following are different levels of system view, and their concerns fall under System Design.
- Design Pattern
- Software Architecture
- System Architecture

#### Thesis

With context primed, here's my contrarian take.

*"Should we be teaching architectural and design patterns in education?"*

Here's my argument against.

*"I suppose it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail."* Abraham Maslow, *Toward a Psychology of Being*, 1962

There's a difference. When students learn patterns first without having experienced real problem-solving, the approach is methodology-first. The classic failure mode is not knowing when each learned principle applies and prioritising the wrong one.

The opposite is problem-first, otherwise known as *First Principles* thinking, reasoning your way to a solution from the ground up, based on the actual shape of the problem in front of you. (99.99% it's not a nail)

#### Case study

The following will be a bit of self-promotion, because the discovery was what primed this post in the first place.

So I suppose I'm a First Principles thinker.

This is the peculiarity of our time. Without LLM tooling, I'd never have learned the existence of that terminology, for the term is attributed to Elon Musk, not quite someone I'm interested in.

How do I come to recognise myself as a First Principles thinker?

I've discovered, once again over the past year of LLM conversation, that at least 3 of my most proud design decisions have names. I "reinvented the wheel" on at least 3 different occasions. They span different altitudes of systems - the layer of *Design Pattern*, *Software Architecture*, and *System Architecture*, in that chronological order, each of them shaped by the problem, resources, and constraints in front of them.

- [Factory Pattern (Design Pattern)](https://github.com/paulxiep/portfolio/blob/main/7_wonders/effects.py) - my Reinforcement Learning board game implementation needed Object-Oriented spawning of game effects. My resource was [json data of game elements I found online](https://github.com/paulxiep/portfolio/blob/main/7_wonders/v2_cards.json). I needed something that read the json file and automatically spawns a collection of elements without bloated manual code. Factory Pattern combined with subclassing polymorphism was the answer.

- Layered Architecture - I had to invent a complex algorithm with tangled up concerns and problem-space. The key to tractability was identifying a dimension to slice the problem. Each slice abstracts away the layer underneath it. The constraints shaped the design, which led to the reinvention.

- Hexagonal Architecture - in a product design with single core functionalities that could serve different vertical domains, a clean Separation of Concerns prompted decoupling of application logic from vertical domains specifics. What emerged was the Ports and Adapters components definitive of Hexagonal Architecture.

And none of these emerged from prior study of System Design patterns.

What emerged were (apparently) the correct structures, the right decisions, shaped by one thing in common:

**"Exactly the problem and constraints that need to be satisfied"**

#### Summary

My take, and I'll acknowledge there are different types of minds and learners, is that there is an alternative to studying as a method of learning about architecture - one that is rooted in clear and penetrative thinking to see precisely what the problem needs. 

And this is the same pre-condition to applying the right studied architectural patterns in the first place.