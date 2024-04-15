## Mockopejr

> HTTP & GraphQL response mock and data generator

- **HTTP:** HTTP mocks based on dynamimic URLs
- **GraphQL:** GraphQL mocks without GQL schema definition, with simplified flow based on the similarity of GQL query and mock sample data
- **Custom JSON schemas**: custom schema definitions with JSON charts
- **Expression parser:** minimalistic JSON expression parser for dynamic properties/objects
- **Random data generator:** generation of random data of similar type and structure
- **CLI:** CLI for template pre-generation
- **OpenAI support:** Just for fun, use OpenAI language models for expression based data generation (```{"JoeBidenBorn": "#USE_GPT(the year joe biden was born, number)}```)

```     
         (\_/)   
      M--(O.C)--K
    / `;=/ M \=;` \
    \__| \___/ |__/
        \(_|_)/
         "   "
```      

### Example

Create your data sample schema with Mockopejr expression language
```
{
  "type": "graphql",
  "schema": {
      "example": {
        "intRange": "#RANGE(1,6)",
        "floatRange": "#RANGE_FLOAT(1.12,1.22,3)",
        "dateRange": "#DATE_RANGE(2016-01-01,2016-12-31)",
        "dateTimeRange": "#DATETIME_RANGE_ISO(2016-01-01T12:14:10,2016-01-01T12:15:10)",
        "stringify": "#STRINGIFY({prop:value})",
        "enum": "#ENUM(value1,value2,value3)",
        "insert": "#INSERT(prefix,suffix,-INSERTED-)",
        "compoundInsert": "#INSERT(prefix,suffix,#ENUM(insert1,insert2))",
        "randomBoolean": "#BOOLEAN()",
        "counter1": "#COUNTER(someCounterId,1)",
        "counter2": "#COUNTER(someOtherCounterId,2)",
        "compoundCounter": "#INSERT(prefix,suffix,#COUNTER(someOtherOtherCounterId,3))",
        "uuid": "#UUID()",
        "czechGirlFirstname": "#USE_GPT(czech girl firstname, format like :::name:::)",
        "JoeBidenBorn": "#USE_GPT(the year joe biden was born, number)",
        "arrayProp": [
           { "#REPEAT": 5 },
            {
              "arrayCounter": "#COUNTER(someArrayCounterId,1)"
            }
          ]
        }
  },
  "keys": ["example", "arrayProp"],
  "config": {
    "arrayify": 0,
    "mimicMode": "exact"
  }
}
```

Call GraphQL or HTTP:

```
{
  example{
    intRange
    floatRange
    dateRange
    dateTimeRange
    stringify
    enum
    insert
    compoundInsert
    .....
  }
}
```

Get your data response:

```
{
  "example": {
    "intRange": 5,
    "floatRange": 1.175,
    "dateRange": "2016-02-04",
    "dateTimeRange": "2016-01-01T11:14:21.647Z",
    "stringify": "{prop:value}",
    "enum": "value1",
    "insert": "prefix-INSERTED-suffix",
    "compoundInsert": "prefixinsert2suffix",
    "randomBoolean": true,
    "counter1": 1,
    "counter2": 2,
    "compoundCounter": "prefix3suffix",
    "uuid": "b600adfd-4e64-4486-b0be-e7ef63be786f",
    "czechGirlFirstname": "Eva",
    "JoeBidenBorn": 1942,
    "arrayProp": [
      {
        "arrayCounter": 1
      },
      {
        "arrayCounter": 2
      },
      {
        "arrayCounter": 3
      },
      {
        "arrayCounter": 4
      },
      {
        "arrayCounter": 5
      }
    ]
  }
}
```

### Installation

Package install:

```
$ yarn install
```

.env variable if you want to use expressions with OpenAI language models

```
OPEN_AI_KEY=xxx
```

.env variable for the port on which HTTP and GraphQL mocks will be available

```
PORT=8080
```

Start with Nodemon for automatic server reload after chart update

