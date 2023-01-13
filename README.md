<div align="center" style='margin-top: 20px'>
    <a href="https://swashapp.io/" target="blank">
        <img src="https://swashapp.io/static/images/logo/swash/s-logo.svg" width="80" alt="Swash Logo" />
    </a>
</div>

<div align="center">
    <b>Swash, reimagining data ownership</b>
</div>

# Swash Data Product Provider Client

Swash Data Product Provider SDK is a simple Typescript project that helps the users to create a data request, check the status of the request, buy a data and download the data with this SDK in their projects without any UI.

# Issues & Questions

For reporting issues or asking questions please use the [github issues](https://github.com/swashapp/services/issues) or contact [support@swashapp.io](mailto://support@swashapp.io).

# Getting Started

Before getting started, you need to install the [latest LTS version of nodejs](https://nodejs.org/en/download/). Also, It is better to use yarn as package manager, for this purpose you can use the following instruction:

```bash
# Install via npm
npm install --global yarn

# Install via Chocolatey
choco install yarn

# Install via Scoop
scoop install yarn

yarn --version
```

## How to install dependencies

Installing all the dependencies is just simple as running one of the following commands:

NPM:

```bash
npm install
```

Yarn:

```bash
yarn install
```

## How to deploy in production

### Build

First you have to build the project by the following command:

NPM:

```bash
npm run build
```

Yarn:

```bash
yarn run build
```

### Bundle

Running build command will compile, optimize and minify the source code and will save the output in the build directory in the root of project. Now you have to add this SDK as a dependency of your project.

## Client Creation

When you want to use SDK you have to create new instance of DataProviderClient. As you know this client helps you order your data requests, and the requests have to be validated and authenticated, So you have to define your authentication mechanisem to communicate with Swash stack.

### Private Key

If you have an valid ethereum account, then Its private key could be used for authentication.
To prepare your desire data, your account is in charge of paying data fee, therefore you have to define related provider.

Authentication with private key:

```bash
const dppClient = new DataProviderClient({
    auth: {
        privateKey: 'your-private-key',
        provider: 'ether-wallet-provider',
    }
})
```

### Web3

If you want to use the client in your browser, and have a MetaMask account, you can create a web3 from window.ethereum and use that for authentication.

Authentication with web3:

```bash
const dppClient = new DataProviderClient({
    auth: {
        web3: new Web3(window.ethereum),
    }
})
```

### Access Token

If you have an access token, the client can use that as an authentication key. However, providing an ethereum account(web3 or privateKey) is necessary.

Authentication with token:

```bash
const dppClient = new DataProviderClient({
    auth: {
        web3: new Web3(window.ethereum),
        session: {
            token: 'your-access-token',
            onExpired: () => logout()
        }
    }
})
```

## Data Requests

Data prepration process is introduced by data request. You can define various filters to reach your desire data by adding a data request.

| Method | Description                         |
| :----- | :---------------------------------- |
| getAll | returns list of your data requests  |
| add    | creates a data request with filters |

For example:

```bash
dppClient.dataRequest.add(`DataRequestDetails`)
```

Table below shows data request management capabilities of DataProviderClient, for a data request with an id you can use this methods:

| Method   | Description                                                  |
| :------- | :----------------------------------------------------------- |
| provide  | provides data based on request                               |
| get      | returns a data request                                       |
| delete   | removes a data request                                       |
| getPrice | returns price of data including `Network Fee` and `Data Fee` |

For example:

```bash
dppClient.dataRequest.with(`your-request-id`).get()
```

## Data Lake

Swash data lakes schema is accessible using data provider client. It may helpful to define filters and requests appropriately.

| Method            | Description                         |
| :---------------- | :---------------------------------- |
| getSchema         | returns schema of data lake         |
| getAcceptedValues | returns accepted values for a field |

For example:

```bash
dppClient.dataLake.getSchema(`the-name-of-data-lake`)
```

# API Documentations

| Name              | Description                                                                                    | Input Parameters                                                                                                 | Output Result                    |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| add               | Send Data Request To Data Product Provider Server                                              | DataRequestDetails                                                                                               | DataRequest                      |
| provide           | Purchase data request and prepare                                                              | PurchaseConfig                                                                                                   |                                  |
| delete            | Delete a data request                                                                          |                                                                                                                  |                                  |
| getAll            | List all data requests of user                                                                 |                                                                                                                  | DataRequest[]                    |
| get               | Get data request                                                                               |                                                                                                                  | DataRequest                      |
| getPrice          | Get data request price                                                                         |                                                                                                                  | {title: string, price: number}[] |
| getSchema         | Get the data lake details by its name e.g: VISITATION, SEARCH_REQUEST, SEARCH_RESULT, SHOPPING | The data lake name that can be one of these values:<br>ENUM: VISITATION, SEARCH_REQUEST, SEARCH_RESULT, SHOPPING | DataLakeSchema                   |
| getAcceptedValues | Get the accepted values for one column, e.g. for the sex column male and female are acceptable | The column name, e.g. country                                                                                    | string[]                         |

## **DataRequestDetails**

| **Name**    | **Description**                                        | **Type**     |
| ----------- | ------------------------------------------------------ | ------------ |
| params      | JSON format of all request parameter                   | RequestParam |
| fileName    | The file name of data that system crete after purchase | string       |
| requestDate | The date of the request                                | number       |

## **DataRequest**

|   **Field Name**   |                                                      **Description**                                                       |          **Type**           |
| :----------------: | :------------------------------------------------------------------------------------------------------------------------: | :-------------------------: |
|         id         |                                                         Identifier                                                         |           string            |
|       params       |                                            JSON format of all request parameter                                            |        RequestParam         |
| userAccountAddress |                                               The wallet address of the user                                               |           string            |
|    requestHash     | The hash of data request that is readonly field and can be used for purchasing data and will be created by the dpp backend |           string            |
|      fileName      |                                    The file name that data must be saved with this name                                    |           string            |
|    requestDate     |                                                  The Date Of The Request                                                   |           number            |
|    productType     |           The name of the product tha is used for purchasing and is fix and its value is "data-product-provider"           |           string            |
|       status       |                                                 The status of the request                                                  | Enum: DRAFT, PENDING, PAYED |
|     requestJob     |                                                                                                                            |         RequestJob          |

## **Request Parameters**

|  **Field Name**  | **Description** |     **Type**      |
| :--------------: | :-------------: | :---------------: |
|     dataType     |                 |      string       |
|    repeatType    |                 |      string       |
| selectedDbFields |                 |     string[]      |
| filterCondition  |                 | QueryBuilderModel |

## **RequestJob**

|   **Field Name**    |             **Description**              |                **Type**                |
| :-----------------: | :--------------------------------------: | :------------------------------------: |
|         id          |                Identifier                |                 string                 |
|       status        |          The Status Of The Job           | Enum: DRAFT, STARTED, FAILED, FINISHED |
|     result_path     |        The file path of the data         |                 string                 |
|    repeat_style     |                                          |   ENUM: WEEKLY, MONTHLY, DAILY, ONCE   |
| last_execution_time |                                          |                  date                  |
|      meta_data      |        the result of AWS command         |                  JSON                  |
|      run_count      | number of execution of the job if failed |                 number                 |

## **PurchaseConfig**

| **Field Name** |       **Description**       | **Type** |
| :------------: | :-------------------------: | :------: |
|   tokenName    | The token name for purchase |  string  |
|   networkID    | The network id for purchase |  string  |

## **DataProductDto**

|  **Field Name**  | **Description** |      **Type**       |
| :--------------: | :-------------: | :-----------------: |
|        id        |                 |       string        |
|       name       |                 |       string        |
|   description    |                 |       string        |
| dataDictionaries |                 | DataDictionaryDto[] |

## **DataDictionaryDto**

| **Field Name** | **Description** | **Type** |
| :------------: | :-------------: | :------: |
|       id       |                 |  string  |
|      name      |                 |  string  |
|     title      |                 |  string  |
|  description   |                 |  string  |
|     sample     |                 |  string  |

## **How to create request parameter JSON?**

Let's start with an example:

```json
{
  "params": {
    "fromDate": 1642414746814,
    "toDate": 1673518689839,
    "dataType": "VISITATION",
    "repeatType": "ONCE",
    "selectedDpFields": [
      "browser_name",
      "platform",
      "os_name",
      "os_version",
      "Country",
      "Gender"
    ],
    "filterCondition": {
      "combinator": "and",
      "rules": [
        {
          "id": "r-0.9092211207828882",
          "field": "country",
          "operator": "in",
          "valueSource": "value",
          "value": "Australia,Turkey"
        }
      ],
      "id": "g-0.4676271133369242",
      "not": false
    }
  },
  "fileName": "test",
  "requestDate": 1667390981356
}
```

In this JSON, the parameter fields contain this information:

- dataType that determines which type of data user wants and must be one of these values: VISITATION, SEARCH_REQUEST, SEARCH_RESULT, SHOPPING
- repeatType If user want to get the data only one time this field must have ONCE , and the other values must be WEEKLY, MONTHLY or DAILY that means this data must be generated each week or each month or each day
- selectedDpFields is an array of acceptable column name based on repeatType. You can call loadDataProductByName function and pass the repeatType to it and read the dataDictionaries fields to see the name and the other details of all acceptable columns of this dataType.
- filterCondition you can see this link to know how to create filter query based on your data columns: [QueryBuilderModel](https://react-querybuilder.js.org/docs/api/querybuilder) to find out the acceptable value for each column you can call the getAcceptedValues function and send the column name to it and get an array as a result.

#Requirement before using

# Copyright

Copyright © Swashapp.io 2022. All rights reserved.
