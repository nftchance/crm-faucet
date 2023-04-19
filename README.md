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

* Copy-pasting `.env.example`
* Rename it to `.env`
* Set the values of the variables
    1. `ALCHEMY_KEY` - Your [Alchemy](https://www.alchemy.com/) key.
    2. `SHROOM_KEY` - Your [ShroomDK](https://sdk.flipsidecrypto.xyz/shroomdk) key.

With your static files prepared all that is left to do is running the following command:

```bash
docker compose up --build --remove-orphans
```

### 📝 Usage

With Faucet running, you can access the following endpoints:

* [/](http://localhost:8000/) - The root endpoint that returns an API overview.
* [/docs/](http://localhost:8000/docs/) - The endpoint used to view the API documentation.
* [/generator/](http://localhost:8000/generator/) - The endpoint used to manage and view source generators.
* [/source/](http://localhost:8000/source/) - The endpoint used to manage and view sources.

### 🏭 Creating a Generator

Generators are the key driving function of Faucet. They are responsible for taking a source and generating a new source. The new source is then used to generate another source and so on. Starting as a Flipside query, Faucet can generate a source that contains all of the social networks for an audience while keeping everything in sync without manual maintenance in the future.

To create a generator, navigate to the API page of the [generator](http://localhost:8000/generator/) endpoint.

When creating your Generator, you will need to provide the following information:

1. `is_active` - Whether or not the generator is active.
    * If the generator is not active, Faucet will not run it.
2. `name` - The name of the generator.
    * This is used to identify the generator.
3. `trigger` - The trigger that will be used to start the generator.
    * This can be a cron expression or a time interval. In the API interface you can choose from a dropdown of ranging frequencies.
4. `request_type` - The type of request that will be used to start the generator.
    * This can either be `SQL` or `HTTP`.
    * When using `SQL`, the request will be retrieved from Flipside using Shroom.DK.
    * When using `HTTP`, the request will be sent to the endpoint specified in `request_body`.
5. `request_body` - The body of the request that will be used to start the generator.
    * This can either be a SQL query or a HTTP endpoint.
    * When using `SQL`, this is the query you would like to run on Flipside.
    * When using `HTTP`, the request will be sent to the endpoint specified in `request_body`.
6. `response_column` - The column that will be used to start the generator.
    * When the response is returned, this is the column that will be used to create new Sources.

**For example:**

When working on ✨ [Charlie](https://github.com/nftchance/charlie) we wanted to create a Generator that would track the sources of individuals involved with onchain governance. With the following query, we can find all of the addresses that have had a governance token delegated to them by an address that wasn't themselves.

```sql
WITH ethereum_contracts AS
(
	SELECT  BLOCK_TIMESTAMP
	       ,CONTRACT_NAME
	       ,CONTRACT_ADDRESS
	       ,EVENT_INPUTS
           ,ORIGIN_FROM_ADDRESS
	FROM ethereum.core.fact_event_logs
	WHERE TOPICS[0] = '0x3134e8a2e6d97e929a7e54011ea5485d7d196dd5f0ba4d4ef95803e8e3fc257f' 
), ethereum_delegates AS (
SELECT  DISTINCT(EVENT_INPUTS:toDelegate) AS "Delegate"
FROM ethereum_contracts
WHERE EVENT_INPUTS:toDelegate <> ORIGIN_FROM_ADDRESS 
GROUP BY  1 )
SELECT  *
FROM ethereum_delegates
GROUP BY  "Delegate"
```

With this ready, we will set the following values:

* `is_active` - `true`
* `name` - `Governance Delegates`
* `trigger` - `* * * * *` (every minute)
* `request_type` - `SQL`
* `request_body` - `<query above>`
* `response_column` - `delegate`

As simple as that, Faucet will now start generating new sources for all of the addresses that have been delegated to.