```
$ yarn run start
```

### Usage

Charts

- chart is your basic pattern for mocking response
- two types of charts: HTTP & GraphQL

sample HTTP chart:

```
{
  "type": "http",
  "schema": {
    "name": "Jane",
    "surname: "Doe",
    "items": [1,2,3,4]
  },
  "url": "/api/users/:id",
  "config": {
    "arrayify": 0,
    "mimicMode": "exact"
  },
  "method": "GET"
}
```

- chart will be available on GET route `/api/users/:id`
- all (hope so) HTTP methods are available

sample GraphQL chart:

```
{
  "type": "graphql",
  "schema": {
    "name": "Jane",
    "surname: "Doe",
    "items": [1,2,3,4]
  },
  "keys": [
    "users",
    "name",
  ],
  "config": {
    "arrayify": 0,
    "mimicMode": "exact"
  }
}
```

- chart will be available on route `PORT/graphql`

### Creating charts

- manually inserting into the `__CHARTS__` folder as a JSON file
- using the CLI
- `yarn run cli template --t http` for HTTP chart (default)
- `yarn run cli template --t graphql` for GraphQL chart
- automatic server/charts reload - after the change in the `__CHARTS__` folder, the application will restart automatically and the server will reload all HTTP and GraphQL routes/charts
- follow the server log for info/errors

### HTTP routing

- HTTP dynamic routes with params, queries etc.
- HTTP methods (GET, POST, PUT...)

example:
`/api/reservations/:id_reservation/guests/:id_guest`

### GraphQL execution

- there is no "true" GraphQL server like Apollo etc.
- all calls to url `/graphql` are evaluated online by an algorithm looking for the closest similarity between the keys/nodes defined in the JSON chart definition and the sample data

GraphQL chart 1:

```
{
  "type": "graphql",
  "schema": {
    "name": "Jane",
    "surname: "Doe",
    "items": [1,2,3,4]
  },
  "keys": [
    "users",
    "name",
  ],
  "config": {
    "arrayify": 0,
    "mimicMode": "exact"
  }
}
```

GraphQL chart 2:

```
{
  "type": "graphql",
  "schema": {
    "name": "Jane",
    "surname: "Doe",
    "items": [1,2,3,4],
    "address": {
        "street":"Downing"
    }
  },
  "keys": [
    "users",
    "name",
  ],
  "config": {
    "arrayify": 0,
    "mimicMode": "exact"
  }
}
```

GraphQL query called on route /graphql

```
{
    user {
        name
        surname
        address
    }
}
```

Mockopejr returns data/mock from `GraphQL chart 2` because it evaluates the keys/nodes in the schema as more similar because 
of ```address``` key

example on 3 arrays and sample input:
```
 const graphqlSchemaKeys = [['a', 'b', 'c'], ['a', 'b', 'd'], ['a', 'b', 'c', 'd']]
 const graphqlInputQuery = ['a', 'b', 'c']
 const result = ['a', 'b', 'c']
```

in case of the same number of hits, the chart with the lower total number of keys is preferred


### Expression parser

Expressions can be found in the ```src/parsing``` folder in the ```__DICTIONARY__.ts``` file, where it is possible to expand them at will

Default supported expressions and binding here: [__DICTIONARY__.ts](./src/parsing/__DICTIONARY__.ts)

### Chart configs

```
  "config": {
    "arrayify": 0,
    "mimicMode": "exact"
  }
```

- arrayify: if > 0, creates array on response bases on schema data
- mimicMode: `exact` / `randomize`
- if randomize, each schema property will be randomized based on JSON type and structure
- if strict, all properties (except #EXPRESSIONS) will be kept the same

### Wildcards

- priority instructions that Mockopejr evaluates before executing each request
- `errorCode` - request ends with a defined HTTP error code
- `delayMs` - the request will wait for a response until the end of the delay

examples:

```
http://localhost:8080/graphql?errorCode=400
```

```
http://localhost:8080/api/users/1234?delayMs=3000
```
