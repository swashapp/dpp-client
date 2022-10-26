<div align="center">
    <a href="https://swashapp.io/" target="blank">
        <img src="https://swashapp.io/static/images/logo/swash/s-logo.svg" width="80" alt="Swash Logo" />
    </a>
</div>

<div align="center">
    <b>Swash, reimagining data ownership</b>
</div>

# Swash Data Product Provider SDK

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


# API Documentations


|Name|Description|Input Parameters|Output Result|
|----|-----------|----------------|-------------|
|addRequest|Send Data Request To Data Product Provider Server| DataRequestDto | DataRequestDto |
|getAllRequests|load ALL Data Request By User AWS ID|AWS ID as string|DataRequestDto[]|
|getRequestById|load Data Request By ID|requestId as string|DataRequestDto|
|buyRequest|Buy A Request By ID|||
|getRequestStatus|Get The status Of The Request By ID|requestId as string|status as string|
|getDownloadLink|Get The S3 Path Of The Request By ID|requestId as string|downloadLink as string|
|loadDataProductByName|get the data product details by its name e.g: visitation, shopping, …|The data product name that can be one of these values:<br>ENUM: VISITATION, SEARCH\_REQUEST, SEARCH\_RESULT, SHOPPING|DataProductDto[]|
|getAcceptedValues|get the accepted values for one column, e.g. for the sex column male and female are acceptable|The column name, e.g. country|string[]|

## **Add Request Input Parameters**

|**Name**|**Description**|**Type**|
|----|-----------|-------------|
|params|JSON format of all request parameter|RequestParam|
|fileName| |string|

## **Request Parameters**

|    **Field Name**    |**Description**|**Type**|
|:-------------:|:---------:|:----:|  
|dataType| |string|
|repeatType| |string|
|selectedDbFields| |string[]|
|filterCondition| |QueryBuilderModel|

## **DataRequestDto**

|**Field Name**|**Description**|**Type**|
|:-------:|:---------:|:----:|  
|id|Identifier|string|
|params|JSON format of all request parameter|RequestParam|
|userAccountAddress|The wallet address of the user|string|
|savingDirectory|The file directory that data must be stored|string|
|fileName|The file name that data must be saved with this name|string|
|s3Path|The full file path that system generate for saving data|string|
|userAwsId|The AWS ID Of the User|string|
|requestDate|The Date Of The Request|date|
|status|The status of the request|Enum: DRAFT, PAYED|
|requestJob||RequestJobDto|
## **RequestJobDto**

|**Field Name**|**Description**|**Type**|
|:-------------:|:---------:|:----:|  
|id|Identifier|string|
|status|The Status Of The Job|Enum: DRAFT, STARTED, FAILED, FINISHED|
|result\_path|The file path of the data|string|
|repeat\_style| |ENUM: WEEKLY, MONTHLY, DAILY, ONCE|
|last\_execution\_time| |date|
|meta\_data|the result of AWS command|JSON |
|run\_count|number of execution of the job if failed|number|

## **DataProductDto**

|**Field Name**|**Description**|**Type**|
|:-------------:|:---------:|:----:|  
|id| |string|
|name| |string|
|description| |string|
|dataDictionaries| |DataDictionaryDto[]|

## **DataDictionaryDto**

|**Field Name**|**Description**|**Type**|
|:-------------:|:---------:|:----:|  
|id| |string|
|name| |string|
|title| |string|
|description| |string|
|sample| |string|


**How to create request parameter JSON?**
-----------------------------------------
Let's start with an example:
```json
{

        params: {

          dataType: 'VISITATION',

          repeatType: 'ONCE',

          selectedDpFields: [

            'user\_agent\_str',

            'browser\_name',

            'browser\_ver',

            'platform',

            'os\_name',

            'os\_version',

            'UserId',

          ],

          filterCondition: {

            combinator: 'and',

            rules: [

              {

                id: 'r-0.8400281364485467',

                field: 'os\_name',

                operator: 'in',

                valueSource: 'value',

                value: 'mac,linux',

              },

            ],

            id: 'g-0.8096738078816702',

            not: false,

          },

        },

        requestDate: new Date().getTime(),

        userAccountAddress:walletAddress,

        s3Path:

          's3://swash-data-product-provider-bucket/SC\_User\_' +

          new Date().getTime() +

          '/info',

        status: 'DRAFT',

      },

    }
```

In this JSON, the parameter fields contain this information:

- dataType that determines which type of data user wants and must be one of these values: VISITATION, SEARCH\_REQUEST, SEARCH\_RESULT, SHOPPING
- repeatType If user want to get the data only one time this field must have ONCE , and the other values must be WEEKLY, MONTHLY or DAILY that means this data must be generated each week or each month or each day
- selectedDpFields is an array of acceptable column name based on repeatType. You can call loadDataProductByName function and pass the repeatType to it and read the dataDictionaries fields to see the name and the other details of all acceptable columns of this dataType.
- filterCondition you can see this link to know how to create filter query based on your data columns: [QueryBuilderModel](https://react-querybuilder.js.org/docs/api/querybuilder) to find out the acceptable value for each column you can call the getAcceptedValues function and send the column name to it and get an array as a result.

#Requirement before using



# Copyright

Copyright © Swashapp.io 2022. All rights reserved.
