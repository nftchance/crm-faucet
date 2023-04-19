# 💧 Faucet: Driving Higher Conversion Rates in Web3

![Faucet](./cover.png)

This repository contains a CRM-seeding mechanism that constantly watches the social-doxxing endpoints of the public graph found in Web3. Driven by the leaky opsec of high-power individuals, Faucet illustrates the power of social engineering and targeted approaches in Web3.

With growth dominated by the ability to self-align with a product audience, Faucet removes the social moat that exists between a new creator and success. Instead, every person instantly has access to a highly detailed social network without having to do any of the work or time investment.

## 📚 Background

When marketing a product, a targeted approach is often the most effective. This is especially true in Web3 where the social moat is the primary barrier to entry. Faucet is a tool that allows anyone to change their social position by opening the doors of every social network and individual in Web3.

Using the framework and data already released to the public, Faucet serves as a data-aggregator intended to only be used as the starting point.

Before Faucet you could define your audience, but not know who they were. Now, you can define your audience and know exactly who they are in a matter of minutes.

## 📖 How it works

Faucet is a simple script that uses the public graph to find all of the social networks of a given address. It then uses the social networks to find all of the social networks of the people in those networks. This process is repeated until the desired depth is reached.

## 🚀 Getting Started

Getting rolling with Faucet is incredibly easy and meant to only serve as a slow-rate consumption mechanism. The server is designed to constantly run and it will only stop when you tell it to. With self-imposed rate limits, managed dumping of stale data and a simple interface, Faucet is ready to spin up and start working for you.

### 🏃‍♂️ Running  

Getting up and running with Faucet is as simple as configuring your environment variables by:

* copy-pasting `.env.example`
* rename it to `.env`
* set the values of the variables

and then running the following command:

```bash
docker compose up --build --remove-orphans
```

### 📝 Usage

With Faucet running, you can access the following endpoints:

* `[/](http://localhost:8000/)` - The root endpoint that returns an API overview.
* `[/docs/](http://localhost:8000/docs/)` - The endpoint used to view the API documentation.
* `[/generator/](http://localhost:8000/generator/)` - The endpoint used to manage and view source generators.
* `[/source/](http://localhost:8000/source/)` - The endpoint used to manage and view sources.
