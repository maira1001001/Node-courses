<!-- @format -->

# JS testing

> Why do we test?

To be sure that our code behave as we expecte. If the code does not solve the problem we want to solve, then the testing practice will tell us that there are some unexpected values or wrong behaviour. We identify an unexpected value or a wrong behaviour as a bug.

> How does testing tell developers that there are bugs?

The testing framework prints error messages

> What kind of bug are there?

security, accessibility, authentication, memory leaks, business logic, and so on.

> How do we prevent bugs?

1. static typing ([flow](https://flow.org/), [typescript](https://flow.org/))
2. linting, [eslint](https://www.npmjs.com/package/eslint)
3. testing techniques ([TDD](https://en.wikipedia.org/wiki/Test-driven_development))

> What kind of testing can we do?

1. unit testing
2. integration testing
3. end-to-end testing
4. stress testing
5. penetration testing
6. regression testing
7. i18n testing

and so on

> How should the user of the software verify that this software is working properly?

What a big question!

# Unit testing

# UnitTesting.errorMessages

One thing it is important, is the _error message_, because it tell us where the bug is.

> How would you make your error message more descriptive?

> How could be the error message more readable?

1. using `describe` or `test` functions

```
test('isPasswordAllowed only allows some passwords', () => { ... })
```

2. dividing the _valid inputs_ (`allowedPassword`) from the _invalid outputs_ (`disallowedPassword`)

```
describe('isAllowedPassword', () => {
  const allowedPassword = [ 'asd1234', '123*asd.45' ]
  const disallowedPassword = ['', '123456', 'abcderf', '12ab']
  allowedPassword.forEach((psw) => {
    it(`"${psw}": should be allowed`, () => {
      expect(isPasswordAllowed(psw)).toBe(true)
    })
  })
  disallowedPassword.forEach((psw) => {
    it(`"${psw}": should not be allowed`, () => {
      expect(isPasswordAllowed(psw)).toBe(false)
    })
  })
})
```

# About Jest

## Jest.colocation

> How jest find the testing files?

Two ways:

1. using the Jest convention (`__test__` convention)
2. defining the colocation on a set up file (location in `./jest.config.js`)

Although, there is a principle that it is very usefull to remember:

_principle_: `Place files as close to where they are relevant as possible`

That means that unit testing may not be in the same folder as integration testing.

## 1. `__test__` convention

```
- src
    - controllers
        - __tests__
    - routes
        - __tests__
    - utils
        - __tests_
- test
```

- `/src/controllers/__tests__` In this folder we find _unit testing_ and the testing of each controller.
- `/src/routes/__tests__` In this folder we find _integration testing_ and the testing of each endpoint
- `/src/utils/__tests__` In this folder we find _unit testing_ and the testing of each utility, such as the authentication.
- `/test` In this folder we could find a test helper. This folder should be defined in a jest file configuration because this folder does not follow the convention.

## 2. location in `./jest.config.js`

```
module.exports = {
  displayName: 'server',
  testURL: 'http://localhost',
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src', '<rootDir>/test'],
}
```

# module recommendes

1. [Jest-in-case](https://github.com/atlassian/jest-in-case): Jest utility for creating variations of the same test

# Coverage

> How can be sure we implement all the tests? `coverage` tool

there is a tool that helps developer to track a measure of how many percentage of testing has been implemented.

- [Istanbul](https://www.npmjs.com/package/istanbul): it reports coverage. It tells developers what lines of code have been run.

> Can we drive the test by code coverage exclusively? NO!, it is a bad idea!

The coverage should not be taken as an indicator of confidence.

Instad, we can remember an usefull principle:

> "The most your test resemble the way your software is used, the more confidence they can give you"

# mocks

## mocks. pure unit testing

_Pure unit testing_ Test all the functions in one file without testing all the dependencies.

for example,

```
import {userToJSON, getUserToken} from '../utils/auth'
import db from '../utils/db'

function authorize(req, res, next) {}

async function getUsers(req, res) {}

async function getUser(req, res) {}

async function updateUser(req, res) {}

async function deleteUser(req, res) {}

export {getUsers, getUser, updateUser, deleteUser, authorize
```

> How do we achieve pure function testing wiith this example?

We should test:

1. `authorize` function
1. `getUsers` function
1. `getUser` function
1. `updateUser` function
1. `deleteUser` function

But, We should mock:

1. `userToJSON` function
2. `getUserToken` function
3. `db` function

## mocks. schemas

Two ways of data comparion:

1. compare exactly with the expected values `expect(user).toEqual({name: 'Mai'})`
2. define an schema to compare `expect(user).toEqual({name: expect.any(String)})`

# integration testing

With integration testing we are covering a lot more of our code.

> What kind of tasks it coves?

An integration test needs to _start up a server_. So it makes the execution slower. It could also query the database.

> What do we win with integration testing?

More coverage, but it is complicated to get through an specific part of the program and find where it is broken.

> What is the point of unit testing if integration testing covers all the parts?

Well, it is complicated to figure out what it is going on when tests are broken

> Should we test edge cases with integration testing? When should I use integration testing?  
> Everytime you need, but remember that integration testing is so easy to break because it covers so much parts.

# new incomings!!

> How muchs time should we spend writing testing?

> How much time should we spend writing unit testing, integration testing and end-to-end testing?

There are few questions that are not answered yet, although these questions give me an entrance to re-think these feature while i am testing.
