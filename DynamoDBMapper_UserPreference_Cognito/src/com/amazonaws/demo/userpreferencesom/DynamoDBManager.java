/*
 * Copyright 2010-2012 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 * 
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

package com.amazonaws.demo.userpreferencesom;

import android.util.Log;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.mobileconnectors.dynamodbv2.dynamodbmapper.DynamoDBAttribute;
import com.amazonaws.mobileconnectors.dynamodbv2.dynamodbmapper.DynamoDBHashKey;
import com.amazonaws.mobileconnectors.dynamodbv2.dynamodbmapper.DynamoDBMapper;
import com.amazonaws.mobileconnectors.dynamodbv2.dynamodbmapper.DynamoDBScanExpression;
import com.amazonaws.mobileconnectors.dynamodbv2.dynamodbmapper.DynamoDBTable;
import com.amazonaws.mobileconnectors.dynamodbv2.dynamodbmapper.PaginatedScanList;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.CreateTableRequest;
import com.amazonaws.services.dynamodbv2.model.DeleteTableRequest;
import com.amazonaws.services.dynamodbv2.model.DescribeTableRequest;
import com.amazonaws.services.dynamodbv2.model.DescribeTableResult;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.KeyType;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ResourceNotFoundException;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;

import java.util.ArrayList;

public class DynamoDBManager {

    private static final String TAG = "DynamoDBManager";

    /*
     * Creates a table with the following attributes: Table name: testTableName
     * Hash key: userNo type N Read Capacity Units: 10 Write Capacity Units: 5
     */
    public static void createTable() {

        Log.d(TAG, "Create table called");

        AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                .ddb();

        KeySchemaElement kse = new KeySchemaElement().withAttributeName(
                "requestID").withKeyType(KeyType.HASH);
        AttributeDefinition ad = new AttributeDefinition().withAttributeName(
                "requestID").withAttributeType(ScalarAttributeType.N);
        ProvisionedThroughput pt = new ProvisionedThroughput()
                .withReadCapacityUnits(10l).withWriteCapacityUnits(5l);

        CreateTableRequest request = new CreateTableRequest()
                .withTableName(Constants.TEST_TABLE_NAME)
                .withKeySchema(kse).withAttributeDefinitions(ad)
                .withProvisionedThroughput(pt);

        try {
            Log.d(TAG, "Sending Create table request");
            ddb.createTable(request);
            Log.d(TAG, "Create request response successfully recieved");
        } catch (AmazonServiceException ex) {
            Log.e(TAG, "Error sending create table request", ex);
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }
    }

    /*
     * Retrieves the table description and returns the table status as a string.
     */
    public static String getTestTableStatus() {

        try {
            AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                    .ddb();

            DescribeTableRequest request = new DescribeTableRequest()
                    .withTableName(Constants.TEST_TABLE_NAME);
            DescribeTableResult result = ddb.describeTable(request);

            String status = result.getTable().getTableStatus();
            return status == null ? "" : status;

        } catch (ResourceNotFoundException e) {
        } catch (AmazonServiceException ex) {
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }

        return "";
    }

    /*
     * Inserts ten users with userNo from 1 to 10 and random names.
     */
    /*
    public static void insertUsers() {
        AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                .ddb();
        DynamoDBMapper mapper = new DynamoDBMapper(ddb);

        try {
            for (int i = 1; i <= 10; i++) {
                UserPreference userPreference = new UserPreference();
                userPreference.setUserNo(i);
                userPreference.setFirstName(Constants.getRandomName());
                userPreference.setLastName(Constants.getRandomName());

                Log.d(TAG, "Inserting users");
                mapper.save(userPreference);
                Log.d(TAG, "Users inserted");
            }
        } catch (AmazonServiceException ex) {
            Log.e(TAG, "Error inserting users");
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }
    }
    */

    /*
     * Scans the table and returns the list of users.
    */
    public static ArrayList<RequestedDishes> getAllRequestedDishesist() {

        AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                .ddb();
        DynamoDBMapper mapper = new DynamoDBMapper(ddb);

        DynamoDBScanExpression scanExpression = new DynamoDBScanExpression();
        try {
            PaginatedScanList<RequestedDishes> result = mapper.scan(
                    RequestedDishes.class, scanExpression);

            ArrayList<RequestedDishes> resultList = new ArrayList<RequestedDishes>();
            for (RequestedDishes up : result) {
                resultList.add(up);
            }
            return resultList;

        } catch (AmazonServiceException ex) {
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }

        return null;
    }

    /*
     * Retrieves all of the attribute/value pairs for the specified user.
     */
    public static RequestedDishes getCustomerRequestedDishes(String userID) {

        AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                .ddb();
        DynamoDBMapper mapper = new DynamoDBMapper(ddb);

        try {
            RequestedDishes  customerDishes = mapper.load(RequestedDishes.class,
                    userID);

            return customerDishes;

        } catch (AmazonServiceException ex) {
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }

        return null;
    }

    /*
     * Updates one attribute/value pair for the specified user.
     */
    /*
    public static void updateUserPreference(RequestedDishes updateUserPreference) {

        AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                .ddb();
        DynamoDBMapper mapper = new DynamoDBMapper(ddb);

        try {
            mapper.save(updateUserPreference);

        } catch (AmazonServiceException ex) {
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }
    }
    */


    /*
     * Deletes the specified user and all of its attribute/value pairs.
     */
    /*
    public static void deleteUser(UserPreference deleteUserPreference) {

        AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                .ddb();
        DynamoDBMapper mapper = new DynamoDBMapper(ddb);

        try {
            mapper.delete(deleteUserPreference);

        } catch (AmazonServiceException ex) {
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }
    }
    */

    /*
     * Deletes the test table and all of its users and their attribute/value
     * pairs.
     */
    public static void cleanUp() {

        AmazonDynamoDBClient ddb = UserPreferenceDemoActivity.clientManager
                .ddb();

        DeleteTableRequest request = new DeleteTableRequest()
                .withTableName(Constants.TEST_TABLE_NAME);
        try {
            ddb.deleteTable(request);

        } catch (AmazonServiceException ex) {
            UserPreferenceDemoActivity.clientManager
                    .wipeCredentialsOnAuthError(ex);
        }
    }

    @DynamoDBTable(tableName = Constants.TEST_TABLE_NAME)
    public static class RequestedDishes {
        //UserPreference
        //customerDishes

        private String requestID;
        private String dishName;
        private String userID;
        //private Boolean autoLogin;
        //private Boolean vibrate;
        //private Boolean silent;
        //private String colorTheme;

        @DynamoDBHashKey(attributeName = "requestID")
        public String getRequestID() {
            return requestID;
        }

        public void setRequestID(String requestID) {
            this.requestID = requestID;
        }

        @DynamoDBAttribute(attributeName = "dishName")
        public String getDishName() {
            return dishName;
        }

        public void setDishName(String dishName) {
            this.dishName = dishName;
        }

        @DynamoDBAttribute(attributeName = "userID")
        public String getUserID() {
            return userID;
        }

        public void setUserID(String userID) {
            this.userID = userID;
        }

        /*
        @DynamoDBAttribute(attributeName = "autoLogin")
        public Boolean isAutoLogin() {
            return autoLogin;
        }

        public void setAutoLogin(Boolean autoLogin) {
            this.autoLogin = autoLogin;
        }

        @DynamoDBAttribute(attributeName = "vibrate")
        public Boolean isVibrate() {
            return vibrate;
        }

        public void setVibrate(Boolean vibrate) {
            this.vibrate = vibrate;
        }

        @DynamoDBAttribute(attributeName = "silent")
        public Boolean isSilent() {
            return silent;
        }

        public void setSilent(Boolean silent) {
            this.silent = silent;
        }

        @DynamoDBAttribute(attributeName = "colorTheme")
        public String getColorTheme() {
            return colorTheme;
        }

        public void setColorTheme(String colorTheme) {
            this.colorTheme = colorTheme;
        }
        */
    }
}
