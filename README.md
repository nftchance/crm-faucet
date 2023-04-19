# 💧 Faucet: Higher Conversion Rates in Web3

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

## 🏭 Creating a Generator

Generators are the key driving function of Faucet. They are responsible for taking a source and generating a new source. The new source is then used to generate another source and so on.

Starting as a [Flipside](https://flipsidecrypto.xyz) query, Faucet can generate a source that contains all of the social networks for an audience while keeping everything in sync without manual maintenance in the future.

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
    * When using `SQL`, the request will be retrieved from [Flipside](https://flipsidecrypto.xyz) using [ShroomDK](https://sdk.flipsidecrypto.xyz/shroomdk).
    * When using `HTTP`, the request will be sent to the endpoint specified in `request_body`.
5. `request_body` - The body of the request that will be used to start the generator.
    * This can either be a SQL query or a HTTP endpoint.
    * When using `SQL`, this is the query you would like to run on Flipside.
    * When using `HTTP`, the request will be sent to the endpoint specified in `request_body`.
6. `response_column` - The column that will be used to start the generator.
    * When the response is returned, this is the column that will be used to create new Sources.

### 📝 Example

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

```json
{
    "count": 9686,
    "next": "http://localhost:8000/sources/?page=2",
    "previous": null,
    "results": [
        {
            "id": 9686,
            "url": "http://localhost:8000/sources/9686/",
            "identifiers": [],
            "is_active": true,
            "address": "0x37736cb01e41a7ad592fc3b3e472787769b3234d",
            "created": "2023-04-19T05:04:23.545393Z",
            "updated": "2023-04-19T05:04:23.545404Z"
        },
        {
            "id": 9685,
            "url": "http://localhost:8000/sources/9685/",
            "identifiers": [],
            "is_active": true,
            "address": "0x1ce139b73dbc1d855e4b360856ac3885558fc5f8",
            "created": "2023-04-19T05:04:23.545359Z",
            "updated": "2023-04-19T05:04:23.545370Z"
        },
        {
            "id": 9684,
            "url": "http://localhost:8000/sources/9684/",
            "identifiers": [],
            "is_active": true,
            "address": "0x1bdbcbee53572deb2c1ea6d65479bd5e7b0afe25",
            "created": "2023-04-19T05:04:23.545324Z",
            "updated": "2023-04-19T05:04:23.545336Z"
        },
        {
            "id": 9683,
            "url": "http://localhost:8000/sources/9683/",
            "identifiers": [],
            "is_active": true,
            "address": "0x8c19e0b2502405ad1cb52aa34269f5e90ee65aa5",
            "created": "2023-04-19T05:04:23.545291Z",
            "updated": "2023-04-19T05:04:23.545302Z"
        },
        {
            "id": 9682,
            "url": "http://localhost:8000/sources/9682/",
            "identifiers": [
                {
                    "id": 2488,
                    "source_type": "twitter_username",
                    "value": "joebart",
                    "created": "2023-04-19T05:05:27.456357Z",
                    "updated": "2023-04-19T05:05:27.456361Z",
                    "source": 9682
                },
                {
                    "id": 2487,
                    "source_type": "ens_name",
                    "value": "joebart",
                    "created": "2023-04-19T05:05:27.456345Z",
                    "updated": "2023-04-19T05:05:27.456348Z",
                    "source": 9682
                },
                {
                    "id": 2486,
                    "source_type": "email",
                    "value": "joebart@hey.com",
                    "created": "2023-04-19T05:05:27.456332Z",
                    "updated": "2023-04-19T05:05:27.456336Z",
                    "source": 9682
                }
            ],
            "is_active": true,
            "address": "0x6c94b001b64374e50061e23e99756a3978a63270",
            "created": "2023-04-19T05:04:23.545256Z",
            "updated": "2023-04-19T05:04:23.545268Z"
        }
    ]
}
```

Now with this running, within seconds we have ~10,000+ people to target with our marketing and sales efforts. As more time goes on and we add more generators, we will be able to target more and more people with an increasingly accurate picture of who they are, what they care about and how to get in target them.

Once you have everything running, just leave it running. The system will manage itself and you can focus on building the best product possible.

### 📚 Community Generator Examples

It can be difficult to get started with generators, so we have put together a few examples to help you get started. Feel free to use these as a starting point for your own generators. You can find detailed documentation how to write queries with [Flipside](http://flipsidecrypto.xyz) on the [GitBook](https://docs.flipsidecrypto.com/our-app/getting-started).

#### ⏰ Foundation Bidders

```sql
SELECT  unique_bidder
       ,MAX(block_timestamp) AS most_recent_date
FROM
(
    SELECT  DISTINCT event_inputs:bidder::string AS unique_bidder
            ,block_timestamp
    FROM ethereum.core.fact_event_logs
    WHERE event_name = 'ReserveAuctionFinalized'
    AND block_timestamp >= DATEADD(day, -366, CURRENT_TIMESTAMP)
    AND event_inputs:bidder::string IS NOT NULL 
)
GROUP BY  unique_bidder
ORDER BY most_recent_date DESC;
```

#### 🖼️ Foundation Sellers

```sql
SELECT  unique_seller
       ,MAX(block_timestamp) AS most_recent_date
FROM
(
    SELECT  DISTINCT event_inputs:seller::string AS unique_seller
           ,block_timestamp
    FROM ethereum.core.fact_event_logs
    WHERE event_name = 'ReserveAuctionFinalized'
    AND block_timestamp >= DATEADD(day, -366, CURRENT_TIMESTAMP)
    AND event_inputs:seller::string IS NOT NULL 
)
GROUP BY  unique_seller
ORDER BY most_recent_date DESC;
```

#### 🏷️ Badge Holders

```sql
WITH balances AS
(
    SELECT  DISTINCT t.nft_to_address
            ,(
    SELECT  SUM(erc1155_value)
    FROM polygon.core.ez_nft_transfers
    WHERE nft_address = t.nft_address
    AND nft_to_address = t.nft_to_address
    AND tokenid = t.tokenid ) AS "In", (
    SELECT  COALESCE(SUM(erc1155_value),0)
    FROM polygon.core.ez_nft_transfers
    WHERE nft_address = t.nft_address
    AND nft_from_address = t.nft_to_address
    AND tokenid = t.tokenid ) AS "Out", ("In" - "Out") AS balance
    FROM polygon.core.ez_nft_transfers t
    WHERE nft_address = '{{organization_address}}'
    AND tokenid = {{token_id}}
    AND ("In" - "Out") > 0 
), holders AS
(
    SELECT  DISTINCT nft_to_address
    FROM balances
)
SELECT  *
FROM holders;
```
