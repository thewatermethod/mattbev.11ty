---
title: A GitHub action for running Django tests
author:
image:
url:
date: 2025-03-18
tags: [dev]
type: post
excerpt:
---

Spent a weird amount of time on this. Turns out I had it right immediately but I for some reason had added my migrations to ```.gitignore```. 

I think I did this because I didn't want to commit a bunch of WIP migrations when stuff was being recreated from scratch every month or two when I got back to this side project. Mental note for the future - probably not a wise practice.

Anyway here it is - could certainly refactor the variable names to reduce some duplication, but I think you get the idea.

```sh
name: Django Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.10"

      - name: Install Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run Tests
        run: |
          python manage.py test
        env:
          # The hostname used to communicate with the PostgreSQL service container
          POSTGRES_HOST: postgres
          POSTGRES_PORT: 5432
          DATABASE_PORT: 5432
          DATABASE_PASSWORD: postgres
          DATABASE_USER: postgres
          DATABASE_NAME: postgres