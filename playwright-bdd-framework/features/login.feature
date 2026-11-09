# Feature files describe behavior in readable Gherkin, independently of implementation.
Feature: Login functionality

  @smoke
  Scenario: Successful login with valid credentials
    Given I navigate to the login page
    When I enter valid username and password
    And I click the login button
    Then I should be successfully logged in

  @regression
  Scenario: Login with invalid credentials
    Given I navigate to the login page
    When I enter invalid username and password
    And I click the login button
    Then I should see a login error message
