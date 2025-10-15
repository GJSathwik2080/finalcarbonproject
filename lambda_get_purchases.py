import json
import boto3
import logging
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
purchases_table = dynamodb.Table('Purchases')

def lambda_handler(event, context):
    # Enable logging for debugging
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info('Received event: %s', json.dumps(event))
    
    # Get UserId from query parameters
    user_id = event.get('queryStringParameters', {}).get('UserId')
    
    if not user_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "UserId query parameter missing"})
        }
    
    # Query DynamoDB by UserId as partition key
    response = purchases_table.query(
    IndexName='UserId-index',
    KeyConditionExpression=Key('UserId').eq(user_id)
    )
    items = response.get('Items', [])
    
    return {
        "statusCode": 200,
        "body": json.dumps(items, default=str)
    }
